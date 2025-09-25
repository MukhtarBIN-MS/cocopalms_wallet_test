import { z } from "zod";

export const CreateProgramSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  amount: z.number().nonnegative(),
  expiryDate: z.string().datetime().optional(),
  themeUrl: z.string().url().optional(),
});
export type CreateProgramInput = z.infer<typeof CreateProgramSchema>;
