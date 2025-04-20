import React from 'react';
import { Tag, TagLabel } from '@chakra-ui/react';

export enum Category {
  GENERAL = 0,
  LAB_REPORT = 1,
  PRESCRIPTION = 2,
  IMAGING = 3,
  VACCINATION = 4,
  SURGERY = 5,
  CONSULTATION = 6,
  EMERGENCY = 7,
  OTHER = 8
}

export const CATEGORY_NAMES = {
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

interface CategoryLabelsProps {
  category: Category;
}

export const CategoryLabels: React.FC<CategoryLabelsProps> = ({ category }) => {
  const categoryName = CATEGORY_NAMES[category] || 'Unknown';
  const colorScheme = getCategoryColor(category);

  return (
    <Tag size="md" variant="solid" colorScheme={colorScheme} mr={2}>
      <TagLabel>{categoryName}</TagLabel>
    </Tag>
  );
};

const getCategoryColor = (category: Category): string => {
  const colors = {
    [Category.GENERAL]: 'blue',
    [Category.LAB_REPORT]: 'green',
    [Category.PRESCRIPTION]: 'purple',
    [Category.IMAGING]: 'orange',
    [Category.VACCINATION]: 'teal',
    [Category.SURGERY]: 'red',
    [Category.CONSULTATION]: 'pink',
    [Category.EMERGENCY]: 'yellow',
    [Category.OTHER]: 'gray'
  };
  return colors[category] || 'gray';
}; 