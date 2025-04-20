import { ethers } from 'ethers';
import MedicalRecord from '../contracts/MedicalRecord.json';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const getContract = (signer: ethers.Signer) => {
  return new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, signer);
}; 