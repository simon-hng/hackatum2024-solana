import { Award, Home, PlusCircle, User, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";

const links = [
  { href: "/app/feed", label: "Feed", icon: Home },
  { href: "/app/friends", label: "Friends", icon: Users },
  { href: "/app/new", icon: PlusCircle },
  { href: "/app/bets", label: "Bets", icon: Award },
  { href: "/app/profile", label: "Profile", icon: User },
];

export const AppNavigation = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "w-full rounded-t border-t-border bg-background shadow",
        className,
      )}
    >
      <nav className={cn("flex justify-between gap-1 p-2", className)}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="fles flex min-w-16 flex-col items-center text-sm"
          >
            <>
              {link.icon && <link.icon />}
              {!!link.label && link.label}
            </>
          </Link>
        ))}
      </nav>
    </div>
  );
};
