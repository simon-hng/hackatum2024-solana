use anchor_lang::prelude::*;
use anchor_spl::token_interface::{TokenAccount, TransferChecked};

declare_id!("AKFumrtB9vrdLZVhUQJb8orYF5s2ijHxTTXRXtPo3w6q");

#[program]
pub mod challenge {
    use super::*;    

    pub fn initialize(
        ctx: Context<Initialize>,
        challenger: Pubkey, 
        challengee: Pubkey,
        amount: u64,
    ) -> Result<()> {
        let challenge: &mut Account<'_, Challenge> = &mut ctx.accounts.challenge;
        challenge.judge = ctx.accounts.signer.key();
        challenge.challenger = challenger;
        challenge.challengee = challengee;
        challenge.amount = amount;
        challenge.resolved = false;
        challenge.bump = ctx.bumps.challenge;
        Ok(())
    }

    pub fn resolve_to_challengee(ctx: Context<Resolve>) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        if challenge.judge != ctx.accounts.signer.key() {
            return err!(ChallengeError::NotJudge);
        }

        if challenge.resolved {
            return err!(ChallengeError::AlreadyResolved);
        }

        let accounts = TransferChecked {
            from: ctx.accounts.challengee,
            mint: "4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU", // USDC Solana devnet mint
            to: challenge.challengee,
            au
        };

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        init,
        payer = signer,
        seeds = [b"challenge"],
        bump,   
        space = 8 + Challenge::INIT_SPACE
    )]
    pub challenge: Account<'info, Challenge>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Resolve<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"challenge"],
        bump = challenge.bump,
    )]
    pub challenge: Account<'info, Challenge>,
}

#[account]
#[derive(InitSpace)]
pub struct Challenge<'info> {
    pub judge: Pubkey,
    pub challenger: Pubkey,
    pub challengee: Account<'info, TokenAccount>,
    pub amount: u64,
    pub resolved: bool,
    pub bump: u8,
}

#[error_code]
pub enum ChallengeError {
    #[msg("Challenge can only be resolved by the judge")]
    NotJudge,
    #[msg("Challenge has already been resolved")]
    AlreadyResolved,
}
