import React from 'react';
import { Spinner, Box, Text } from '@chakra-ui/react';

interface LoadingSpinnerProps {
  message?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...' }) => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="200px"
    >
      <Spinner size="xl" />
      <Text mt={4} color="gray.500">
        {message}
      </Text>
    </Box>
  );
}; 