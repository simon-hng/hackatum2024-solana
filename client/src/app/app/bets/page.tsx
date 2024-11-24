import { auth } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";

export default async function BetsPage() {
  const { userId } = await auth();

  const challenges = await db.challenge.findMany({
    where: {
      challenged: userId ?? undefined,
    },
  });

  return (
    <div>
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Bets
      </h2>

      <Table>
        <TableCaption>A list challenges</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {challenges.map((challenge) => (
            <TableRow key={challenge.id}>
              <TableCell>{challenge.title}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
