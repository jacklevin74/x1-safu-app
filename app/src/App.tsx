import { useState, useMemo, useCallback } from 'react'
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

// Network Configuration
const NETWORKS = {
  mainnet: {
    name: 'Mainnet',
    rpc: 'https://rpc.mainnet.x1.xyz',
    programId: 'SaFU1111111111111111111111111111111111111111',
    explorer: 'https://explorer.mainnet.x1.xyz',
    icon: '🔴',
    faucet: null
  },
  testnet: {
    name: 'Testnet',
    rpc: 'https://rpc.testnet.x1.xyz',
    programId: 'SaFU1111111111111111111111111111111111111111',
    explorer: 'https://explorer.testnet.x1.xyz',
    icon: '🧪',
    faucet: 'https://faucet.testnet.x1.xyz'
  }
} as const

type NetworkType = keyof typeof NETWORKS

function AppContent() {
  const wallet = useWallet()
  const { setVisible } = useWalletModal()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [network, setNetwork] = useState<NetworkType>('testnet')
  const [showNetworkMenu, setShowNetworkMenu] = useState(false)

  const currentNetwork = NETWORKS[network]

  const handleNetworkSwitch = useCallback((newNetwork: NetworkType) => {
    setNetwork(newNetwork)
    setShowNetworkMenu(false)
    // Force reload to apply new RPC endpoint
    window.location.reload()
  }, [])

  const openFaucet = () => {
    if (currentNetwork.faucet) {
      window.open(currentNetwork.faucet, '_blank')
    }
  }

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
          {/* Network Switcher */}
          <div className="network-switcher">
            <button 
              className="network-selector-btn"
              onClick={() => setShowNetworkMenu(!showNetworkMenu)}
            >
              <span className="network-icon">{currentNetwork.icon}</span>
              <span className="network-name">X1 {currentNetwork.name}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            
            {showNetworkMenu && (
              <div className="network-menu">
                {(Object.keys(NETWORKS) as NetworkType[]).map((netKey) => (
                  <button
                    key={netKey}
                    className={`network-option ${network === netKey ? 'active' : ''}`}
                    onClick={() => handleNetworkSwitch(netKey)}
                  >
                    <span>{NETWORKS[netKey].icon}</span>
                    <span>X1 {NETWORKS[netKey].name}</span>
                    {network === netKey && <span className="check-mark">✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Faucet Button for Testnet */}
          {currentNetwork.faucet && (
            <button className="btn btn-faucet btn-sm btn-full" onClick={openFaucet}>
              <span>🚰</span> Get Test XNT
            </button>
          )}

          <div className="network-info">
            <div className="rpc-info" title={currentNetwork.rpc}>
              RPC: {currentNetwork.rpc.replace('https://', '').split('/')[0]}
            </div>
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
          <div className="program-id">
            Network: <span className="network-highlight">X1 {currentNetwork.name}</span> | 
            Program: {currentNetwork.programId.slice(0, 8)}...{currentNetwork.programId.slice(-8)}
          </div>
        </div>
        {renderContent()}
      </div>
    </div>
  )
}

// Wrapper to handle network switching with new ConnectionProvider
function NetworkedApp() {
  const [network, _setNetwork] = useState<NetworkType>(() => {
    // Check localStorage or default to testnet
    const saved = localStorage.getItem('x1safe-network') as NetworkType
    return saved && NETWORKS[saved] ? saved : 'testnet'
  })

  const currentNetwork = NETWORKS[network]
  const wallets = useMemo(() => [new PhantomWalletAdapter(), new SolflareWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={currentNetwork.rpc}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <AppContent />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}

// Export App with proper structure
export default function App() {
  return <NetworkedApp />
}