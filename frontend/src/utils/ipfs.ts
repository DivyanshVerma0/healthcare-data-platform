import { create } from 'ipfs-http-client';
import { Buffer } from 'buffer';
import axios from 'axios';

// Connect to local IPFS node with CORS settings
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http',
  headers: {
    'Access-Control-Allow-Origin': '*'
  }
});

export const uploadToIPFS = async (file: File) => {
  try {
    console.log('Starting file upload to IPFS...');
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);

    // Use the IPFS API directly
    const response = await fetch('http://127.0.0.1:5001/api/v0/add?progress=false', {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json',
      },
      mode: 'cors'
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('IPFS upload result:', data);
    
    if (!data.Hash) {
      throw new Error('No hash returned from IPFS');
    }
    
    return data.Hash;

  } catch (error) {
    console.error('IPFS upload error:', error);
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const downloadFromIPFS = async (ipfsHash: string) => {
  try {
    const response = await axios.get<Blob>(`https://ipfs.io/ipfs/${ipfsHash}`, {
      responseType: 'blob'
    });
    
    // At this point, response.data is guaranteed to be a Blob due to responseType: 'blob'
    const url = window.URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `record-${ipfsHash}.pdf`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading from IPFS:', error);
    throw error;
  }
};