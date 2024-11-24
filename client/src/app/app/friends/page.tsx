import { clerk } from "~/server/clerk";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@components/ui/table";
import Image from "next/image";

export default async function FriendsPage() {
  const users = await clerk.users.getUserList();
  return (
    <div className="p-4">
      <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
        Friends
      </h2>

      <Table>
        <TableCaption>A list of your friends</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">Image</TableHead>
            <TableHead>Name</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.data.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <Image
                  src={user.imageUrl}
                  alt={user.fullName ?? "User Image"}
                  className="rounded-full"
                  width={50}
                  height={50}
                />
              </TableCell>
              <TableCell>{user.fullName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
