import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

const ASSETS = [
  { value: 'usdc', label: 'USDC.X', mint: 'B69chRzqzDCmdB5WYB8NRu5Yv5ZA95ABiZcdzCgGm9Tq', icon: '💵', price: 1.0 },
  { value: 'xen', label: 'XEN', mint: 'xen111111111111111111111111111111111111111', icon: '⚡', price: 0.01 },
  { value: 'xnt', label: 'XNT', mint: 'xnt111111111111111111111111111111111111111', icon: '🪙', price: 0.5 },
  { value: 'xnm', label: 'XNM', mint: 'xnm111111111111111111111111111111111111111', icon: '⛏️', price: 0.1 },
]

export function Deposit() {
  const wallet = useWallet()
  const [amount, setAmount] = useState('')
  const [asset, setAsset] = useState('usdc')
  const [loading, setLoading] = useState(false)
  const [txSig, setTxSig] = useState('')

  const selectedAsset = ASSETS.find(a => a.value === asset)
  const estimatedX1SAFE = amount ? (parseFloat(amount) * (selectedAsset?.price || 0)).toFixed(2) : '0'

  const handleDeposit = async () => {
    if (!wallet.publicKey || !amount) return
    
    setLoading(true)
    try {
      // Mock transaction
      const mockSig = 'tx_' + Math.random().toString(36).substring(7)
      await new Promise(r => setTimeout(r, 2000))
      setTxSig(mockSig)
    } catch (error) {
      console.error('Deposit error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="deposit">
      <style>{`
        .deposit { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Deposit Assets</div>
            <div className="card-subtitle">Receive X1SAFE tokens at 1:1 USD value</div>
          </div>
        </div>

        <div className="info-box">
          <div className="info-box-title">ℹ️ How it works</div>
          <div className="info-box-text">
            Deposit USDC.X, XEN, XNT, or XNM and receive X1SAFE tokens.
            <br /><br />
            1 X1SAFE = $1.00 USD at deposit time. Your deposit is fully backed and you retain exit rights.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Select Asset</label>
          <div className="asset-grid">
            {ASSETS.map(a => (
              <div
                key={a.value}
                className={`asset-option ${asset === a.value ? 'selected' : ''}`}
                onClick={() => setAsset(a.value)}
              >
                <div className="asset-icon">{a.icon}</div>
                <div className="asset-name">{a.label}</div>
                <div className="asset-price">${a.price.toFixed(2)}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Amount ({selectedAsset?.label})</label>
          <input
            type="number"
            className="form-input"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">You Receive (X1SAFE)</label>
          <input
            type="text"
            className="form-input"
            value={estimatedX1SAFE}
            disabled
            style={{ opacity: 0.7 }}
          />
          <div style={{ marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            1 {selectedAsset?.label} = ${selectedAsset?.price} → {selectedAsset?.price} X1SAFE
          </div>
        </div>

        <button
          className="btn btn-primary btn-full"
          onClick={handleDeposit}
          disabled={!wallet.connected || !amount || loading}
        >
          {loading ? (
            <>
              <span className="loading" />
              Processing...
            </>
          ) : (
            'Deposit'
          )}
        </button>

        {txSig && (
          <div className="tx-status success">
            ✅ Deposit successful! Transaction: {txSig.slice(0, 20)}...
          </div>
        )}
      </div>
    </div>
  )
}