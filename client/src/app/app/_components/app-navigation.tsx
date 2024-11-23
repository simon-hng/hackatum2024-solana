import { Award, Home, PlusCircle, User, Users } from "lucide-react";
import Link from "next/link";
import { cn } from "~/lib/utils";

const links = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/friends", label: "Friends", icon: Users },
  { href: "/new", icon: PlusCircle },
  { href: "/bets", label: "Bets", icon: Award },
  { href: "/profile", label: "Profile", icon: User },
];

export const AppNavigation = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "bg-background border-t-border fixed bottom-0 left-0 w-full rounded-t shadow",
        className,
      )}
    >
      <nav className={cn("flex justify-between gap-1 p-2", className)}>
        {links.map((link) => (
          <Link
            key={link.href}
            href={`./${link.href}`}
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
