import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Container,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Divider,
  useClipboard,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { 
  FiCopy, 
  FiExternalLink, 
  FiLogOut, 
  FiUser,
  FiKey
} from 'react-icons/fi';
import { Icon } from './Icon';
import { injected } from '../utils/web3';
import { useState } from 'react';

const Navbar = () => {
  const { active, account, deactivate, activate } = useWeb3React();
  const navigate = useNavigate();
  const { onCopy } = useClipboard(account || '');
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const buttonHoverBg = useColorModeValue('gray.50', 'gray.700');
  const brandColor = useColorModeValue('blue.500', 'blue.300');

  const handleCopyAddress = () => {
    onCopy();
    toast({
      title: 'Address copied',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handleConnect = async () => {
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

  const handleDisconnect = () => {
    try {
      deactivate();
      localStorage.removeItem('previouslyConnected');
      toast({
        title: 'Wallet Disconnected',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
      navigate('/');
    } catch (error) {
      console.error('Error on disconnect:', error);
    }
  };

  const shortenAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  return (
    <Box
      position="sticky"
      top={0}
      zIndex={10}
      bg={bg}
      borderBottom="1px"
      borderColor={borderColor}
      py={2}
    >
      <Container maxW="container.xl">
        <Flex alignItems="center" justifyContent="space-between" height="48px">
          <Flex alignItems="center" gap={8}>
            <Box
              as={Link}
              to="/"
              fontSize="xl"
              fontWeight="semibold"
              color={brandColor}
              _hover={{ color: useColorModeValue('blue.600', 'blue.200') }}
              letterSpacing="tight"
            >
              HealthChain
            </Box>
            <Flex gap={6}>
              <Button
                as={Link}
                to="/dashboard"
                variant="ghost"
                color={textColor}
                size="sm"
                fontWeight="medium"
                px={3}
                _hover={{ bg: buttonHoverBg }}
              >
                Dashboard
              </Button>
              <Button
                as={Link}
                to="/records"
                variant="ghost"
                color={textColor}
                size="sm"
                fontWeight="medium"
                px={3}
                _hover={{ bg: buttonHoverBg }}
              >
                Records
              </Button>
              <Button
                as={Link}
                to="/shared"
                variant="ghost"
                color={textColor}
                size="sm"
                fontWeight="medium"
                px={3}
                _hover={{ bg: buttonHoverBg }}
              >
                Shared Access
              </Button>
            </Flex>
          </Flex>

          <Box>
            {active ? (
              <Menu>
                <MenuButton
                  as={Button}
                  size="sm"
                  variant="outline"
                  colorScheme="blue"
                  leftIcon={<Icon icon={FiKey} boxSize={4} />}
                  rightIcon={<Icon icon={FiUser} boxSize={4} />}
                  _hover={{ bg: buttonHoverBg }}
                  fontWeight="medium"
                >
                  {account ? shortenAddress(account) : 'Connected'}
                </MenuButton>
                <MenuList
                  shadow="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  py={2}
                >
                  <Box px={4} py={2}>
                    <Text fontSize="sm" color={textColor} fontWeight="medium">
                      Connected Wallet
                    </Text>
                    <Text fontSize="xs" color={textColor} mt={1}>
                      {account}
                    </Text>
                  </Box>
                  <Divider my={2} />
                  <MenuItem
                    icon={<Icon icon={FiCopy} boxSize={4} />}
                    onClick={handleCopyAddress}
                    fontSize="sm"
                  >
                    Copy Address
                  </MenuItem>
                  <MenuItem
                    icon={<Icon icon={FiExternalLink} boxSize={4} />}
                    onClick={() => window.open(`https://etherscan.io/address/${account}`, '_blank')}
                    fontSize="sm"
                  >
                    View on Etherscan
                  </MenuItem>
                  <Divider my={2} />
                  <MenuItem
                    icon={<Icon icon={FiLogOut} boxSize={4} />}
                    onClick={handleDisconnect}
                    fontSize="sm"
                    color="red.500"
                  >
                    Disconnect
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <Button
                size="sm"
                colorScheme="blue"
                leftIcon={loading ? <Spinner size="sm" /> : <Icon icon={FiKey} boxSize={4} />}
                onClick={handleConnect}
                fontWeight="medium"
                disabled={loading}
              >
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;