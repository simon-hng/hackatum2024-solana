import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import { clerk } from "~/server/clerk";
import Image from "next/image";
import { StatusBadge } from "~/components/status-badge";
import Link from "next/link";

export default async function BetsPage() {
  const { userId } = await auth();
  const users = await clerk.users.getUserList();

  const challenges = await db.challenge.findMany({
    where: {
      challenged: userId ?? undefined,
    },
    orderBy: {
      status: "asc",
    },
  });

  const challengeGivers = await db.challenge.findMany({
    where: {
      challenger: userId ?? undefined,
    },
    orderBy: {
      status: "asc",
    },
  });

  return (
    <div className="space-y-4 p-4">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Bets
      </h2>

      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        Bets for you
      </h3>

      {challenges.length === 0 ? (
        <div>No bets yet</div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">From</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Reward</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {challenges.map((challenge) => (
              <TableRow key={challenge.id}>
                <TableCell>
                  <Image
                    src={
                      users?.data.find(
                        (user) => user.id === challenge.challenger,
                      )?.imageUrl ?? ""
                    }
                    className="rounded-full"
                    alt={challenge.title}
                    width={50}
                    height={50}
                  />
                </TableCell>
                <TableCell>
                  <Link href={`bets/${challenge.id}`}>{challenge.title}</Link>
                </TableCell>
                <TableCell>
                  {(Number(challenge.amount) / 100).toFixed(2)}€
                </TableCell>
                <TableCell>
                  <StatusBadge status={challenge.status as string} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
        You are betting
      </h3>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">To</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Reward</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challengeGivers.map((challenge) => (
            <TableRow key={challenge.id}>
              <TableCell>
                <Image
                  src={
                    users?.data.find((user) => user.id === challenge.challenged)
                      ?.imageUrl ?? ""
                  }
                  className="rounded-full"
                  alt={challenge.title}
                  width={50}
                  height={50}
                />
              </TableCell>
              <TableCell>{challenge.title}</TableCell>
              <TableCell>
                {(Number(challenge.amount) / 100).toFixed(2)}€
              </TableCell>
              <TableCell>
                <StatusBadge status={challenge.status as string} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
