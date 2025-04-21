import React, { useState, useEffect } from 'react';
import {
  Button,
  Text,
  Box,
  useToast,
  Spinner,
  VStack,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../utils/web3';
import { FiKey } from 'react-icons/fi';
import Icon from './Icon';
import { connectWallet } from '../services/api';

const WalletConnect = () => {
  const { active, account, activate, deactivate } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const buttonBg = useColorModeValue('gray.100', 'whiteAlpha.200');
  const buttonHoverBg = useColorModeValue('gray.200', 'whiteAlpha.300');
  const textColor = useColorModeValue('gray.800', 'white');

  // Handle connection on page load
  useEffect(() => {
    const connectWalletOnPageLoad = async () => {
      if (window.ethereum && localStorage.getItem('previouslyConnected') === 'true') {
        try {
          setLoading(true);
          await activate(injected);
          
          // Connect wallet to backend if account is available
          if (account) {
            await connectWallet(account);
          }
        } catch (error) {
          console.error('Error on page load:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    connectWalletOnPageLoad();
  }, [activate, account]);

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
      <Button size="sm" disabled bg={buttonBg}>
        <HStack spacing={2}>
          <Spinner size="sm" />
          <Text color={textColor}>Connecting...</Text>
        </HStack>
      </Button>
    );
  }

  return (
    <Box>
      {active ? (
        <VStack spacing={2} align="flex-end">
          <Text color={textColor} fontSize="sm">
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </Text>
          <Button
            onClick={disconnect}
            colorScheme="red"
            size="sm"
            variant="ghost"
            _hover={{ bg: buttonHoverBg }}
          >
            Disconnect
          </Button>
        </VStack>
      ) : (
        <Button
          onClick={connect}
          colorScheme="blue"
          size="sm"
          leftIcon={<Icon icon={FiKey} boxSize={4} />}
          bg={buttonBg}
          _hover={{ bg: buttonHoverBg }}
          color={textColor}
        >
          Connect Wallet
        </Button>
      )}
    </Box>
  );
};

export default WalletConnect;