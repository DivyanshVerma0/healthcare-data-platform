# Healthcare Data Platform

A decentralized platform for secure medical record management using blockchain technology and IPFS.

## Features

- 🔒 **Secure Record Storage**: Medical records are encrypted and stored on IPFS
- ⛓️ **Blockchain-Based Access Control**: Utilizes Ethereum smart contracts for managing record access
- 🤝 **Selective Sharing**: Share records with specific healthcare providers using their wallet addresses
- 📱 **Modern UI**: Built with React and Chakra UI for a seamless user experience
- 🔐 **Web3 Integration**: Complete wallet integration with MetaMask
- 🎨 **Responsive Design**: Fully responsive UI that works on all devices
- 🔄 **Real-time Updates**: Instant updates for record sharing and access management
- 🏥 **Healthcare Focus**: Specialized features for medical record management
- ☁️ **Cloud IPFS**: No local IPFS installation needed - uses IPFS gateway services

## Tech Stack

### Frontend
- React.js with TypeScript
- Chakra UI for components
- Web3-React for blockchain integration
- React Icons (FI icons)
- React Router v6 for navigation
- Ethers.js for blockchain interaction
- IPFS HTTP Client for file storage

### Backend & Blockchain
- Solidity Smart Contracts
- IPFS (via Infura/Pinata Gateway)
- Hardhat development environment
- OpenZeppelin contract libraries

### Development & Testing
- Node.js
- Hardhat
- Chai & Mocha for testing
- ESLint & Prettier for code formatting

## Prerequisites

- Node.js (v16+ recommended)
- MetaMask browser extension
- Git
- NPM or Yarn package manager
- IPFS Gateway API credentials (from Infura or Pinata)

## Detailed Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/healthcare-data-platform.git
cd healthcare-data-platform
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies with legacy peer deps to avoid conflicts
npm install --legacy-peer-deps

# Install IPFS HTTP client
npm install --legacy-peer-deps ipfs-http-client@^56.0.0

# If you encounter any issues, try:
npm install --legacy-peer-deps @chakra-ui/react @emotion/react @emotion/styled framer-motion
npm install --legacy-peer-deps @web3-react/core @web3-react/injected-connector
npm install --legacy-peer-deps react-icons
npm install --legacy-peer-deps ethers@^5.7.2

# Additional dependencies that might be needed
npm install --legacy-peer-deps @chakra-ui/icons
npm install --legacy-peer-deps react-router-dom@^6.0.0
```

#### Common Issues & Solutions:

1. **Chakra UI Icons Error**:
   If you see errors related to Chakra UI icons, install:
   ```bash
   npm install --legacy-peer-deps @chakra-ui/icons @chakra-ui/react@^2.0.0
   ```

2. **React Icons Error**:
   For issues with react-icons:
   ```bash
   npm install --legacy-peer-deps react-icons@^4.0.0
   ```

3. **Web3 Dependencies**:
   If web3 integration shows errors:
   ```bash
   npm install --legacy-peer-deps @web3-react/core@^6.0.0 @web3-react/injected-connector@^6.0.0
   ```

4. **IPFS Client Error**:
   If IPFS client shows compatibility issues:
   ```bash
   npm install --legacy-peer-deps ipfs-http-client@^56.0.0 multiformats@^9.0.0
   ```

### 3. IPFS Configuration

The project uses IPFS HTTP client to interact with IPFS through a gateway service (Infura or Pinata). No local IPFS installation is required.

1. **Get IPFS Gateway Credentials**:
   - Sign up for an IPFS gateway service (Infura or Pinata)
   - Get your Project ID and API Secret
   - These will be used in your environment variables

2. **Configure IPFS Environment Variables**:
   Add these to your frontend `.env` file:
   ```env
   REACT_APP_IPFS_PROJECT_ID=your_ipfs_project_id
   REACT_APP_IPFS_PROJECT_SECRET=your_ipfs_project_secret
   REACT_APP_IPFS_GATEWAY=https://ipfs.infura.io:5001
   ```

### 4. Smart Contract Setup

```bash
cd smart-contracts

# Install dependencies
npm install

# Install specific hardhat packages if needed
npm install --save-dev hardhat @nomiclabs/hardhat-ethers ethers
```

Create a `.env` file in the smart-contracts directory:
```env
PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

### 5. Environment Configuration

Create a `.env` file in the frontend directory:
```env
REACT_APP_CONTRACT_ADDRESS=your_deployed_contract_address
REACT_APP_IPFS_PROJECT_ID=your_ipfs_project_id
REACT_APP_IPFS_PROJECT_SECRET=your_ipfs_project_secret
REACT_APP_IPFS_GATEWAY=https://ipfs.infura.io:5001
```

### 6. MetaMask Configuration

#### Adding Local Network to MetaMask

1. **Open MetaMask**:
   - Click on the MetaMask extension icon
   - Click on the network dropdown (usually shows "Ethereum Mainnet")

2. **Add Network**:
   - Click "Add Network"
   - Click "Add a network manually"

3. **Network Configuration**:
   Fill in the following details:
   ```
   Network Name: Hardhat Local
   New RPC URL: http://127.0.0.1:8545
   Chain ID: 31337
   Currency Symbol: ETH
   Block Explorer URL: (leave empty)
   ```

4. **Import Test Accounts** (Optional):
   - When you run `npx hardhat node`, it generates 20 test accounts with private keys
   - To import a test account:
     1. Copy any private key from the hardhat node console
     2. In MetaMask, click your account icon
     3. Click "Import Account"
     4. Paste the private key and click "Import"
   - These accounts come pre-loaded with 10,000 test ETH

5. **Verify Connection**:
   - Make sure your Hardhat node is running (`npx hardhat node`)
   - In MetaMask, select the "Hardhat Local" network
   - You should see a balance of test ETH if using an imported account

#### Common MetaMask Issues:

1. **Wrong Network**:
   - Ensure you're connected to "Hardhat Local"
   - If transactions fail, switch to the correct network

2. **Nonce Issues**:
   - If you restart the Hardhat node, go to MetaMask Settings
   - Advanced > Reset Account to clear the transaction history

3. **Connection Issues**:
   - Ensure Hardhat node is running
   - Try resetting the network configuration
   - Check if the RPC URL is correct

### 7. Starting the Development Environment

```bash
# Terminal 1 - Start local blockchain
cd smart-contracts
npx hardhat node

# Terminal 2 - Deploy contracts
cd smart-contracts
npx hardhat run scripts/deploy.js --network localhost

# Terminal 3 - Start frontend
cd frontend
npm start
```

## Latest Updates & Progress

### Completed Features
- ✅ Modern and responsive navbar with wallet integration
- ✅ Homepage with features and benefits sections
- ✅ Dashboard layout with medical records management
- ✅ Wallet connection and management
- ✅ Record sharing functionality
- ✅ UI/UX improvements across all pages

### In Progress
- 🔄 Gas fee optimization
- 🔄 Enhanced error handling
- 🔄 Additional security features
- 🔄 Performance optimizations

### Upcoming Features
- 📋 Batch record processing
- 📱 Mobile app development
- 🔍 Advanced search functionality
- 📊 Analytics dashboard

## Troubleshooting Common Issues

### MetaMask Connection Issues
- Ensure MetaMask is installed and unlocked
- Check if you're on the correct network
- Try clearing MetaMask cache if persistent issues occur

### Smart Contract Interaction Errors
- Verify contract deployment address is correct
- Ensure sufficient ETH for gas fees
- Check if MetaMask account has required permissions

### IPFS Upload Issues
- Verify IPFS configuration
- Check file size limitations
- Ensure proper encryption before upload

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Implement proper error handling
- Add comments for complex logic

### Component Structure
- Use functional components
- Implement proper prop typing
- Follow Chakra UI best practices
- Maintain consistent file structure

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue in the GitHub repository or contact the development team.

## Acknowledgments

- OpenZeppelin for smart contract libraries
- IPFS for decentralized storage
- Ethereum community for web3 tools and libraries
- Chakra UI for the component library 