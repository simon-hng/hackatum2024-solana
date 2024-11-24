import BetStatus from "~/app/app/bets/[id]/_components/bet-status";
import { clerk } from "~/server/clerk";
import { db } from "~/server/db";

export default async function BetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const challenge = await db.challenge.findUnique({
    where: { id: Number((await params).id) },
  });

  if (!challenge) {
    return null;
  }

  const users = await clerk.users.getUserList();

  return (
    <div className="space-y-4 p-4">
      <BetStatus
        challenge={{
          ...challenge,
          challenger: users.data.find(
            (user) => user.id === challenge.challenger,
          )!,
          challenged: users.data.find(
            (user) => user.id === challenge.challenged,
          )!,
        }}
      />
    </div>
  );
}
