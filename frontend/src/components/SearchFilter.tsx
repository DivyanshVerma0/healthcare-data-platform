// filepath: e:\Coding\Hackindia\healthcare-data-platform\frontend\src\components\SearchFilter.tsx
import React, { useState, useEffect } from 'react';
import { Input, InputGroup, InputLeftElement, InputRightElement, IconButton } from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';

interface SearchFilterProps {
  onSearch: (query: string) => void;
}

const SearchFilter = ({ onSearch }: SearchFilterProps) => {
  const [nameQuery, setNameQuery] = useState('');

  const handleSearch = () => {
    onSearch(nameQuery.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleClear = () => {
    setNameQuery('');
    onSearch('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameQuery(e.target.value);
    if (!e.target.value) {
      onSearch('');
    }
  };

  return (
    <InputGroup>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.300" />
      </InputLeftElement>
      <Input
        placeholder="Search records by name..."
        value={nameQuery}
        onChange={handleChange}
        onKeyPress={handleKeyPress}
      />
      <InputRightElement>
        {nameQuery ? (
          <IconButton
            size="sm"
            aria-label="Clear search"
            icon={<CloseIcon />}
            onClick={handleClear}
            variant="ghost"
          />
        ) : (
          <IconButton
            size="sm"
            aria-label="Search"
            icon={<SearchIcon />}
            onClick={handleSearch}
            variant="ghost"
          />
        )}
      </InputRightElement>
    </InputGroup>
  );
};

export default SearchFilter;