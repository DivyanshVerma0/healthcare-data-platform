import React, { useState, useEffect } from 'react';
import {
  VStack,
  Text,
  Box,
  Spinner,
  Alert,
  AlertIcon,
  Grid,
  Badge,
  useToast,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { RecordCard } from './RecordCard';
import { MedicalRecord } from '../types/records';

export interface SharedWithMeRecordsProps {
  records: MedicalRecord[];
  onRefresh: () => Promise<void>;
}

export const SharedWithMeRecords: React.FC<SharedWithMeRecordsProps> = ({ records, onRefresh }) => {
  const toast = useToast();

  if (!records || records.length === 0) {
    return (
      <Text textAlign="center" py={8} color="gray.500">
        No records have been shared with you
      </Text>
    );
  }

  return (
    <VStack spacing={4} align="stretch">
      {records.map((record) => (
        <Box 
          key={record.recordId}
          p={4}
          borderWidth={1}
          borderRadius="lg"
          _hover={{ borderColor: 'blue.500' }}
        >
          <Text fontWeight="bold">
            {record.tags?.[0] || `Record ${record.recordId}`}
          </Text>
          <Text fontSize="sm" color="gray.500">
            Shared on: {new Date(record.timestamp).toLocaleDateString()}
          </Text>
          <Text fontSize="sm" fontFamily="mono" mt={2}>
            IPFS Hash: {record.ipfsHash}
          </Text>
        </Box>
      ))}
    </VStack>
  );
};
