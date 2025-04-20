import React, { useState } from 'react';
import {
  VStack,
  Text,
  Input,
  Button,
  Box,
  useToast,
  Progress,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { uploadToIPFS } from '../utils/ipfs';
import RecordMetadata, { Category } from './RecordMetadata';

interface CreateRecordProps {
  contract: ethers.Contract;
  onRecordCreated: () => void;
}

const CreateRecord: React.FC<CreateRecordProps> = ({ contract, onRecordCreated }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [category, setCategory] = useState<Category>(Category.GENERAL);
  const [tags, setTags] = useState<string[]>([]);
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleMetadataChange = (newCategory: Category, newTags: string[]) => {
    setCategory(newCategory);
    setTags(newTags);
  };

  const handleUpload = async () => {
    if (!selectedFile || !contract) {
      toast({
        title: "Error",
        description: "Please select a file",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress('Preparing upload...');
    
    try {
      // Upload to IPFS
      setUploadProgress('Uploading to IPFS...');
      console.log('Starting upload process...');
      const ipfsHash = await uploadToIPFS(selectedFile);
      console.log('IPFS Hash:', ipfsHash);
      
      // Create record on blockchain
      setUploadProgress('Creating blockchain transaction...');
      console.log('Creating record with metadata:', {
        ipfsHash,
        category,
        tags
      });

      const tx = await contract.createRecord(
        ipfsHash,
        true, // isEncrypted
        category,
        tags,
        {
          gasLimit: 500000
        }
      );
      
      setUploadProgress('Waiting for transaction confirmation...');
      console.log('Transaction submitted:', tx.hash);
      
      await tx.wait();
      console.log('Transaction confirmed');

      toast({
        title: "Success!",
        description: "Medical record uploaded successfully",
        status: "success",
        duration: 5000,
      });

      setSelectedFile(null);
      setCategory(Category.GENERAL);
      setTags([]);
      onRecordCreated();
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      <Text fontWeight="bold">Upload Medical Record</Text>
      <Input
        type="file"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        disabled={isUploading}
      />
      
      <Box borderWidth="1px" borderRadius="md" p={4}>
        <Text fontWeight="bold" mb={2}>Record Details</Text>
        <RecordMetadata
          contract={contract}
          initialCategory={category}
          initialTags={tags}
          isEditing={true}
          onMetadataChange={handleMetadataChange}
        />
      </Box>

      {isUploading && (
        <Box w="100%">
          <Progress size="xs" isIndeterminate />
          <Text mt={2} fontSize="sm">{uploadProgress}</Text>
        </Box>
      )}

      <Button
        colorScheme="blue"
        onClick={handleUpload}
        isDisabled={!selectedFile || isUploading}
        isLoading={isUploading}
        loadingText={uploadProgress}
      >
        Upload Record
      </Button>
    </VStack>
  );
};

export default CreateRecord; 