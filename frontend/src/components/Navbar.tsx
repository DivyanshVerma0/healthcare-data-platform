import React from 'react';
import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
  Badge,
  MenuButton,
  MenuDivider,
  useToast,
  VStack,
  Tooltip,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  CopyIcon,
  ExternalLinkIcon,
  SmallCloseIcon,
} from '@chakra-ui/icons';
import { useWeb3React } from '@web3-react/core';
import WalletConnect from './WalletConnect';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const NavLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  return (
    <Link to={href} style={{ textDecoration: 'none' }}>
      <Button
        variant="ghost"
        size="sm"
        px={3}
        _hover={{
          bg: hoverBg,
        }}
      >
        {children}
      </Button>
    </Link>
  );
};

const WalletMenuItem: React.FC<WalletMenuItemProps> = ({ 
  icon, 
  label, 
  onClick, 
  color, 
  hoverBg, 
  isDestructive = false 
}) => (
  <MenuItem
    icon={icon}
    onClick={onClick}
    transition="all 0.2s"
    _hover={{
      bg: isDestructive ? 'red.50' : hoverBg,
      color: isDestructive ? 'red.500' : color,
      transform: 'translateX(5px)',
    }}
    color={isDestructive ? 'red.500' : 'inherit'}
    borderRadius="md"
    mx={1}
    px={3}
  >
    {label}
  </MenuItem>
);

const Navbar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user } = useAuth();
  const { account, deactivate } = useWeb3React();
  const toast = useToast();
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.700', 'gray.200');
  const iconColor = useColorModeValue('gray.600', 'gray.400');
  const connectedColor = useColorModeValue('green.500', 'green.300');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const menuBg = useColorModeValue('white', 'gray.800');
  const menuBorderColor = useColorModeValue('gray.200', 'gray.600');
  const menuItemHoverBg = useColorModeValue('gray.50', 'gray.700');
  const menuItemColor = useColorModeValue('gray.700', 'gray.300');
  const gradientFrom = useColorModeValue('white', 'gray.800');
  const gradientTo = useColorModeValue('gray.50', 'gray.700');

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleCopyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account);
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
        status: "success",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    }
  };

  const handleDisconnect = () => {
    if (deactivate) {
      deactivate();
      toast({
        title: "Wallet disconnected",
        description: "Your wallet has been disconnected",
        status: "info",
        duration: 2000,
        isClosable: true,
        position: "top-right"
      });
    }
  };

  const handleViewOnExplorer = () => {
    if (account) {
      window.open(`https://etherscan.io/address/${account}`, '_blank');
    }
  };

  return (
    <Box bg={bgColor} px={4} borderBottom={1} borderStyle={'solid'} borderColor={borderColor}>
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box>
            <Link to="/">
              <Text fontSize="xl" fontWeight="bold" color={textColor}>
                Healthcare Platform
              </Text>
            </Link>
          </Box>
          <HStack
            as={'nav'}
            spacing={4}
            display={{ base: 'none', md: 'flex' }}
          >
            <NavLink href="/dashboard">Dashboard</NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink href="/admin">Admin</NavLink>
            )}
          </HStack>
        </HStack>

        <Flex alignItems={'center'}>
          <Menu>
            <Tooltip
              label={account ? 'Connected' : 'Connect Wallet'}
              hasArrow
              placement="bottom"
            >
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
                rightIcon={<ChevronDownIcon />}
                px={3}
                color={account ? connectedColor : 'gray.500'}
                _hover={{ bg: hoverBg }}
                transition="all 0.2s"
              >
                {account ? (
                  <HStack>
                    <Box 
                      w={2} 
                      h={2} 
                      borderRadius="full" 
                      bg={connectedColor}
                      boxShadow={`0 0 10px ${connectedColor}`}
                    />
                    <Text>{formatAddress(account)}</Text>
                  </HStack>
                ) : (
                  'Connect Wallet'
                )}
              </MenuButton>
            </Tooltip>
            <MenuList
              bg={menuBg}
              borderColor={menuBorderColor}
              shadow="xl"
              p={0}
              overflow="hidden"
              minW="300px"
              borderRadius="xl"
            >
              {account ? (
                <>
                  <Box
                    px={4}
                    py={4}
                    bgGradient={`linear(to-b, ${gradientFrom}, ${gradientTo})`}
                  >
                    <Text fontSize="sm" color="gray.500" mb={2}>
                      Connected Wallet
                    </Text>
                    <HStack spacing={3}>
                      <Box 
                        w={2} 
                        h={2} 
                        borderRadius="full" 
                        bg={connectedColor}
                        boxShadow={`0 0 10px ${connectedColor}`}
                      />
                      <Text 
                        fontWeight="semibold" 
                        fontSize="md"
                        letterSpacing="wide"
                      >
                        {formatAddress(account)}
                      </Text>
                    </HStack>
                  </Box>
                  <VStack align="stretch" py={2}>
                    <WalletMenuItem
                      icon={<CopyIcon />}
                      label="Copy Address"
                      onClick={handleCopyAddress}
                      color={menuItemColor}
                      hoverBg={menuItemHoverBg}
                    />
                    <WalletMenuItem
                      icon={<ExternalLinkIcon />}
                      label="View on Explorer"
                      onClick={handleViewOnExplorer}
                      color={menuItemColor}
                      hoverBg={menuItemHoverBg}
                    />
                    <MenuDivider my={2} />
                    <WalletMenuItem
                      icon={<SmallCloseIcon />}
                      label="Disconnect Wallet"
                      onClick={handleDisconnect}
                      color={menuItemColor}
                      hoverBg={menuItemHoverBg}
                      isDestructive
                    />
                  </VStack>
                </>
              ) : (
                <VStack align="stretch" p={4} spacing={3}>
                  <Text 
                    fontSize="sm" 
                    color="gray.500"
                    fontWeight="medium"
                  >
                    Connect your wallet
                  </Text>
                  <Box>
                    <WalletConnect />
                  </Box>
                </VStack>
              )}
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            <NavLink href="/dashboard">Dashboard</NavLink>
            {user?.role === 'ADMIN' && (
              <NavLink href="/admin">Admin</NavLink>
            )}
          </Stack>
        </Box>
      ) : null}
    </Box>
  );
};

interface WalletMenuItemProps {
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
  color: string;
  hoverBg: string;
  isDestructive?: boolean;
}

export default Navbar;