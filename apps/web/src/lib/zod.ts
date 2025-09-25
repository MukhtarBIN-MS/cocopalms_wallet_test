import { z } from "zod";
export const LoginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
export const ProgramSchema = z.object({ name: z.string().min(2), amount: z.number().nonnegative() });
export const UserSchema = z.object({ fullName: z.string().min(2), email: z.string().email(), programId: z.string() });
