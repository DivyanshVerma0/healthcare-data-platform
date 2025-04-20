import React, { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Select,
  Input,
  Button,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  useToast,
} from '@chakra-ui/react';
import { ethers } from 'ethers';

export enum Category {
  GENERAL,
  LAB_REPORT,
  PRESCRIPTION,
  IMAGING,
  VACCINATION,
  SURGERY,
  CONSULTATION,
  EMERGENCY,
  OTHER
}

const CategoryLabels: Record<Category, string> = {
  [Category.GENERAL]: 'General',
  [Category.LAB_REPORT]: 'Lab Report',
  [Category.PRESCRIPTION]: 'Prescription',
  [Category.IMAGING]: 'Imaging',
  [Category.VACCINATION]: 'Vaccination',
  [Category.SURGERY]: 'Surgery',
  [Category.CONSULTATION]: 'Consultation',
  [Category.EMERGENCY]: 'Emergency',
  [Category.OTHER]: 'Other'
};

interface RecordMetadataProps {
  recordId?: string;
  contract: ethers.Contract;
  initialCategory?: Category;
  initialTags?: string[];
  isEditing?: boolean;
  onMetadataChange?: (category: Category, tags: string[]) => void;
}

const RecordMetadata: React.FC<RecordMetadataProps> = ({
  recordId,
  contract,
  initialCategory = Category.GENERAL,
  initialTags = [],
  isEditing = false,
  onMetadataChange
}) => {
  const [category, setCategory] = useState<Category>(initialCategory);
  const [tags, setTags] = useState<string[]>(initialTags);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  const handleCategoryChange = (value: string) => {
    const newCategory = parseInt(value) as Category;
    setCategory(newCategory);
    onMetadataChange?.(newCategory, tags);
  };

  const addTag = () => {
    if (!newTag.trim()) return;
    
    const trimmedTag = newTag.trim().toLowerCase();
    if (tags.includes(trimmedTag)) {
      toast({
        title: "Tag already exists",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    
    const updatedTags = [...tags, trimmedTag];
    setTags(updatedTags);
    setNewTag('');
    onMetadataChange?.(category, updatedTags);
  };

  const removeTag = (tagToRemove: string) => {
    const updatedTags = tags.filter(tag => tag !== tagToRemove);
    setTags(updatedTags);
    onMetadataChange?.(category, updatedTags);
  };

  const updateTags = async () => {
    if (!recordId || !contract) return;

    try {
      setIsLoading(true);
      const tx = await contract.updateTags(recordId, tags);
      
      toast({
        title: "Updating tags...",
        description: "Please wait for the transaction to be confirmed",
        status: "info",
        duration: 3000,
      });

      await tx.wait();
      
      toast({
        title: "Tags updated successfully",
        status: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error('Error updating tags:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update tags",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Select
        value={category}
        onChange={(e) => handleCategoryChange(e.target.value)}
        isDisabled={!isEditing}
      >
        {Object.entries(CategoryLabels).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </Select>

      {isEditing && (
        <HStack>
          <Input
            placeholder="Add a tag"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTag()}
          />
          <Button onClick={addTag} isDisabled={!newTag.trim()}>
            Add
          </Button>
        </HStack>
      )}

      <Wrap spacing={2}>
        {tags.map((tag) => (
          <WrapItem key={tag}>
            <Tag
              size="md"
              borderRadius="full"
              variant="solid"
              colorScheme="blue"
            >
              <TagLabel>{tag}</TagLabel>
              {isEditing && (
                <TagCloseButton onClick={() => removeTag(tag)} />
              )}
            </Tag>
          </WrapItem>
        ))}
      </Wrap>

      {isEditing && recordId && (
        <Button
          colorScheme="blue"
          onClick={updateTags}
          isLoading={isLoading}
          mt={2}
        >
          Update Tags
        </Button>
      )}
    </VStack>
  );
};

export default RecordMetadata; 