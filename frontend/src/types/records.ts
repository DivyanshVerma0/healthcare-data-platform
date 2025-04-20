// File: frontend/src/types/records.ts
import { Category } from '../components/CategoryLabels';

export interface MedicalRecord {
    recordId: string;
    ipfsHash: string;
    timestamp: Date;
    isActive: boolean;
    ipfsUrl: string;
    owner: string;
    category: Category;
    title: string;
    description: string;
    tags: string[];
}