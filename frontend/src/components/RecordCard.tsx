import React from 'react';
import { Box, Text, Button, HStack, VStack } from '@chakra-ui/react';
import { CategoryLabels, Category } from './CategoryLabels';
import { downloadFromIPFS } from '../utils/ipfs';

interface RecordCardProps {
  id: string;
  title: string;
  description: string;
  category: Category;
  ipfsHash: string;
  date: string;
  onShare?: () => void;
  showShareButton?: boolean;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  id,
  title,
  description,
  category,
  ipfsHash,
  date,
  onShare,
  showShareButton = true
}) => {
  const handleDownload = async () => {
    try {
      await downloadFromIPFS(ipfsHash);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      p={4}
      mb={4}
      bg="white"
      boxShadow="sm"
      _hover={{ boxShadow: 'md' }}
    >
      <VStack align="stretch" spacing={3}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">
            {title}
          </Text>
          <CategoryLabels category={category} />
        </HStack>
        
        <Text color="gray.600">{description}</Text>
        
        <Text fontSize="sm" color="gray.500">
          Date: {new Date(date).toLocaleDateString()}
        </Text>
        
        <HStack spacing={4}>
          <Button size="sm" colorScheme="blue" onClick={handleDownload}>
            Download
          </Button>
          {showShareButton && onShare && (
            <Button size="sm" colorScheme="green" onClick={onShare}>
              Share
            </Button>
          )}
        </HStack>
      </VStack>
    </Box>
  );
}; 