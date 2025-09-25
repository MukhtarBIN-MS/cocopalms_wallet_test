"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("../db/mongoose");
const Admin_1 = require("../models/Admin");
const env_1 = require("../config/env");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
(async () => {
    const existing = await Admin_1.Admin.findOne({ email: env_1.env.ADMIN_EMAIL });
    if (existing) {
        console.log("Admin already exists:", existing.email);
        process.exit(0);
    }
    const hash = await bcryptjs_1.default.hash(env_1.env.ADMIN_PASSWORD, 10);
    await Admin_1.Admin.create({ email: env_1.env.ADMIN_EMAIL, passwordHash: hash });
    console.log("Admin created:", env_1.env.ADMIN_EMAIL);
    process.exit(0);
})();
