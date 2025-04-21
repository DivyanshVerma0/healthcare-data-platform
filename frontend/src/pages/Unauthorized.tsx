import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Text, Box, Container, VStack, Icon } from '@chakra-ui/react';
import { FiAlertCircle } from 'react-icons/fi';

const Unauthorized: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxW="container.md">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minH="80vh"
        textAlign="center"
      >
        <Box
          p={10}
          borderRadius="lg"
          boxShadow="lg"
          bg="white"
          w="100%"
          maxW="600px"
        >
          <Icon as={FiAlertCircle as any} color="red.500" boxSize={20} mb={4} />
          <Text fontSize="2xl" fontWeight="bold" mb={4}>
            Access Denied
          </Text>
          <Text color="gray.600" mb={8}>
            You don't have permission to access this page. Please contact your administrator if you believe this is an error.
          </Text>
          <Box>
            <Button
              colorScheme="blue"
              onClick={() => navigate('/dashboard')}
              mr={4}
            >
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Unauthorized; 