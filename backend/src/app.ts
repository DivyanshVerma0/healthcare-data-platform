import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import medicalRecordsRoutes from './routes/medicalRecords';
import { getContract } from './services/blockchain';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const IPFS_API_URL = process.env.IPFS_API_URL;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/medical-records', medicalRecordsRoutes);

app.get('/api/verify-contract', async (req, res) => {
    try {
        const contract = getContract();
        const name = await contract.name();
        res.json({ 
            success: true, 
            contractAddress: process.env.CONTRACT_ADDRESS,
            contractName: name
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});