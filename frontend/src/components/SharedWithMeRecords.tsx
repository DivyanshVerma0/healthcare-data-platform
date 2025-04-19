import React from 'react';
import {
  VStack,
  Text,
  Button,
  Box,
  HStack,
  useToast,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { MedicalRecord } from '../types/records';

interface SharedWithMeRecordsProps {
  records: MedicalRecord[];
  onRefresh: () => void;
}

const SharedWithMeRecords: React.FC<SharedWithMeRecordsProps> = ({ records, onRefresh }) => {
  return (
    <VStack spacing={4} align="stretch">
      {records.length > 0 ? (
        <VStack spacing={3} align="stretch">
          {records.map((record) => (
            <Box
              key={record.recordId}
              p={4}
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ bg: "gray.50" }}
            >
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontWeight="bold">
                    Shared Record #{record.recordId}
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
        <Text color="gray.500">No records have been shared with you</Text>
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
