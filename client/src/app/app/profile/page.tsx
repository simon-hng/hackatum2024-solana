import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { connection, serverWallet, SolanaWallet } from "~/server/solana-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Coins, Wallet } from "lucide-react";
import Image from "next/image";

export default async function ProfilePage() {
  const user = await currentUser();
  if (!user) {
    return <div>Loading...</div>;
  }

  let account = await db.account.findFirst({ where: { owner: user.id } });
  if (!account) {
    const wallet = SolanaWallet.create(connection);
    account = await db.account.create({
      data: {
        owner: user.id,
        secretKey: Buffer.from(wallet.secretKey),
      },
    });
  }

  const wallet = SolanaWallet.fromSecretKey(connection, account.secretKey);
  let walletBalance = 0;
  try {
    walletBalance = await wallet.getEURCBalance();
  } catch {
    await wallet.createEURCAccount(serverWallet.keypair);
    walletBalance = await wallet.getEURCBalance();
  }

  const walletLink = `https://explorer.solana.com/address/${wallet.eurcAccount.toBase58()}?cluster=devnet`;

  return (
    <div className="flex h-svh w-svw items-center justify-center p-5">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Hello {user.firstName ?? ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-[24px_1fr] gap-4">
            <Wallet className="h-6 w-6 self-center text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">EURC Account</p>
              <a href={walletLink} className="break-all font-mono text-sm">
                {wallet.eurcAccount.toBase58()}
              </a>
            </div>
            <Coins className="h-6 w-6 self-center text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">EURC Balance</p>
              <p className="text-xl font-semibold">
                {walletBalance.toFixed(2)}€
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
