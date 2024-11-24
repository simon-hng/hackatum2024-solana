import { AppNavigation } from "./_components/app-navigation";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen flex-col justify-between">
      {children}
      <AppNavigation />
    </div>
  );
}
