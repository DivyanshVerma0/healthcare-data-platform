import React, { useEffect, useState } from 'react';
import {
  VStack,
  Text,
  Button,
  Box,
  HStack,
  Tag,
  TagLabel,
  Divider,
  useToast,
  Spinner,
  IconButton,
  Input,
  Select,
} from '@chakra-ui/react';
import { EditIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { ethers } from 'ethers';
import { downloadFromIPFS } from '../utils/ipfs';
import RecordMetadata, { Category } from './RecordMetadata';
import { CategoryLabels } from './CategoryLabels';
import SharedAccessList from './SharedAccessList';
import EmergencyAccess from './EmergencyAccess';

interface RecordDetailsProps {
  recordId: string;
  contract: ethers.Contract;
  account: string;
}

interface RecordData {
  ipfsHash: string;
  isEncrypted: boolean;
  owner: string;
  category: number;
  tags: string[];
}

const CATEGORIES = [
  'GENERAL',
  'PRESCRIPTION',
  'LAB_RESULT',
  'IMAGING',
  'VACCINATION',
  'SURGERY',
  'OTHER'
];

interface SharedAccessListProps {
  recordId: string;
  contract: ethers.Contract;
  isOwner: boolean;
}

interface EmergencyAccessProps {
  recordId: string;
  contract: ethers.Contract;
  isOwner: boolean;
}

const RecordDetails: React.FC<RecordDetailsProps> = ({ recordId, contract, account }) => {
  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<RecordData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editTags, setEditTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const toast = useToast();

  useEffect(() => {
    fetchRecordDetails();
  }, [recordId, contract]);

  const fetchRecordDetails = async () => {
    try {
      setLoading(true);
      const details = await contract.getRecordDetails(recordId);
      setRecord({
        ipfsHash: details.ipfsHash,
        isEncrypted: details.isEncrypted,
        owner: details.owner,
        category: details.category,
        tags: details.tags
      });
    } catch (error) {
      console.error('Error fetching record details:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch record details',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!record) return;
    try {
      await downloadFromIPFS(record.ipfsHash);
      toast({
        title: 'Success',
        description: 'File download started',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: 'Error',
        description: 'Failed to download file',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const startEditing = () => {
    if (record) {
      setEditTags([...record.tags]);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setNewTag('');
  };

  const addTag = () => {
    if (newTag && !editTags.includes(newTag)) {
      setEditTags([...editTags, newTag]);
      setNewTag('');
    }
  };

  const removeTag = (index: number) => {
    setEditTags(editTags.filter((_, i) => i !== index));
  };

  const saveChanges = async () => {
    try {
      await contract.updateTags(recordId, editTags);
      toast({
        title: 'Success',
        description: 'Tags updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setIsEditing(false);
      await fetchRecordDetails();
    } catch (error) {
      console.error('Error updating tags:', error);
      toast({
        title: 'Error',
        description: 'Failed to update tags',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAccessChanged = () => {
    fetchRecordDetails();
  };

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <Spinner />
      </Box>
    );
  }

  if (!record) {
    return (
      <Box p={4}>
        <Text>Record not found</Text>
      </Box>
    );
  }

  const isOwner = record.owner.toLowerCase() === account.toLowerCase();

  return (
    <VStack spacing={6} align="stretch">
      <Box borderWidth="1px" borderRadius="lg" p={4}>
        <VStack align="stretch" spacing={4}>
          <HStack justify="space-between">
            <Text fontWeight="bold" fontSize="lg">Record Details</Text>
            {isOwner && !isEditing && (
              <IconButton
                aria-label="Edit metadata"
                icon={<EditIcon />}
                onClick={startEditing}
              />
            )}
          </HStack>
          
          <Box>
            <Text fontWeight="bold">Category:</Text>
            <Tag size="md" colorScheme="blue" mt={1}>
              <TagLabel>{CATEGORIES[record.category]}</TagLabel>
            </Tag>
          </Box>

          <Box>
            <Text fontWeight="bold">Tags:</Text>
            {isEditing ? (
              <VStack align="stretch" spacing={2} mt={2}>
                <HStack wrap="wrap" spacing={2}>
                  {editTags.map((tag, index) => (
                    <Tag
                      key={index}
                      size="md"
                      colorScheme="green"
                      variant="solid"
                    >
                      <TagLabel>{tag}</TagLabel>
                      <IconButton
                        size="xs"
                        ml={1}
                        icon={<CloseIcon />}
                        aria-label="Remove tag"
                        onClick={() => removeTag(index)}
                      />
                    </Tag>
                  ))}
                </HStack>
                <HStack>
                  <Input
                    placeholder="Add new tag"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                  />
                  <Button onClick={addTag}>Add</Button>
                </HStack>
                <HStack>
                  <Button colorScheme="green" onClick={saveChanges}>
                    Save Changes
                  </Button>
                  <Button onClick={cancelEditing}>Cancel</Button>
                </HStack>
              </VStack>
            ) : (
              <HStack wrap="wrap" spacing={2} mt={1}>
                {record.tags.map((tag, index) => (
                  <Tag key={index} size="md" colorScheme="green">
                    <TagLabel>{tag}</TagLabel>
                  </Tag>
                ))}
              </HStack>
            )}
          </Box>

          <Button
            colorScheme="blue"
            onClick={handleDownload}
            isDisabled={!record.ipfsHash}
          >
            Download Record
          </Button>
        </VStack>
      </Box>

      <Divider />

      <Box>
        <Text fontWeight="bold" mb={4}>Access Control</Text>
        <VStack spacing={4} align="stretch">
          <SharedAccessList
            recordId={recordId}
            contract={contract}
            isOwner={isOwner}
            onAccessRevoked={handleAccessChanged}
          />
          <EmergencyAccess
            recordId={recordId}
            contract={contract}
            isOwner={isOwner}
            onAccessChanged={handleAccessChanged}
          />
        </VStack>
      </Box>
    </VStack>
  );
};

export default RecordDetails; 