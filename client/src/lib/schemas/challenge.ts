import { z } from "zod";

export const challengeSchema = z.object({
  challenger: z.string(),
  challenged: z.string(),
  title: z.string(),
  amount: z.string(),
  dueDate: z.date(),
});
