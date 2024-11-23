import { z } from "zod";
import { db } from "~/server/db";
import { connection, SolanaWallet } from "~/server/solana-wallet";

export const UserCreatedSchema = z.object({
  data: z.object({
    id: z.string(),
  }),
});

export async function POST(request: Request) {
  const userId = UserCreatedSchema.parse(await request.json()).data.id;
  const wallet = SolanaWallet.create(connection);
  await db.account.create({
    data: {
      owner: userId,
      secretKey: Buffer.from(wallet.secretKey),
    },
  });
}
