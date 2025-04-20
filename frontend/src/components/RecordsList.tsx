// File: frontend/src/components/RecordsList.tsx

import React from 'react';
import {
  VStack,
  Text,
  Button,
} from '@chakra-ui/react';
import { RepeatIcon } from '@chakra-ui/icons';
import { MedicalRecord } from '../types/records';
import { RecordCard } from './RecordCard';

interface RecordsListProps {
  records: MedicalRecord[];
  onRefresh: () => void;
  onShare?: (recordId: string) => void;
}

const RecordsList: React.FC<RecordsListProps> = ({ records, onRefresh, onShare }) => {
  return (
    <VStack spacing={4} align="stretch">
      {records.length > 0 ? (
        <VStack spacing={3} align="stretch">
          {records.map((record) => (
            <RecordCard
              key={record.recordId}
              id={record.recordId}
              title={record.title || `Record #${record.recordId}`}
              description={record.description || 'No description available'}
              category={record.category}
              ipfsHash={record.ipfsHash}
              date={record.timestamp.toISOString()}
              onShare={onShare ? () => onShare(record.recordId) : undefined}
              showShareButton={!!onShare}
            />
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