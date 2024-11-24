import { clerk } from "~/server/clerk";
import Image from "next/image";
import { db } from "~/server/db";
import { ExampleCard } from "./example-card";

export default async function BetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await clerk.users.getUser((await params).id);

  if (user.id === "user_2pGeA6LzaquVByS4wNCyUo7kTWV") {
    return (
      <div className="space-y-4 p-4">
        <div className="flex flex-col items-center">
          <Image
            src={user.imageUrl}
            alt={user.fullName ?? "user image"}
            width={80}
            height={80}
            className="rounded-full"
          />
          <h2 className="text-xl font-semibold">{user.fullName}</h2>
        </div>

        <div className="grid gap-4">
          <ExampleCard />
        </div>
      </div>
    );
  }

  const bets = await db.challenge.findMany({
    where: { challenged: user.id },
  });

  return;
}
