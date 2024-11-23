import React from "react";
import { CameraFeed } from "./camera-feed";
import { clerk } from "~/server/clerk";

export default async function NewPage() {
  const users = await clerk.users.getUserList().then((res) =>
    res.data.map((user) => ({
      id: user.id,
      fullName: user.fullName,
      imageUrl: user.imageUrl,
    })),
  );

  return <CameraFeed users={users} />;
}
