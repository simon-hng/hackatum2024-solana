import { Toaster } from "sonner";
import { AppNavigation } from "./_components/app-navigation";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <main>
      <div className="flex h-svh flex-col justify-between">
        {children}
        <AppNavigation />
      </div>
      <Toaster />
    </main>
  );
}
