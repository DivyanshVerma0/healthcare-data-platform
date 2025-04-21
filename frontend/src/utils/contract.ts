import { ethers } from 'ethers';
import MedicalRecordABI from '../contracts/MedicalRecord.json';

export const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export const getContract = (signer: ethers.Signer) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not found in environment variables');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, MedicalRecordABI.abi, signer);
};

export const getRoleHash = (role: string) => {
  return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(role));
};

export const ROLES = {
  PATIENT: getRoleHash('PATIENT_ROLE'),
  DOCTOR: getRoleHash('DOCTOR_ROLE'),
  RESEARCHER: getRoleHash('RESEARCHER_ROLE'),
  ADMIN: getRoleHash('ADMIN_ROLE'),
} as const;

export const verifyRole = async (contract: ethers.Contract, address: string, role: string) => {
  const roleHash = ROLES[role as keyof typeof ROLES];
  return await contract.hasRole(roleHash, address);
};

export const grantRole = async (contract: ethers.Contract, address: string, role: string) => {
  const roleHash = ROLES[role as keyof typeof ROLES];
  return await contract.grantRole(roleHash, address);
};

export const revokeRole = async (contract: ethers.Contract, address: string, role: string) => {
  const roleHash = ROLES[role as keyof typeof ROLES];
  return await contract.revokeRole(roleHash, address);
}; 