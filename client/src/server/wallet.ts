import { Connection } from "@solana/web3.js";
import { SolanaWallet } from "./solana-wallet";

const createDevnetConnection = () =>
  new Connection("https://api.devnet.solana.com", "confirmed");

async function main() {
  const connection = createDevnetConnection();
  const wallet = SolanaWallet.fromSecretKey(
    connection,
    new Uint8Array([
      61, 159, 155, 69, 138, 0, 219, 134, 248, 47, 82, 250, 236, 138, 199, 130,
      93, 63, 198, 248, 81, 174, 7, 101, 3, 232, 221, 7, 234, 191, 120, 205, 35,
      47, 84, 52, 180, 87, 68, 215, 189, 154, 218, 4, 128, 224, 188, 84, 110,
      72, 31, 213, 50, 135, 112, 215, 145, 68, 249, 43, 98, 150, 55, 134,
    ]),
  );

  console.log(await wallet.getEURCBalance());
}

await main();
