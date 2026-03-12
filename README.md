# X1SAFE Protocol

Secure Savings Protocol on X1 Blockchain  
**1 X1SAFE = 1 USD equivalent at deposit time**

## 🏗️ Architecture

```
x1safu/
├── programs/x1safu/      # Anchor smart contract
├── app/                  # React + Vite frontend
├── scripts/             # Deployment & utility scripts
├── docs/                # Documentation
└── tests/               # Anchor tests
```

## 🚀 Quick Start

```bash
# Clone
git clone <repo>
cd x1safu

# Setup dependencies
npm install

# Start dev server
cd app && npm run dev
```

## 🛡️ Features

- **Deposit**: Lock USDC.X, XEN, XNT, or XNM → Receive X1SAFE
- **Exit**: Burn X1SAFE → Get original deposit back
- **Sell**: Trade on xDEX
- **Withdraw**: Move X1SAFE to wallet (lose exit rights)

## 📝 Smart Contract

- **Language**: Rust + Anchor
- **Network**: X1 Testnet → Mainnet
- **Program ID**: TBD (testnet)

## 🎨 Frontend Stack

- **Framework**: React 18 + TypeScript
- **Build**: Vite
- **UI**: Custom CSS (Marat-inspired clean design)
- **Wallet**: Solana Wallet Adapter
- **Deploy**: Vercel

## 🔗 Links

- **Preview**: https://x1safe.vercel.app (placeholder)
- **Testnet RPC**: https://rpc.testnet.x1.xyz
- **X1 Explorer**: https://explorer.testnet.x1.xyz

## 👥 Credits

- Protocol: Prxenx1
- Frontend: Theo (@xxen_bot)
- Style: Inspired by Marat's clean designs

## 📄 License

MIT