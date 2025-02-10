# 🚀 RIFT - Pokemon NFT Trading Platform

RIFT is a decentralized platform for Pokemon-inspired NFT trading and battles built on the Sui blockchain. This modern web application allows users to launch, trade, and manage Pokemon-themed NFT with a beautiful and intuitive interface.

![RIFT Platform](public/pokemon-hero.png)

## ✨ Features

- 🎮 *Pokemon NFT Launch*: Create and deploy your own Pokemon-inspired NFTs
- 💱 *NFT Trading*: Trade NFTs with other users on the platform
- 📊 *Real-time Stats*: Track NFT performance and trading volumes
- 🎨 *AI-Generated Art*: Automatic generation of NFT and agent images using Replicate API
- 🔐 *Wallet Integration*: Secure transactions with Sui wallet integration
- 📱 *Responsive Design*: Beautiful UI that works on all devices

## 🛠 Tech Stack

### Frontend
- *Framework*: React 18 with TypeScript
- *Styling*: Tailwind CSS with custom animations
- *State Management*: React Context
- *Wallet Integration*: @suiet/wallet-kit
- *UI Components*: 
  - Radix UI primitives
  - Material-UI components
  - Custom shadcn/ui components
- *Charts*: Recharts, Lightweight Charts
- *Notifications*: React Hot Toast, Sonner

### Backend
- *Runtime*: Node.js
- *Framework*: Express.js
- *Database*: MongoDB
- *Image Generation*: Replicate API
- *API Integration*: Axios

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- pnpm package manager
- MongoDB instance
- Sui wallet (Suiet recommended)
- Replicate API key for image generation

### Environment Setup

1. Clone the repository:
bash
git clone https://github.com/yourusername/rift.git
cd rift


2. Create frontend environment file (.env):
env
VITE_REPLICATE_API_NFT=your_replicate_api_NFT
VITE_API_BASE_URL=http://localhost:5001/api


3. Create backend environment file (backend/.env):
env
PORT=5001
MONGODB_URI=your_mongodb_connection_string


### Installation

1. Install frontend dependencies:
bash
pnpm install


2. Install backend dependencies:
bash
cd backend
pnpm install


### Running the Application

1. Start the backend server:
bash
cd backend
pnpm dev


2. In a new terminal, start the frontend development server:
bash
npm run dev


The application will be available at http://localhost:5173

## 🎯 Core Functionalities

### NFT Launch Process
1. Connect your Sui wallet
2. Fill in NFT details (name, symbol, supply, etc.)
3. Add social links and description
4. AI generates NFT and agent images
5. Deploy NFT to the Sui blockchain

## 🔧 Development

### Project Structure

rift/
├── src/                    # Frontend source code
│   ├── components/         # Reusable UI components
│   ├── Pages/             # Page components
│   ├── services/          # API and blockchain services
│   └── styles/            # Global styles and themes
├── backend/               # Backend source code
│   ├── models/            # MongoDB schemas
│   └── routes/           # API endpoints
└── public/               # Static assets




## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (git checkout -b feature/AmazingFeature)
3. Commit your changes (git commit -m 'Add some AmazingFeature')
4. Push to the branch (git push origin feature/AmazingFeature)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


