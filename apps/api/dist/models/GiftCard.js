"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GiftCard = void 0;
const mongoose_1 = require("mongoose");
const GiftCardSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    programId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Program", required: true },
    gwClassId: String,
    gwObjectId: String,
    saveLink: String,
}, { timestamps: true });
exports.GiftCard = (0, mongoose_1.model)("GiftCard", GiftCardSchema);
