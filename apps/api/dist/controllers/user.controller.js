"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserAndIssue = exports.listUsers = void 0;
const user_1 = require("../validators/user");
const Program_1 = require("../models/Program");
const User_1 = require("../models/User");
const GiftCard_1 = require("../models/GiftCard");
const googleWallet_1 = require("../services/googleWallet");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.listUsers = (0, asyncHandler_1.ah)(async (_req, res) => {
    const items = await User_1.User.find().sort({ createdAt: -1 }).lean();
    res.json({ items });
});
exports.createUserAndIssue = (0, asyncHandler_1.ah)(async (req, res) => {
    const parsed = user_1.CreateUserSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { fullName, dob, phone, email, programId } = parsed.data;
    const program = await Program_1.Program.findById(programId);
    if (!program)
        return res.status(404).json({ error: "Program not found" });
    if (!program.gwClassId)
        return res.status(400).json({ error: "Program missing Wallet class" });
    // create wallet object
    const { objectId, saveLink } = await (0, googleWallet_1.createGiftCardObject)({
        classId: program.gwClassId,
        userFullName: fullName,
        userEmail: email,
    });
    const user = await User_1.User.create({
        fullName,
        dob: dob ? new Date(dob) : undefined,
        email,
        phone,
        programId: program._id,
        gwObjectId: objectId,
        gwSaveLink: saveLink,
    });
    await GiftCard_1.GiftCard.create({
        userId: user._id,
        programId: program._id,
        gwClassId: program.gwClassId,
        gwObjectId: objectId,
        saveLink: saveLink,
    });
    res.status(201).json({ item: user });
});
