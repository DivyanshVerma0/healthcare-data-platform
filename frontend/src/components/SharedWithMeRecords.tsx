import React from 'react';
import {
  VStack,
  Text,
  Button,
  Box,
  HStack,
  useToast,
  Tag,
  Wrap,
  WrapItem,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { MedicalRecord } from '../types/records';
import { CategoryLabels } from './CategoryLabels';

interface SharedWithMeRecordsProps {
  records: MedicalRecord[];
  onRefresh: () => void;
}

const SharedWithMeRecords: React.FC<SharedWithMeRecordsProps> = ({ records, onRefresh }) => {
  const toast = useToast();

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
              borderWidth="1px"
              borderRadius="lg"
              _hover={{ bg: "gray.50" }}
            >
              <VStack align="stretch" spacing={2}>
                <HStack justify="space-between">
                  <VStack align="start" spacing={1}>
                    <Text fontWeight="bold">
                      {record.title || `Shared Record #${record.recordId}`}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                      Shared on: {new Date(record.timestamp).toLocaleString()}
                    </Text>
                  </VStack>
                  <CategoryLabels category={record.category} />
                </HStack>

                {record.description && (
                  <Text color="gray.600">{record.description}</Text>
                )}

                {record.tags && record.tags.length > 0 && (
                  <Wrap spacing={2}>
                    {record.tags.map((tag, index) => (
                      <WrapItem key={index}>
                        <Tag size="sm" colorScheme="blue">
                          {tag}
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                )}

                <HStack justify="flex-end" pt={2}>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => handleDownload(record)}
                  >
                    Download
                  </Button>
                </HStack>
              </VStack>
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
