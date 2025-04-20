// filepath: e:\Coding\Hackindia\healthcare-data-platform\frontend\src\components\SearchFilter.tsx
import React, { useState } from 'react';
import { Input, Button, HStack, Select, VStack } from '@chakra-ui/react';
import { Category, CATEGORY_NAMES } from './CategoryLabels';

interface SearchFilterProps {
    onSearch: (query: string, category: Category | null) => void;
}

const SearchFilter: React.FC<SearchFilterProps> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

    const handleSearch = () => {
        onSearch(searchQuery, selectedCategory);
    };

    return (
        <VStack spacing={4} align="stretch">
            <HStack spacing={4}>
                <Input
                    placeholder="Search by tags or provider"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Select
                    placeholder="Select category"
                    value={selectedCategory !== null ? selectedCategory : ''}
                    onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) as Category : null)}
                >
                    {Object.entries(CATEGORY_NAMES).map(([value, name]) => (
                        <option key={value} value={value}>
                            {name}
                        </option>
                    ))}
                </Select>
                <Button colorScheme="blue" onClick={handleSearch}>
                    Search
                </Button>
            </HStack>
        </VStack>
    );
};

export default SearchFilter;