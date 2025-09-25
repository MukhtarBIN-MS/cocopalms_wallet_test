"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const UserSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    dob: Date,
    email: { type: String, required: true, lowercase: true },
    programId: { type: mongoose_1.Schema.Types.ObjectId, ref: "Program", required: true },
    gwObjectId: String,
    gwSaveLink: String,
}, { timestamps: true });
exports.User = (0, mongoose_1.model)("User", UserSchema);
