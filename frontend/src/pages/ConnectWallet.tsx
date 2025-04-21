import React, { useState } from 'react';
import {
  Box,
  Button,
  Container,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  Card,
  CardBody,
  Stack,
  Icon,
  List,
  ListItem,
  ListIcon,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { FiCheck } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../utils/web3';
import { useAuth } from '../contexts/AuthContext';
import { connectWallet } from '../services/api';

const ConnectWallet = () => {
  const navigate = useNavigate();
  const { activate, account } = useWeb3React();
  const { user } = useAuth();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Color scheme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  const handleConnectWallet = async () => {
    if (!window.ethereum) {
      toast({
        title: 'MetaMask not found',
        description: 'Please install MetaMask browser extension',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      await activate(injected);
      localStorage.setItem('previouslyConnected', 'true');
      
      // Connect wallet to backend
      if (account) {
        await connectWallet(account);
      }
      
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to your wallet',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      
      // Navigate to dashboard after successful connection
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Failed to connect wallet:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box bg={bgColor} minH="100vh" py={20}>
      <Container maxW="container.sm">
        <Card bg={cardBg} borderRadius="xl" boxShadow="xl">
          <CardBody p={8}>
            <VStack spacing={8}>
              <Stack spacing={4} textAlign="center">
                <Box as="span" color="blue.500" fontSize="4xl">
                  <Icon viewBox="0 0 24 24" w={12} h={12}>
                    <path
                      fill="currentColor"
                      d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                    />
                  </Icon>
                </Box>
                <Heading size="xl" color={headingColor}>
                  Connect Your Wallet
                </Heading>
                <Text color={textColor}>
                  Connect your wallet to access your {user?.role?.toLowerCase()} dashboard
                </Text>
              </Stack>

              <List spacing={4} width="100%">
                <ListItem>
                  <ListIcon as={FiCheck as any} color="green.500" />
                  <Text as="span" color={textColor}>
                    Secure your medical records with blockchain technology
                  </Text>
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheck as any} color="green.500" />
                  <Text as="span" color={textColor}>
                    Maintain full control over your data
                  </Text>
                </ListItem>
                <ListItem>
                  <ListIcon as={FiCheck as any} color="green.500" />
                  <Text as="span" color={textColor}>
                    Access your dashboard and manage your profile
                  </Text>
                </ListItem>
              </List>

              <Button
                colorScheme="blue"
                size="lg"
                width="full"
                leftIcon={isLoading ? <Spinner size="sm" /> : <Icon viewBox="0 0 24 24" w={5} h={5}>
                  <path
                    fill="currentColor"
                    d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                  />
                </Icon>}
                onClick={handleConnectWallet}
                isLoading={isLoading}
                loadingText="Connecting..."
              >
                Connect Wallet
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default ConnectWallet; 