import React from 'react';
import {
  VStack,
  Text,
  Button,
  Box,
  Link,
  HStack,
  useToast,
  Tag,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { ExternalLinkIcon, RepeatIcon } from '@chakra-ui/icons';
import { MedicalRecord } from '../types/records';
import { CategoryLabels } from './CategoryLabels';

interface SharedWithMeRecordsProps {
  records: MedicalRecord[];
  onRefresh: () => void;
}

const SharedWithMeRecords: React.FC<SharedWithMeRecordsProps> = ({ records, onRefresh }) => {
  const toast = useToast();

  const handleView = (ipfsUrl: string) => {
    window.open(ipfsUrl, '_blank');
  };

  const handleDownload = async (record: MedicalRecord) => {
    try {
      window.open(record.ipfsUrl, '_blank');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Error",
        description: "Failed to download file",
        status: "error",
        duration: 3000,
      });
    }
  };

  return (
    <VStack spacing={4} align="stretch">
      {records.length > 0 ? (
        <VStack spacing={3} align="stretch">
          {records.map((record) => (
            <Box
              key={record.recordId}
              p={4}
              borderWidth={1}
              borderRadius="md"
            >
              <Text fontWeight="bold">
                {record.tags && record.tags.length > 0 ? record.tags[0] : `Record ${record.recordId}`}
              </Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Date: {new Date(record.timestamp).toLocaleDateString()}
              </Text>
              <Text fontSize="sm" color="gray.600">
                IPFS Hash: {record.ipfsHash}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Shared by: {record.owner}
              </Text>
              <HStack mt={3} spacing={4}>
                <Button
                  size="sm"
                  colorScheme="blue"
                  onClick={() => handleView(record.ipfsUrl)}
                  leftIcon={<ExternalLinkIcon />}
                >
                  View
                </Button>
                <Link href={record.ipfsUrl} isExternal>
                  <Button size="sm" colorScheme="green">
                    Download
                  </Button>
                </Link>
              </HStack>
            </Box>
          ))}
        </VStack>
      ) : (
        <Text color="gray.500">No shared records found</Text>
      )}
      <Button
        colorScheme="blue"
        onClick={onRefresh}
        size="sm"
        leftIcon={<RepeatIcon />}
      >
        Refresh Shared Records
      </Button>
    </VStack>
  );
};

export default SharedWithMeRecords;
