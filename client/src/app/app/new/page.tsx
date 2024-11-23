import React from "react";
import { CameraFeed } from "./camera-feed";
import { challengeSchema } from "~/lib/schemas/challenge";
import { z } from "zod";
import { db } from "~/server/db";

export default async function NewPage() {
  async function createChallenge(data: z.infer<typeof challengeSchema>) {
    "use server";

    return await db.challenge.create({ data });
  }
  return <CameraFeed submit={createChallenge} />;
}
