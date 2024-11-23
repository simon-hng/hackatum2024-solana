import { AppNavigation } from "./_components/app-navigation";

export default function AppLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div>
      {children}
      <AppNavigation />
    </div>
  );
}
