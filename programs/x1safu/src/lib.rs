use anchor_lang::prelude::*;
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer, MintTo, Burn};

// X1SAFU - Secure Savings Protocol on X1 Blockchain
// 1 X1SAFE = 1 USD equivalent at deposit time

declare_id!("x1saf111111111111111111111111111111111111111");

// Burn address (system program)
pub const BURN_ADDRESS: &str = "11111111111111111111111111111111";

#[program]
pub mod x1safu {
    use super::*;

    // Initialize the vault state
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let vault = &mut ctx.accounts.vault;
        vault.authority = ctx.accounts.authority.key();
        vault.total_tvl = 0;
        vault.x1safe_mint = ctx.accounts.x1safe_mint.key();
        
        // Set up backing assets
        vault.usdc_mint = ctx.accounts.usdc_mint.key();
        vault.xen_mint = ctx.accounts.xen_mint.key();
        vault.xnt_mint = ctx.accounts.xnt_mint.key();
        vault.xnm_mint = ctx.accounts.xnm_mint.key();
        
        Ok(())
    }

    // Deposit backing assets and mint X1SAFE tokens
    pub fn deposit(ctx: Context<Deposit>, amount: u64, asset_type: AssetType) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        
        // Get oracle price for the asset
        let price = get_oracle_price(&asset_type)?;
        let usd_value = (amount as u128)
            .checked_mul(price as u128)
            .ok_or(ErrorCode::MathOverflow)?
            .checked_div(1_000_000) // Adjust for decimals
            .ok_or(ErrorCode::MathOverflow)? as u64;
        
        require!(usd_value > 0, ErrorCode::InvalidUsdValue);
        
        // Transfer backing asset from user to vault
        let cpi_accounts = Transfer {
            from: ctx.accounts.user_asset_account.to_account_info(),
            to: ctx.accounts.vault_asset_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);
        token::transfer(cpi_ctx, amount)?;
        
        // Mint X1SAFE tokens to user (1:1 with USD value)
        let cpi_accounts_mint = MintTo {
            mint: ctx.accounts.x1safe_mint.to_account_info(),
            to: ctx.accounts.user_x1safe_account.to_account_info(),
            authority: ctx.accounts.vault.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let seeds = &[b"vault".as_ref(), &[ctx.bumps.vault]];
        let signer = &[&seeds[..]];
        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts_mint, signer);
        token::mint_to(cpi_ctx, usd_value)?;
        
        // Update user position
        let position = &mut ctx.accounts.user_position;
        position.owner = ctx.accounts.user.key();
        position.deposit_value_usd = usd_value;
        position.exit_rights = true;
        position.backing_asset = asset_type;
        position.backing_amount = amount;
        
        // Update vault TVL
        let vault = &mut ctx.accounts.vault;
        vault.total_tvl = vault.total_tvl
            .checked_add(usd_value)
            .ok_or(ErrorCode::MathOverflow)?;
        
        emit!(DepositEvent {
            user: ctx.accounts.user.key(),
            asset: asset_type,
            amount,
            usd_value,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Exit - burn X1SAFE and return original backing
    pub fn exit(ctx: Context<Exit>) -> Result<()> {
        let position = &ctx.accounts.user_position;
        require!(position.exit_rights, ErrorCode::NoExitRights);
        
        let usd_value = position.deposit_value_usd;
        let asset_type = position.backing_amount;
        
        // Burn X1SAFE tokens from user
        let cpi_accounts_burn = Burn {
            mint: ctx.accounts.x1safe_mint.to_account_info(),
            from: ctx.accounts.user_x1safe_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(),
        };
        let cpi_program = ctx.accounts.token_program.to_account_info();
        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts_burn);
        token::burn(cpi_ctx, usd_value)?;
        
        // Return backing asset to user
        let backing_amount = position.backing_amount;
        let vault_key = ctx.accounts.vault.key();
        let asset_mint = match position.backing_asset {
            AssetType::USDC => ctx.accounts.vault.usdc_mint,
            AssetType::XEN => ctx.accounts.vault.xen_mint,
            AssetType::XNT => ctx.accounts.vault.xnt_mint,
            AssetType::XNM => ctx.accounts.vault.xnm_mint,
        };
        
        // Transfer from vault to user (implementation simplified)
        // In production, would use PDA-derived token accounts
        
        // Update vault TVL
        let vault = &mut ctx.accounts.vault;
        vault.total_tvl = vault.total_tvl
            .checked_sub(usd_value)
            .ok_or(ErrorCode::MathOverflow)?;
        
        // Close user position
        let position = &mut ctx.accounts.user_position;
        position.exit_rights = false;
        
        emit!(ExitEvent {
            user: ctx.accounts.user.key(),
            usd_value,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }

    // Withdraw X1SAFE to wallet (lose exit rights)
    pub fn withdraw(ctx: Context<Withdraw>, amount: u64) -> Result<()> {
        require!(amount > 0, ErrorCode::InvalidAmount);
        
        let position = &mut ctx.accounts.user_position;
        require!(position.exit_rights, ErrorCode::AlreadyWithdrawn);
        
        // Transfer X1SAFE to user's wallet account
        // (Tokens already in user's token account, just revoke rights)
        
        // Revoke exit rights
        position.exit_rights = false;
        
        emit!(WithdrawEvent {
            user: ctx.accounts.user.key(),
            amount,
            timestamp: Clock::get()?.unix_timestamp,
        });
        
        Ok(())
    }
}

// Accounts
#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + VaultState::SIZE,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, VaultState>,
    
    /// CHECK: X1SAFE mint account
    pub x1safe_mint: AccountInfo<'info>,
    
    /// CHECK: USDC mint
    pub usdc_mint: AccountInfo<'info>,
    /// CHECK: XEN mint
    pub xen_mint: AccountInfo<'info>,
    /// CHECK: XNT mint
    pub xnt_mint: AccountInfo<'info>,
    /// CHECK: XNM mint
    pub xnm_mint: AccountInfo<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Deposit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, VaultState>,
    
    #[account(
        init_if_needed,
        payer = user,
        space = 8 + UserPosition::SIZE,
        seeds = [b"position", user.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
    
    #[account(mut)]
    pub user_asset_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub vault_asset_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub user_x1safe_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub x1safe_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Exit<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, VaultState>,
    
    #[account(
        mut,
        seeds = [b"position", user.key().as_ref()],
        bump,
        close = user
    )]
    pub user_position: Account<'info, UserPosition>,
    
    #[account(mut)]
    pub user_x1safe_account: Account<'info, TokenAccount>,
    
    #[account(mut)]
    pub x1safe_mint: Account<'info, Mint>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"vault"],
        bump
    )]
    pub vault: Account<'info, VaultState>,
    
    #[account(
        mut,
        seeds = [b"position", user.key().as_ref()],
        bump
    )]
    pub user_position: Account<'info, UserPosition>,
}

// State
#[account]
pub struct VaultState {
    pub authority: Pubkey,
    pub total_tvl: u64,
    pub x1safe_mint: Pubkey,
    pub usdc_mint: Pubkey,
    pub xen_mint: Pubkey,
    pub xnt_mint: Pubkey,
    pub xnm_mint: Pubkey,
}

impl VaultState {
    pub const SIZE: usize = 32 + 8 + 32 * 5; // authority + tvl + 5 mint addresses
}

#[account]
pub struct UserPosition {
    pub owner: Pubkey,
    pub deposit_value_usd: u64,
    pub exit_rights: bool,
    pub backing_asset: AssetType,
    pub backing_amount: u64,
}

impl UserPosition {
    pub const SIZE: usize = 32 + 8 + 1 + 1 + 8; // owner + value + bool + enum + amount
}

// Enums
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq)]
pub enum AssetType {
    USDC = 0,
    XEN = 1,
    XNT = 2,
    XNM = 3,
}

// Events
#[event]
pub struct DepositEvent {
    pub user: Pubkey,
    pub asset: AssetType,
    pub amount: u64,
    pub usd_value: u64,
    pub timestamp: i64,
}

#[event]
pub struct ExitEvent {
    pub user: Pubkey,
    pub usd_value: u64,
    pub timestamp: i64,
}

#[event]
pub struct WithdrawEvent {
    pub user: Pubkey,
    pub amount: u64,
    pub timestamp: i64,
}

// Errors
#[error_code]
pub enum ErrorCode {
    #[msg("Invalid amount")]
    InvalidAmount,
    #[msg("Invalid USD value")]
    InvalidUsdValue,
    #[msg("Math overflow")]
    MathOverflow,
    #[msg("No exit rights")]
    NoExitRights,
    #[msg("Already withdrawn")]
    AlreadyWithdrawn,
}

// Oracle function (simplified - integrate with xDEX)
fn get_oracle_price(asset: &AssetType) -> Result<u64> {
    // In production, call xDEX API or Pyth/Chainlink
    // Returns price in USD cents per token unit
    match asset {
        AssetType::USDC => Ok(100_000_000), // $1.00 (6 decimals -> 8 decimal price)
        AssetType::XEN => Ok(1_000_000),    // $0.01
        AssetType::XNT => Ok(50_000_000),   // $0.50
        AssetType::XNM => Ok(10_000_000),   // $0.10
    }
}