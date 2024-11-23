import { Header } from "./_components/header";
import { LandingPage } from "./landing";

export default async function Home() {
  return (
    <main>
      <Header />
      <LandingPage />
    </main>
  );
}
