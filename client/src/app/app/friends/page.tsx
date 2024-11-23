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

export default async function FriendsPage() {
  const users = await clerk.users.getUserList();
  return (
    <div>
      <h1>Friends</h1>

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
              <TableCell className="font-medium">
                <img src={user.imageUrl} className="rounded-full" />
              </TableCell>
              <TableCell>{user.fullName}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
