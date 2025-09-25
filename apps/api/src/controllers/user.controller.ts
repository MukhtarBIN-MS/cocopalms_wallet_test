import { RequestHandler } from "express";
import { z } from "zod";
import { CreateUserSchema } from "../validators/user";
import { Program } from "../models/Program";
import { User } from "../models/User";
import { GiftCard } from "../models/GiftCard";
import { createGiftCardObject } from "../services/googleWallet";
import { ah } from "../utils/asyncHandler";

export const listUsers: RequestHandler = ah(async (_req, res) => {
  const items = await User.find().sort({ createdAt: -1 }).lean();
  res.json({ items });
});

export const createUserAndIssue: RequestHandler = ah(async (req, res) => {
  const parsed = CreateUserSchema.safeParse(req.body);
  if (!parsed.success)
    return res.status(400).json({ error: parsed.error.flatten() });

  const { fullName, dob, phone, email, programId } = parsed.data;

  const program = await Program.findById(programId);
  if (!program) return res.status(404).json({ error: "Program not found" });
  if (!program.gwClassId)
    return res.status(400).json({ error: "Program missing Wallet class" });

  // create wallet object
  const { objectId, saveLink } = await createGiftCardObject({
    classId: program.gwClassId,
    userFullName: fullName,
    userEmail: email,
  });

  const user = await User.create({
    fullName,
    dob: dob ? new Date(dob) : undefined,
    email,
    phone,
    programId: program._id,
    gwObjectId: objectId,
    gwSaveLink: saveLink,
  });

  await GiftCard.create({
    userId: user._id,
    programId: program._id,
    gwClassId: program.gwClassId,
    gwObjectId: objectId,
    saveLink: saveLink,
  });

  res.status(201).json({ item: user });
});
