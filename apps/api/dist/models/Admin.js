"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = require("mongoose");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AdminSchema = new mongoose_1.Schema({
    email: { type: String, unique: true, required: true },
    passwordHash: { type: String, required: true },
}, { timestamps: true });
AdminSchema.methods.compare = function (password) {
    return bcryptjs_1.default.compare(password, this.passwordHash);
};
exports.Admin = (0, mongoose_1.model)("Admin", AdminSchema);
