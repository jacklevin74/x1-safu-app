import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'

interface UserPosition {
  deposit_value_usd: number
  exit_rights: boolean
  backing_asset: string
  backing_amount: number
}

export function Exit() {
  const wallet = useWallet()
  const [loading, setLoading] = useState(false)
  const [position, setPosition] = useState<UserPosition | null>(null)
  const [txSig, setTxSig] = useState('')
  const [showConfirm, setShowConfirm] = useState(false)

  useEffect(() => {
    if (wallet.connected) {
      setPosition({
        deposit_value_usd: 5000,
        exit_rights: true,
        backing_asset: 'USDC.X',
        backing_amount: 5000
      })
    }
  }, [wallet.connected])

  const handleExit = async () => {
    if (!wallet.publicKey || !position?.exit_rights) return
    
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 2000))
      const mockSig = 'exit_' + Math.random().toString(36).substring(7)
      setTxSig(mockSig)
      setPosition(null)
    } catch (error) {
      console.error('Exit error:', error)
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="exit">
      <style>{`
        .exit { animation: fadeIn 0.3s ease; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div className="card">
        <div className="card-header">
          <div>
            <div className="card-title">Exit Position</div>
            <div className="card-subtitle">Burn X1SAFE to reclaim your deposit</div>
          </div>
        </div>

        {position ? (
          <>
            <div className="info-box danger">
              <div className="info-box-title">🔥 Warning</div>
              <div className="info-box-text">
                Exiting will <strong>permanently burn</strong> your X1SAFE tokens to <code>11111111111111111111111111111111</code>.
                <br /><br />
                This action cannot be undone. You will receive your original backing asset.
              </div>
            </div>

            <div className="position-card">
              <div className="position-header">
                <span className="position-title">Your Position</span>
                <span className={`position-badge ${position.exit_rights ? 'active' : 'inactive'}`}>
                  {position.exit_rights ? '✅ Exit Rights' : '❌ No Rights'}
                </span>
              </div>
              
              <div className="position-row">
                <span className="position-label">Deposit Value</span>
                <span className="position-value">${position.deposit_value_usd.toLocaleString()}</span>
              </div>
              
              <div className="position-row">
                <span className="position-label">Backing Asset</span>
                <span className="position-value">{position.backing_asset}</span>
              </div>
              
              <div className="position-row">
                <span className="position-label">Amount to Receive</span>
                <span className="position-value">{position.backing_amount.toLocaleString()} {position.backing_asset}</span>
              </div>
            </div>

            {position.exit_rights ? (
              <>
                {!showConfirm ? (
                  <button
                    className="btn btn-danger btn-full"
                    onClick={() => setShowConfirm(true)}
                  >
                    🔥 Exit Position
                  </button>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div className="info-box warning">
                      <div className="info-box-title">⚠️ Confirm Exit</div>
                      <div className="info-box-text">
                        You are about to burn {position.deposit_value_usd} X1SAFE tokens permanently.
                        <br />
                        You will receive {position.backing_amount} {position.backing_asset}.
                      </div>
                    </div>
                    
                    <button
                      className="btn btn-danger btn-full"
                      onClick={handleExit}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="loading" />
                          Processing...
                        </>
                      ) : (
                        'Confirm Exit'
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
              <div className="info-box warning">
                <div className="info-box-title">❌ No Exit Rights</div>
                <div className="info-box-text">
                  You have already withdrawn your X1SAFE to your wallet and lost exit rights.
                  <br /><br />
                  You can still sell your X1SAFE on xDEX.
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
            <p>No active position found</p>
            <p style={{ fontSize: '0.9rem', marginTop: '8px' }}>Deposit assets to create a position</p>
          </div>
        )}

        {txSig && (
          <div className="tx-status success">
            ✅ Exit successful! Transaction: {txSig.slice(0, 20)}...
            <br />
            Your {position?.backing_asset || 'assets'} have been returned.
          </div>
        )}
      </div>
    </div>
  )
}