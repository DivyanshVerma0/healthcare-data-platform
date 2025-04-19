// File: frontend/src/components/RecordsList.tsx

import React from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  useToast,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { MedicalRecord } from '../types/records';

interface RecordsListProps {
  records: MedicalRecord[];
  onRefresh: () => void;
}

const RecordsList: React.FC<RecordsListProps> = ({ records, onRefresh }) => {
  return (
    <VStack spacing={4} align="stretch">
      {records.length > 0 ? (
        <VStack spacing={3} align="stretch">
          {records.map((record, index) => (
            <Box
              key={index}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ bg: "gray.50" }}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">
                    Record #{index + 1}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {record.timestamp.toLocaleString()}
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  colorScheme="blue"
                  as="a"
                  href={record.ipfsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View File
                </Button>
              </HStack>
            </Box>
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