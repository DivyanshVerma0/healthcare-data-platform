// File: frontend/src/types/records.ts

export interface MedicalRecord {
    recordId: string;
    ipfsHash: string;
    timestamp: Date;
    isActive: boolean;
    ipfsUrl: string;
  }