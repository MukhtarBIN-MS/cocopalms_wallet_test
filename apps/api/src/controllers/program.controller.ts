import { RequestHandler } from "express";
import { z } from "zod";
import { CreateProgramSchema } from "../validators/program";
import { Program } from "../models/Program";
import { createGiftCardClass } from "../services/googleWallet";
import { ah } from "../utils/asyncHandler";

export const listPrograms: RequestHandler = ah(async (_req, res) => {
  const items = await Program.find().sort({ createdAt: -1 });
  res.json({ items });
});

export const createProgram: RequestHandler = ah(async (req, res) => {
  const parsed = CreateProgramSchema.safeParse(req.body);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    // Send a human string + keep details (so FE can show per-field later if desired)
    return res.status(400).json({
      error: "Validation failed",
      details: { formErrors: flat.formErrors, fieldErrors: flat.fieldErrors },
    });
  }

  const { name, description, amount, expiryDate, themeUrl } = parsed.data;
  const { classId } = await createGiftCardClass(name);

  const prog = await Program.create({
    name,
    description,
    amount,
    expiryDate: expiryDate ? new Date(expiryDate) : undefined,
    themeUrl,
    gwClassId: classId,
  });
  res.status(201).json({ item: prog });
});

export const removeProgram: RequestHandler = ah(async (req, res) => {
  const { id } = z.object({ id: z.string() }).parse(req.params);
  await Program.findByIdAndDelete(id);
  res.status(204).end();
});
