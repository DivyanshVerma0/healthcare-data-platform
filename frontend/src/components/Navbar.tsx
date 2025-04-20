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

const Navbar = () => {
  const { active, account, deactivate } = useWeb3React();
  const navigate = useNavigate();
  const { onCopy } = useClipboard(account || '');
  const toast = useToast();

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

  const handleDisconnect = () => {
    deactivate();
    navigate('/');
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
                leftIcon={<Icon icon={FiKey} boxSize={4} />}
                onClick={() => navigate('/connect')}
                fontWeight="medium"
              >
                Connect Wallet
              </Button>
            )}
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default Navbar;