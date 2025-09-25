"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateUserSchema = void 0;
const zod_1 = require("zod");
exports.CreateUserSchema = zod_1.z.object({
    fullName: zod_1.z.string().min(2),
    phone: zod_1.z.string().min(11),
    dob: zod_1.z.string().datetime().optional(),
    email: zod_1.z.string().email(),
    programId: zod_1.z.string().min(1),
});
