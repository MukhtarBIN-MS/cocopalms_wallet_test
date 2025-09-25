"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeProgram = exports.createProgram = exports.listPrograms = void 0;
const zod_1 = require("zod");
const program_1 = require("../validators/program");
const Program_1 = require("../models/Program");
const googleWallet_1 = require("../services/googleWallet");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.listPrograms = (0, asyncHandler_1.ah)(async (_req, res) => {
    const items = await Program_1.Program.find().sort({ createdAt: -1 });
    res.json({ items });
});
exports.createProgram = (0, asyncHandler_1.ah)(async (req, res) => {
    const parsed = program_1.CreateProgramSchema.safeParse(req.body);
    if (!parsed.success) {
        const flat = parsed.error.flatten();
        // Send a human string + keep details (so FE can show per-field later if desired)
        return res.status(400).json({
            error: "Validation failed",
            details: { formErrors: flat.formErrors, fieldErrors: flat.fieldErrors },
        });
    }
    const { name, description, amount, expiryDate, themeUrl } = parsed.data;
    const { classId } = await (0, googleWallet_1.createGiftCardClass)(name);
    const prog = await Program_1.Program.create({
        name,
        description,
        amount,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        themeUrl,
        gwClassId: classId,
    });
    res.status(201).json({ item: prog });
});
exports.removeProgram = (0, asyncHandler_1.ah)(async (req, res) => {
    const { id } = zod_1.z.object({ id: zod_1.z.string() }).parse(req.params);
    await Program_1.Program.findByIdAndDelete(id);
    res.status(204).end();
});
