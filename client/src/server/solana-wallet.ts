import {
  createAssociatedTokenAccountInstruction,
  getAssociatedTokenAddressSync,
  TOKEN_PROGRAM_ID,
  transferChecked,
} from "@solana/spl-token";
import {
  type Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

const LAMPORTS_PER_SOL = 10 ** 9;
const EURC_DEVNET_MINT = new PublicKey(
  "HzwqbKZw8HxMN6bF2yFZNrht3c2iXXzpKcFu7uBEDKtr",
);

export class SolanaWallet {
  get publicKey(): PublicKey {
    return this.keypair.publicKey;
  }

  get secretKey(): Uint8Array {
    return this.keypair.secretKey;
  }

  get eurcAccount(): PublicKey {
    return getAssociatedTokenAddressSync(
      EURC_DEVNET_MINT,
      this.publicKey,
      false,
      TOKEN_PROGRAM_ID,
    );
  }

  constructor(
    private readonly connection: Connection,
    readonly keypair: Keypair,
  ) {}

  static create(connection: Connection): SolanaWallet {
    return new SolanaWallet(connection, Keypair.generate());
  }

  static fromSecretKey(
    connection: Connection,
    secretKey: Uint8Array,
  ): SolanaWallet {
    return new SolanaWallet(connection, Keypair.fromSecretKey(secretKey));
  }

  async getBalance(): Promise<number> {
    return (
      (await this.connection.getBalance(this.keypair.publicKey)) /
      LAMPORTS_PER_SOL
    );
  }

  async createEURCAccount(payer: Keypair | null = null): Promise<void> {
    const payerWallet = payer ?? this.keypair;

    // Create associated token account for EURC
    const createTokenAccountTx = createAssociatedTokenAccountInstruction(
      payerWallet.publicKey,
      this.eurcAccount,
      this.publicKey,
      EURC_DEVNET_MINT,
    );

    // Create and send transaction
    const transaction = new Transaction().add(createTokenAccountTx);

    await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payerWallet],
      {
        commitment: "confirmed",
      },
    );
  }

  async getEURCBalance(): Promise<number> {
    const accountInfo = await this.connection.getTokenAccountBalance(
      this.eurcAccount,
    );
    if (accountInfo === null) {
      throw new Error("cannot find the associated token account");
    }
    return accountInfo.value.uiAmount ?? 0;
  }

  async transferEURC(
    payer: Keypair | null = null,
    to: SolanaWallet,
    amount: number,
  ): Promise<void> {
    await transferChecked(
      this.connection,
      payer ?? this.keypair,
      this.eurcAccount,
      EURC_DEVNET_MINT,
      to.eurcAccount,
      this.keypair,
      amount,
      9,
    );
  }
}
