import React from 'react';
import {
  Box,
  VStack,
  Text,
  Button,
  HStack,
  Badge,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiEye, FiDownload, FiShare2 } from 'react-icons/fi';
import Icon from './Icon';

export interface Record {
  id: string;
  name: string;
  description: string;
  ipfsHash: string;
  owner: string;
  timestamp: string;
}

interface RecordCardProps {
  record: Record;
  onView: () => void;
  onShare?: () => void;
  onDownload?: () => void;
  showActions?: boolean;
}

export const RecordCard: React.FC<RecordCardProps> = ({
  record,
  onView,
  onShare,
  onDownload,
  showActions = true,
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <Box
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      p={4}
      shadow="sm"
      transition="all 0.2s"
      _hover={{ shadow: 'md' }}
    >
      <VStack align="stretch" spacing={3}>
        <Box>
          <HStack justify="space-between" align="flex-start">
            <Text fontWeight="semibold" fontSize="lg" noOfLines={1}>
              {record.name}
            </Text>
            <Badge colorScheme="blue" fontSize="xs">
              {new Date(record.timestamp).toLocaleDateString()}
            </Badge>
          </HStack>
          <Text color={textColor} fontSize="sm" noOfLines={2} mt={1}>
            {record.description}
          </Text>
        </Box>

        <Box>
          <Text fontSize="xs" color={textColor}>
            IPFS Hash: {record.ipfsHash.slice(0, 8)}...{record.ipfsHash.slice(-6)}
          </Text>
          <Text fontSize="xs" color={textColor}>
            Owner: {record.owner.slice(0, 6)}...{record.owner.slice(-4)}
          </Text>
        </Box>

        {showActions && (
          <HStack spacing={2} mt={2}>
            <Button
              size="sm"
              leftIcon={<Icon icon={FiEye} boxSize={4} />}
              onClick={onView}
              flex={1}
            >
              View
            </Button>
            {onDownload && (
              <Button
                size="sm"
                leftIcon={<Icon icon={FiDownload} boxSize={4} />}
                onClick={onDownload}
                flex={1}
              >
                Download
              </Button>
            )}
            {onShare && (
              <Button
                size="sm"
                leftIcon={<Icon icon={FiShare2} boxSize={4} />}
                onClick={onShare}
                flex={1}
              >
                Share
              </Button>
            )}
          </HStack>
        )}
      </VStack>
    </Box>
  );
};

export default RecordCard; 