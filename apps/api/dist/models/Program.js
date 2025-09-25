"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Program = void 0;
const mongoose_1 = require("mongoose");
const ProgramSchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    description: String,
    amount: { type: Number, required: true, min: 0 },
    expiryDate: Date,
    themeUrl: String,
    gwClassId: String,
}, { timestamps: true });
exports.Program = (0, mongoose_1.model)("Program", ProgramSchema);
