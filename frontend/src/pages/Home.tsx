import { Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <Box p={8}>
      <VStack spacing={8}>
        <Heading>Welcome to Healthcare Data Platform</Heading>
        <Text>Take control of your medical records with blockchain technology</Text>
        <Button as={Link} to="/dashboard" colorScheme="blue" size="lg">
          Get Started
        </Button>
      </VStack>
    </Box>
  );
};

export default Home;