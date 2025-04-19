import { Request, Response } from 'express';
import { uploadToIPFS } from '../services/ipfs';
import { encryptData } from '../utils/encryption';

export const uploadRecord = async (req: Request, res: Response) => {
    try {
        const { file, patientAddress, isEncrypted } = req.body;
        
        const processedFile = isEncrypted ? await encryptData(file) : file;
        const ipfsHash = await uploadToIPFS(processedFile);
        
        res.json({ 
            success: true, 
            ipfsHash,
            isEncrypted 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getRecords = async (req: Request, res: Response) => {
    try {
        const { patientAddress } = req.params;
        // Implement logic to fetch records from blockchain
        res.json({ records: [] });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};