import React from 'react';
import { Box } from '@chakra-ui/react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from './Navbar';
import { LoadingSpinner } from './LoadingSpinner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner message="Loading..." />;
  }

  return (
    <Box>
      {isAuthenticated && <Navbar />}
      <Box as="main" p={4}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 