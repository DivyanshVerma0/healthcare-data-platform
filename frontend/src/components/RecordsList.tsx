// File: frontend/src/components/RecordsList.tsx

import React from 'react';
import {
  VStack,
  Text,
  Button,
  HStack,
  Link,
  useToast,
  Tag,
} from '@chakra-ui/react';
import { RepeatIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { MedicalRecord } from '../types/records';

const CATEGORY_NAMES = [
  'General',
  'Lab Report',
  'Prescription',
  'Imaging',
  'Vaccination',
  'Surgery',
  'Consultation',
  'Emergency',
  'Other'
];

interface RecordsListProps {
  records: MedicalRecord[];
  onRefresh: () => void;
  onShare?: (recordId: string) => void;
}

const RecordsList: React.FC<RecordsListProps> = ({ records, onRefresh, onShare }) => {
  const toast = useToast();

  const handleView = (ipfsUrl: string) => {
    window.open(ipfsUrl, '_blank');
  };

  const getCategoryName = (categoryNumber: number) => {
    return CATEGORY_NAMES[categoryNumber] || 'Unknown';
  };

  return (
    <VStack spacing={4} align="stretch">
      {records.length > 0 ? (
        <VStack spacing={3} align="stretch">
          {records.map((record) => (
            <VStack 
              key={record.recordId} 
              p={4} 
              borderWidth={1} 
              borderRadius="md" 
              align="stretch"
              spacing={2}
            >
              <HStack justify="space-between" align="center">
                <Text fontWeight="bold">
                  {record.tags && record.tags.length > 0 ? record.tags[0] : `Record ${record.recordId}`}
                </Text>
                <Tag colorScheme="blue">
                  {getCategoryName(Number(record.category))}
                </Tag>
              </HStack>
              <Text fontSize="sm" color="gray.600">
                Date: {new Date(record.timestamp).toLocaleDateString()}
              </Text>
              <Text fontSize="sm" color="gray.600">
                IPFS Hash: {record.ipfsHash}
              </Text>
              <HStack spacing={4}>
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
            </VStack>
          ))}
        </VStack>
      ) : (
        <Text color="gray.500">No records found</Text>
      )}
      <Button
        colorScheme="blue"
        onClick={onRefresh}
        size="sm"
        leftIcon={<RepeatIcon />}
      >
        Refresh Records
      </Button>
    </VStack>
  );
};

export default RecordsList;