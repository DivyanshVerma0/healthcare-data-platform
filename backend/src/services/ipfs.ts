import { create } from 'ipfs-http-client';

const ipfs = create({ url: 'http://localhost:5001' });

export const uploadToIPFS = async (data: any) => {
    try {
        const result = await ipfs.add(data);
        return result.path;
    } catch (error) {
        throw new Error('Failed to upload to IPFS');
    }
};

export const getFromIPFS = async (hash: string) => {
    try {
        const stream = ipfs.cat(hash);
        let data = '';
        for await (const chunk of stream) {
            data += chunk.toString();
        }
        return data;
    } catch (error) {
        throw new Error('Failed to fetch from IPFS');
    }
};