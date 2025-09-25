import { z } from "zod";

export const CreateUserSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(11),
  dob: z.string().datetime().optional(),
  email: z.string().email(),
  programId: z.string().min(1),
});
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
