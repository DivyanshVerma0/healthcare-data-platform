# Healthcare Data Platform

A decentralized platform for secure medical record management using blockchain technology and IPFS.

## Features

- 🔒 **Secure Record Storage**: Medical records are encrypted and stored on IPFS
- ⛓️ **Blockchain-Based Access Control**: Utilizes Ethereum smart contracts for managing record access
- 🤝 **Selective Sharing**: Share records with specific healthcare providers using their wallet addresses
- 📱 **Modern UI**: Built with React and Chakra UI for a seamless user experience
- 🔐 **Web3 Integration**: Complete wallet integration with MetaMask

## Tech Stack

- **Frontend**: React.js, TypeScript, Chakra UI, Web3-React
- **Smart Contracts**: Solidity, OpenZeppelin
- **Storage**: IPFS
- **Development**: Hardhat, Ethers.js
- **Testing**: Chai, Mocha

## Prerequisites

- Node.js (v14+ recommended)
- MetaMask browser extension
- Git

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/healthcare-data-platform.git
cd healthcare-data-platform
```

### 2. Smart Contract Setup

```bash
cd smart-contracts
npm install
```

Create a `.env` file in the smart-contracts directory:
```env
PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key_here
```

Compile and deploy contracts:
```bash
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

Save the deployed contract address - you'll need it for the frontend.

### 3. Frontend Setup

```bash
cd frontend
npm install
```

Update the contract address in `src/pages/Dashboard.tsx`:
```typescript
const CONTRACT_ADDRESS = 'your_deployed_contract_address';
```

Copy the contract ABI:
```bash
cp ../smart-contracts/artifacts/contracts/MedicalRecord.sol/MedicalRecord.json src/contracts/
```

Start the development server:
```bash
npm start
```

## Usage Guide

1. **Connect Wallet**
   - Install MetaMask if you haven't already
   - Connect your wallet to the application
   - Make sure you're on the correct network (localhost for development)

2. **Upload Records**
   - Click "Upload File" in the My Records tab
   - Select your medical record file
   - Confirm the transaction in MetaMask
   - Wait for the upload to complete

3. **Share Records**
   - Go to the "My Records" tab
   - Select a record from the dropdown
   - Enter the recipient's wallet address
   - Click "Share Access"
   - Confirm the transaction

4. **View Shared Records**
   - "Shared By Me" tab shows records you've shared with others
   - "Shared With Me" tab shows records others have shared with you
   - Use the "Revoke" button to remove access

## Smart Contract Details

### MedicalRecord.sol
- ERC721-based contract for record management
- Key functions:
  - `createRecord`: Upload new medical records
  - `grantAccess`: Share records with other addresses
  - `revokeAccess`: Remove sharing access
  - `getSharedAddresses`: View all addresses with access to a record

## Development

### Running Tests
```bash
cd smart-contracts
npx hardhat test
```

### Local Blockchain
```bash
npx hardhat node
```

### Deploying to Test Networks
```bash
npx hardhat run scripts/deploy.js --network goerli
```

## Security Considerations

- All medical records are encrypted before uploading to IPFS
- Only the record owner can grant/revoke access
- Smart contract includes access control mechanisms
- Frontend includes error handling and transaction confirmation
- MetaMask ensures secure transaction signing

## Known Issues and Limitations

- IPFS gateway might be slow sometimes
- MetaMask needs to be on the correct network
- Large files may take longer to upload
- Requires gas fees for all blockchain transactions

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