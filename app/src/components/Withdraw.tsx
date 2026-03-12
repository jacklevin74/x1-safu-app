import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface UserPosition {
  x1safe_balance: number
  exit_rights: boolean
}

export function Withdraw() {
  const wallet = useWallet()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<UserPosition | null>(null)
  const [txSig, setTxSig] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (wallet.connected) {
      setPosition({
        x1safe_balance: 5000,
        exit_rights: true
      })
    }
  }, [wallet.connected])

  const handleWithdraw = async () => {
    if (!wallet.publicKey || !amount) return
    
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 2000))
      const mockSig = 'withdraw_' + Math.random().toString(36).substring(7)
      setTxSig(mockSig)
      if (position) {
        setPosition({
          ...position,
          exit_rights: false
        })
      }
    } catch (error) {
      console.error('Withdraw error:', error)
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  const maxAmount = position?.x1safe_balance || 0

  return (
    <div className="withdraw">
      <style>{`
        .withdraw { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Withdraw X1SAFE</div>
            <div className="card-subtitle">Move tokens to your wallet</div>
          </div>
        </div>

        <div className="info-box warning">
          <div className="info-box-title">⚠️ Important</div>
          <div className="info-box-text">
            Withdrawing X1SAFE to your wallet will <strong>forfeit your exit rights</strong>.
            <br /><br />
            Once withdrawn, you can still sell on xDEX but cannot exit for the original deposit.
          </div>
        </div>

        {position ? (
          <>
            <div className="position-card">
              <div className="position-header">
                <span className="position-title">Current Position</span>
                <span className={`position-badge ${position.exit_rights ? 'active' : 'inactive'}`}>
                  {position.exit_rights ? '✅ Has Exit Rights' : '❌ No Exit Rights'}
                </span>
              </div>
              
              <div className="position-row">
                <span className="position-label">X1SAFE Balance</span>
                <span className="position-value">{position.x1safe_balance.toLocaleString()} X1SAFE</span>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Amount to Withdraw</label>
              <input
                type="number"
                className="form-input"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={maxAmount}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span>Available: {maxAmount.toLocaleString()} X1SAFE</span>
                <button 
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                  onClick={() => setAmount(maxAmount.toString())}
                >
                  MAX
                </button>
              </div>
            </div>

            {!showConfirm ? (
              <button
                className="btn btn-secondary btn-full"
                onClick={() => setShowConfirm(true)}
                disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > maxAmount}
              >
                Continue
              </button>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="info-box danger">
                  <div className="info-box-title">❗ Final Warning</div>
                  <div className="info-box-text">
                    You are about to withdraw {amount} X1SAFE to your wallet.
                    <br />
                    This will <strong>permanently remove</strong> your exit rights.
                  </div>
                </div>
                
                <button
                  className="btn btn-secondary btn-full"
                  onClick={handleWithdraw}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading" />
                      Withdrawing...
                    </>
                  ) : (
                    'Confirm Withdrawal'
                  )}
                </button>
                
                <button
                  className="btn btn-secondary btn-full"
                  onClick={() => setShowConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <p>No X1SAFE balance found</p>
            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Deposit assets to receive X1SAFE</p>
          </div>
        )}

        {txSig && (
          <div className="tx-status success">
            ✅ Withdrawal successful! Transaction: {txSig.slice(0, 20)}...
            <br />
            X1SAFE has been sent to your wallet.
          </div>
        )}
      </div>
    </div>
  )
}