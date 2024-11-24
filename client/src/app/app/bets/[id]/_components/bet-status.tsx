import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { CalendarIcon, DollarSignIcon } from "lucide-react";
import { type Challenge } from "@prisma/client";
import { StatusBadge } from "~/components/status-badge";
import { type User } from "@clerk/backend";

export default function BetStatus({
  challenge,
}: {
  challenge: Omit<Challenge, "challenger" | "challenged"> & {
    challenger: User;
    challenged: User;
  };
}) {
  const { title, challenger, challenged, amount, status, dueDate } = challenge;

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Avatar>
              <AvatarImage
                src={challenger.imageUrl}
                alt={challenger.fullName ?? ""}
              />
            </Avatar>
            <span className="font-semibold">{challenger.fullName}</span>
          </div>
          <span className="text-lg font-bold">VS</span>
          <div className="flex items-center space-x-4">
            <span className="font-semibold">{challenged.fullName}</span>
            <Avatar>
              <AvatarImage
                src={challenged.imageUrl}
                alt={challenged.fullName ?? ""}
              />
            </Avatar>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <DollarSignIcon className="h-5 w-5 text-green-500" />
            <span className="font-semibold">Amount:</span>
          </div>
          <span className="text-lg font-bold">
            {(Number(amount) / 100).toFixed(2)}€
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            <span className="font-semibold">Due Date:</span>
          </div>
          <span>{dueDate.toLocaleDateString()}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-semibold">Status:</span>
          <StatusBadge status={status as string} />
        </div>
      </CardContent>
    </Card>
  );
}
