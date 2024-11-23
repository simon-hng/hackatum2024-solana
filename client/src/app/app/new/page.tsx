import React from "react";
import { CameraFeed } from "./camera-feed";
import { challengeSchema } from "~/lib/schemas/challenge";
import { z } from "zod";
import { db } from "~/server/db";
import { clerk } from "~/server/clerk";

export default async function NewPage() {
  const users = await clerk.users.getUserList().then((res) =>
    res.data.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
    })),
  );
  async function createChallenge(data: z.infer<typeof challengeSchema>) {
    "use server";

    return await db.challenge.create({ data });
  }
  return <CameraFeed submit={createChallenge} users={users} />;
}
