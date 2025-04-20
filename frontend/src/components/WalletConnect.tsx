import {
  Button,
  Text,
  Box,
  useToast,
  Spinner,
  VStack,
  HStack,
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../utils/web3';
import { useState, useEffect } from 'react';
import { FiKey } from 'react-icons/fi';
import { Icon } from './Icon';

const WalletConnect = () => {
  const { active, account, activate, deactivate } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  // Handle connection on page load
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      // Check if ethereum is injected
      if (window.ethereum && localStorage.getItem('previouslyConnected') === 'true') {
        try {
          await activate(injected);
        } catch (error) {
          console.error('Error on page load:', error);
        }
      }
    };
    connectWalletOnPageLoad();
  }, [activate]);

  const connect = async () => {
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

    setLoading(true);
    try {
      await activate(injected);
      localStorage.setItem('previouslyConnected', 'true');
      toast({
        title: 'Wallet Connected',
        description: 'Successfully connected to your wallet',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error: any) {
      console.error('Connection Error:', error);
      toast({
        title: 'Connection Failed',
        description: error.message || 'Failed to connect to wallet',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const disconnect = () => {
    try {
      deactivate();
      localStorage.removeItem('previouslyConnected');
      toast({
        title: 'Wallet Disconnected',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  };

  if (loading) {
    return (
      <Button size="sm" disabled>
        <HStack spacing={2}>
          <Spinner size="sm" />
          <Text>Connecting...</Text>
        </HStack>
      </Button>
    );
  }

  return (
    <Box>
      {active ? (
        <VStack spacing={2} align="flex-end">
          <Text color="white" fontSize="sm">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </Text>
          <Button
            onClick={disconnect}
            colorScheme="red"
            size="sm"
            variant="ghost"
            _hover={{ bg: 'whiteAlpha.200' }}
          >
            Disconnect
          </Button>
        </VStack>
      ) : (
        <Button
          onClick={connect}
          colorScheme="blue"
          size="sm"
          leftIcon={<Icon icon={FiKey} />}
          _hover={{ bg: 'whiteAlpha.200' }}
          variant="ghost"
        >
          Connect Wallet
        </Button>
      )}
    </Box>
  );
};

export default WalletConnect;