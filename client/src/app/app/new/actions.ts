"use server";

import { challengeSchema } from "~/lib/schemas/challenge";
import { z } from "zod";
import { db } from "~/server/db";
import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";

export async function createChallenge(data: z.infer<typeof challengeSchema>) {
  "use server";

  return await db.challenge.create({
    data: {
      ...data,
      amount: Number(data.amount) / 100,
    },
  });
}

export async function parseTranscript(transcript: string) {
  const { text } = await generateText({
    model: openai("gpt-4o"),
    system:
      "Try to parse out a single information from the following transcript. return only the information that is asked for and return nothing else.",
    prompt: transcript,
  });

  return text;
}
