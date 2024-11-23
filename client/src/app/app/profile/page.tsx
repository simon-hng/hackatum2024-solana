import { currentUser } from "@clerk/nextjs/server";
import { db } from "~/server/db";
import { connection, serverWallet, SolanaWallet } from "~/server/solana-wallet";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Coins, Wallet } from "lucide-react";

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

  const walletLink = `https://explorer.solana.com/address/${wallet.eurcAccount}?cluster=devnet`;

  return (
    <div className="flex h-screen w-screen items-center justify-center p-5">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Profile
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <h2 className="mb-2 text-3xl font-semibold">
              Hello {user.firstName ?? ""}
            </h2>
            <Badge variant="secondary" className="px-3 py-1 text-lg">
              User
            </Badge>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <Wallet className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Your SOL Wallet Public Key:
                </p>
                <a href={walletLink} className="break-all font-mono text-sm">
                  {wallet.eurcAccount.toBase58()}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Coins className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">
                  Your EURC Balance:
                </p>
                <p className="text-xl font-semibold">
                  {walletBalance}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
