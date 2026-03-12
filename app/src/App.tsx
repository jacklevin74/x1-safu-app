import { useState } from 'react'
import { ConnectionProvider, WalletProvider, useWallet } from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { WalletModalProvider, useWalletModal } from '@solana/wallet-adapter-react-ui'
import '@solana/wallet-adapter-react-ui/styles.css'
import './App.css'
import { Dashboard } from './components/Dashboard'
import { Deposit } from './components/Deposit'
import { Sell } from './components/Sell'
import { Exit } from './components/Exit'
import { Withdraw } from './components/Withdraw'

// Environment Configuration
const RPC_URL = import.meta.env.VITE_RPC_URL || 'https://rpc.testnet.x1.xyz'
const PROGRAM_ID = import.meta.env.VITE_PROGRAM_ID || 'SaFU1111111111111111111111111111111111111111'
const NETWORK = import.meta.env.VITE_NETWORK || 'testnet'

const wallets = [new PhantomWalletAdapter(), new SolflareWalletAdapter()]

function AppContent() {
  const wallet = useWallet()
  const { setVisible } = useWalletModal()
  const [activeTab, setActiveTab] = useState('dashboard')

  const renderContent = () => {
    switch(activeTab) {
      case 'dashboard': return <Dashboard />
      case 'deposit': return <Deposit />
      case 'sell': return <Sell />
      case 'exit': return <Exit />
      case 'withdraw': return <Withdraw />
      default: return <Dashboard />
    }
  }

  return (
    <div className="app">
      <div className="sidebar">
        <div className="logo">
          <div className="logo-icon">🛡️</div>
          <div>
            <div className="logo-text">X1SAFE</div>
            <div className="logo-subtitle">Secure Savings</div>
          </div>
        </div>
        
        <nav className="nav">
          <button 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span>📊</span>
            Dashboard
          </button>
          <button 
            className={`nav-item ${activeTab === 'deposit' ? 'active' : ''}`}
            onClick={() => setActiveTab('deposit')}
          >
            <span>💰</span>
            Deposit
          </button>
          <button 
            className={`nav-item ${activeTab === 'sell' ? 'active' : ''}`}
            onClick={() => setActiveTab('sell')}
          >
            <span>💱</span>
            Sell
          </button>
          <button 
            className={`nav-item ${activeTab === 'exit' ? 'active' : ''}`}
            onClick={() => setActiveTab('exit')}
          >
            <span>🚪</span>
            Exit
          </button>
          <button 
            className={`nav-item ${activeTab === 'withdraw' ? 'active' : ''}`}
            onClick={() => setActiveTab('withdraw')}
          >
            <span>⬆️</span>
            Withdraw
          </button>
        </nav>

        <div className="wallet-section">
          <div className="network-badge">
            {NETWORK === 'mainnet' ? '🔴' : '🧪'} X1 {NETWORK.charAt(0).toUpperCase() + NETWORK.slice(1)}
          </div>
          {wallet.connected ? (
            <div className="wallet-info">
              <div className="wallet-address">
                {wallet.publicKey?.toString().slice(0, 4)}...{wallet.publicKey?.toString().slice(-4)}
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => wallet.disconnect()}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-full" onClick={() => setVisible(true)}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <h1>X1SAFE Protocol</h1>
          <p>1 X1SAFE = 1 USD equivalent at deposit time</p>
          <div className="program-id">Program: {PROGRAM_ID.slice(0, 8)}...{PROGRAM_ID.slice(-8)}</div>
        </div>
        {renderContent()}
      </div>
    </div>
  )
}

function App() {
  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

export default App