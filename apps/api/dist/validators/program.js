"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProgramSchema = void 0;
const zod_1 = require("zod");
exports.CreateProgramSchema = zod_1.z.object({
    name: zod_1.z.string().min(2),
    description: zod_1.z.string().optional(),
    amount: zod_1.z.number().nonnegative(),
    expiryDate: zod_1.z.string().datetime().optional(),
    themeUrl: zod_1.z.string().url().optional(),
});
