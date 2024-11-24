import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    PENDING: {
      label: "Pending",
      className:
        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    },
    ACCEPTED: {
      label: "Accepted",
      className:
        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    },
    DECLINED: {
      label: "Declined",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    FAILED: {
      label: "Failed",
      className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    },
    COMPLETED: {
      label: "Completed",
      className:
        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    },
  };

  if (!statusConfig[status]) {
    return null;
  }

  const { label, className } = statusConfig[status];

  return (
    <Badge variant="secondary" className={cn("font-medium", className)}>
      {label}
    </Badge>
  );
}
