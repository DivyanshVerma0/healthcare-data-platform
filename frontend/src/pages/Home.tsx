import React from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Stack,
  useColorModeValue,
  VStack,
  HStack,
  Image,
  Icon,
} from '@chakra-ui/react';
import { FiShield, FiShare2, FiDatabase, FiLock, FiCheckCircle, FiTrendingUp, FiUsers, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWeb3React } from '@web3-react/core';
import { IconType } from 'react-icons';

const FEATURES = [
  {
    icon: FiDatabase,
    title: 'Secure Storage',
    description: 'Store medical records securely on the blockchain with end-to-end encryption',
  },
  {
    icon: FiShare2,
    title: 'Easy Sharing',
    description: 'Share records with healthcare providers instantly with granular access control',
  },
  {
    icon: FiShield,
    title: 'Data Privacy',
    description: 'Your data remains private and under your control at all times',
  },
  {
    icon: FiSearch,
    title: 'Quick Access',
    description: 'Find and retrieve medical records instantly when needed',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { account } = useWeb3React();
  
  // Color scheme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = useColorModeValue('blue.500', 'blue.600');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const iconBgColor = useColorModeValue('blue.50', 'blue.900');
  const sectionBgColor = useColorModeValue('gray.100', 'gray.800');

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Hero Section */}
      <Box 
        bg={accentColor}
        color="white" 
        py={{ base: 20, md: 28 }}
        position="relative"
        overflow="hidden"
      >
        <Container maxW="container.xl">
          <Stack spacing={8} maxW="2xl">
            <Heading
              fontSize={{ base: '3xl', md: '4xl', lg: '5xl' }}
              fontWeight="bold"
              lineHeight="shorter"
            >
              Revolutionizing Healthcare Records Management with Blockchain Technology
            </Heading>
            <Text fontSize={{ base: 'lg', md: 'xl' }} opacity={0.9}>
              Secure, transparent, and efficient medical record management for patients and healthcare providers.
              Take control of your health data with our innovative blockchain solution.
            </Text>
            <Stack direction={{ base: 'column', sm: 'row' }} spacing={4}>
              {isAuthenticated ? (
                <>
                  <Button
                    size="lg"
                    bg="white"
                    color={accentColor}
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => navigate('/dashboard')}
                  >
                    Go to Dashboard
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={() => navigate('/records')}
                  >
                    View Records
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="lg"
                    bg="white"
                    color={accentColor}
                    _hover={{ bg: 'gray.100' }}
                    onClick={() => navigate('/auth')}
                  >
                    Get Started
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    color="white"
                    borderColor="white"
                    _hover={{ bg: 'whiteAlpha.200' }}
                    onClick={() => navigate('/login')}
                  >
                    Sign In
                  </Button>
                </>
              )}
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <VStack spacing={12} align="stretch">
            <Box textAlign="center">
              <Heading size="lg" mb={4} color={headingColor}>
                Key Features
              </Heading>
              <Text fontSize="lg" color={textColor} maxW="2xl" mx="auto">
                Our platform offers a comprehensive solution for healthcare data management
              </Text>
            </Box>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
              {FEATURES.map((feature, index) => (
                <Box
                  key={index}
                  bg={cardBg}
                  p={8}
                  borderRadius="lg"
                  border="1px"
                  borderColor={borderColor}
                  transition="all 0.3s"
                  _hover={{
                    transform: 'translateY(-5px)',
                    shadow: 'lg',
                    borderColor: accentColor,
                  }}
                >
                  <VStack align="start" spacing={4}>
                    <Box
                      p={3}
                      bg={iconBgColor}
                      borderRadius="full"
                    >
                      <Icon as={feature.icon as any} boxSize={6} color={accentColor} />
                    </Box>
                    <Heading size="md" color={headingColor}>
                      {feature.title}
                    </Heading>
                    <Text color={textColor}>
                      {feature.description}
                    </Text>
                  </VStack>
                </Box>
              ))}
            </SimpleGrid>
          </VStack>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box py={20} bg={sectionBgColor}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10}>
            <Box>
              <Heading size="lg" mb={6} color={headingColor}>
                Benefits for Healthcare Providers
              </Heading>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={FiCheckCircle as any} color="green.500" />
                  <Text color={textColor}>Reduced administrative overhead</Text>
                </HStack>
                <HStack>
                  <Icon as={FiCheckCircle as any} color="green.500" />
                  <Text color={textColor}>Improved patient care coordination</Text>
                </HStack>
                <HStack>
                  <Icon as={FiCheckCircle as any} color="green.500" />
                  <Text color={textColor}>Enhanced data security and privacy</Text>
                </HStack>
                <HStack>
                  <Icon as={FiCheckCircle as any} color="green.500" />
                  <Text color={textColor}>Real-time access to medical history</Text>
                </HStack>
              </VStack>
            </Box>
            <Box>
              <Heading size="lg" mb={6} color={headingColor}>
                Benefits for Patients
              </Heading>
              <VStack align="start" spacing={4}>
                <HStack>
                  <Icon as={FiCheckCircle as any} color="green.500" />
                  <Text color={textColor}>Complete control over health data</Text>
                </HStack>
                <HStack>
                  <Icon as={FiCheckCircle as any} color="green.500" />
                  <Text color={textColor}>Easy sharing with healthcare providers</Text>
                </HStack>
                <HStack>
                  <Icon as={FiCheckCircle as any} color="green.500" />
                  <Text color={textColor}>Comprehensive medical history in one place</Text>
                </HStack>
                <HStack>
                  <Icon as={FiCheckCircle as any} color="green.500" />
                  <Text color={textColor}>Transparent record of data access</Text>
                </HStack>
              </VStack>
            </Box>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={8}
            bg={accentColor}
            color="white"
            p={{ base: 8, md: 12 }}
            borderRadius="xl"
            align="center"
            justify="space-between"
          >
            <VStack align="flex-start" spacing={4} maxW="2xl">
              <Heading size="lg">
                Ready to Transform Your Healthcare Data Management?
              </Heading>
              <Text fontSize="lg" opacity={0.9}>
                Join healthcare providers and patients who are already benefiting
                from our blockchain-based platform.
              </Text>
            </VStack>
            <Button
              size="lg"
              bg="white"
              color={accentColor}
              _hover={{ bg: 'gray.100' }}
              onClick={() => navigate('/auth')}
            >
              Get Started Now
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
};

export default Home;