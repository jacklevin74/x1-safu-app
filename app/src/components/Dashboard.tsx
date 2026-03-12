import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface Stats {
  tvl: number
  holders: number
  price: number
  volume24h: number
}

interface UserPosition {
  x1safeBalance: number
  depositValue: number
  exitRights: boolean
  backingAsset: string
}

export function Dashboard() {
  const wallet = useWallet()
  const [stats, setStats] = useState<Stats>({
    tvl: 0,
    holders: 0,
    price: 1.0,
    volume24h: 0
  })
  const [position, setPosition] = useState<UserPosition | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - in production fetch from program
    setTimeout(() => {
      setStats({
        tvl: 1247500,
        holders: 342,
        price: 1.0,
        volume24h: 125000
      })
      setLoading(false)
    }, 1000)

    if (wallet.connected) {
      // Mock user position
      setPosition({
        x1safeBalance: 5000,
        depositValue: 5000,
        exitRights: true,
        backingAsset: 'USDC.X'
      })
    }
  }, [wallet.connected])

  const formatNumber = (num: number) => {
    if (num >= 1_000_000) {
      return `$${(num / 1_000_000).toFixed(2)}M`
    }
    if (num >= 1_000) {
      return `$${(num / 1_000).toFixed(1)}K`
    }
    return `$${num.toFixed(2)}`
  }

  return (
    <div className="dashboard">
      <style>{`
        .dashboard { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
      
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Value Locked</div>
          <div className="stat-value">{loading ? '...' : formatNumber(stats.tvl)}</div>
          <div className="stat-change positive">+12.5% this week</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">X1SAFE Price</div>
          <div className="stat-value">${stats.price.toFixed(3)}</div>
          <div className="stat-change">Pegged to USD</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">24h Volume</div>
          <div className="stat-value">{loading ? '...' : formatNumber(stats.volume24h)}</div>
          <div className="stat-change positive">+8.2%</div>
        </div>
        
        <div className="stat-card">
          <div className="stat-label">Holders</div>
          <div className="stat-value">{loading ? '...' : stats.holders.toLocaleString()}</div>
          <div className="stat-change positive">+18 new today</div>
        </div>
      </div>

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Your Position */}
        <div className="card">
          <div className="card-header">
            <div>
              <div className="card-title">Your Position</div>
              <div className="card-subtitle">{wallet.connected ? 'Connected' : 'Connect wallet to view'}</div>
            </div>
          </div>
          
          {wallet.connected ? (
            position ? (
              <div className="position-card">
                <div className="position-header">
                  <span className="position-title">Active Position</span>
                  <span className={`position-badge ${position.exitRights ? 'active' : 'inactive'}`}>
                    {position.exitRights ? '✅ Exit Rights' : '❌ No Rights'}
                  </span>
                </div>
                
                <div className="position-row">
                  <span className="position-label">X1SAFE Balance</span>
                  <span className="position-value">{position.x1safeBalance.toLocaleString()} X1SAFE</span>
                </div>
                
                <div className="position-row">
                  <span className="position-label">Deposit Value</span>
                  <span className="position-value">${position.depositValue.toLocaleString()}</span>
                </div>
                
                <div className="position-row">
                  <span className="position-label">Backing Asset</span>
                  <span className="position-value">{position.backingAsset}</span>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                <p>No active position</p>
                <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Deposit assets to get started</p>
              </div>
            )
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              <p>Connect your wallet to view your position</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <div className="card-header">
            <div className="card-title">Quick Actions</div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <a href="#deposit" className="external-link">
              💰 Deposit Assets
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
            
            <a href="https://app.xdex.xyz/swap" target="_blank" rel="noopener" className="external-link">
              📈 Trade on xDEX
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
            
            <a href="https://explorer.mainnet.x1.xyz" target="_blank" rel="noopener" className="external-link">
              🔍 View on Explorer
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M7 17L17 7M17 7H7M17 7V17" />
              </svg>
            </a>
          </div>        
        </div>
      </div>

      {/* How It Works */}
      <div className="card">
        <div className="card-header">
          <div className="card-title">How X1SAFU Works</div>
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <div className="info-box">
            <div className="info-box-title">
              <span>1️⃣</span> Deposit
            </div>
            <div className="info-box-text">
              Send USDC.X, XEN, XNT, or XNM to receive X1SAFE tokens at 1:1 USD value.
            </div>
          </div>
          
          <div className="info-box">
            <div className="info-box-title">
              <span>2️⃣</span> Hold or Sell
            </div>
            <div className="info-box-text">
              Keep X1SAFE for exit rights, or sell on xDEX secondary market.
            </div>
          </div>
          
          <div className="info-box">
            <div className="info-box-title">
              <span>3️⃣</span> Exit
            </div>
            <div className="info-box-text">
              Burn X1SAFE to reclaim your original deposit principal.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}