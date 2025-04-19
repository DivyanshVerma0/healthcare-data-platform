import CryptoJS from 'crypto-js';

// Encryption key - In production, this should be stored securely
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-key';

export const encryptData = (data: any): string => {
    try {
        // Convert data to string if it's not already
        const dataString = typeof data === 'string' ? data : JSON.stringify(data);
        
        // Encrypt the data
        const encrypted = CryptoJS.AES.encrypt(dataString, ENCRYPTION_KEY).toString();
        return encrypted;
    } catch (error) {
        throw new Error('Encryption failed');
    }
};

export const decryptData = (encryptedData: string): any => {
    try {
        // Decrypt the data
        const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        
        // Try to parse as JSON, if not return as string
        try {
            return JSON.parse(decrypted);
        } catch {
            return decrypted;
        }
    } catch (error) {
        throw new Error('Decryption failed');
    }
};