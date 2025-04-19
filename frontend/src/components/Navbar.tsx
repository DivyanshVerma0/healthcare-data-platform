import { Box, Button, Flex, Heading } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import WalletConnect from './WalletConnect';

const Navbar = () => {
  return (
    <Box bg="blue.500" px={4} py={2}>
      <Flex justifyContent="space-between" alignItems="center">
        <Heading size="md" color="white">Healthcare Data Platform</Heading>
        <Flex gap={4} alignItems="center">
          <Button as={Link} to="/" colorScheme="whiteAlpha">Home</Button>
          <Button as={Link} to="/dashboard" colorScheme="whiteAlpha">Dashboard</Button>
          <Button as={Link} to="/records" colorScheme="whiteAlpha">Records</Button>
          <WalletConnect />
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;