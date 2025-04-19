import { ethers } from 'ethers';
import * as MedicalRecordArtifact from '../contracts/MedicalRecord.json';

const provider = new ethers.JsonRpcProvider('http://localhost:8545');
const contractAddress = process.env.CONTRACT_ADDRESS || '';

export const getContract = () => {
    const contract = new ethers.Contract(
        contractAddress,
        MedicalRecordArtifact.abi,
        provider
    );
    return contract;
};