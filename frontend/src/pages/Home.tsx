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
  Badge,
  List,
  ListItem,
  ListIcon,
} from '@chakra-ui/react';
import { FiShield, FiShare2, FiDatabase, FiLock, FiCheckCircle, FiTrendingUp, FiUsers, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Icon } from '../components/Icon';

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

const BENEFITS = [
  'Reduced administrative overhead',
  'Improved patient care coordination',
  'Enhanced data security and privacy',
  'Real-time access to medical history',
  'Reduced medical errors',
  'Better emergency response',
];

const Home = () => {
  const navigate = useNavigate();
  
  // Color scheme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const accentColor = 'blue.500';
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box bg={bgColor}>
      {/* Hero Section */}
      <Box 
        bg={useColorModeValue('blue.500', 'blue.600')} 
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
              <Button
                size="lg"
                colorScheme="whiteAlpha"
                onClick={() => navigate('/dashboard')}
                _hover={{ bg: 'whiteAlpha.300' }}
              >
                Get Started
              </Button>
              <Button
                size="lg"
                bg="white"
                color="blue.500"
                _hover={{ bg: 'gray.100' }}
                onClick={() => navigate('/about')}
              >
                Learn More
              </Button>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxW="container.xl" py={20}>
        <VStack spacing={12}>
          <Box textAlign="center" maxW="3xl" mx="auto">
            <Badge colorScheme="blue" fontSize="sm" px={4} py={1} mb={4}>
              Features
            </Badge>
            <Heading size="xl" mb={4} color={headingColor}>
              Why Choose Our Platform?
            </Heading>
            <Text fontSize="lg" color={textColor}>
              Our blockchain-based healthcare platform offers cutting-edge features
              designed to revolutionize medical record management.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8} w="full">
            {FEATURES.map((feature, index) => (
              <Box
                key={index}
                bg={cardBg}
                p={8}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
                _hover={{ transform: 'translateY(-5px)', transition: 'all 0.3s' }}
              >
                <Icon
                  icon={feature.icon}
                  w={10}
                  h={10}
                  color={accentColor}
                  mb={4}
                />
                <Heading size="md" mb={3} color={headingColor}>
                  {feature.title}
                </Heading>
                <Text color={textColor}>
                  {feature.description}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </VStack>
      </Container>

      {/* Benefits Section */}
      <Box bg={cardBg} py={20}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={10} alignItems="center">
            <Box>
              <Badge colorScheme="blue" fontSize="sm" px={4} py={1} mb={4}>
                Benefits
              </Badge>
              <Heading size="xl" mb={6} color={headingColor}>
                Transform Healthcare Data Management
              </Heading>
              <Text fontSize="lg" color={textColor} mb={8}>
                Our platform brings numerous advantages to both healthcare providers
                and patients, streamlining the entire medical record management process.
              </Text>
              <List spacing={4}>
                {BENEFITS.map((benefit, index) => (
                  <ListItem key={index} display="flex" alignItems="center">
                    <Icon icon={FiCheckCircle} color={accentColor} mr={2} />
                    <Text color={textColor}>{benefit}</Text>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Stack spacing={8}>
              <Box
                bg={useColorModeValue('blue.50', 'blue.900')}
                p={8}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
              >
                <Icon icon={FiTrendingUp} w={8} h={8} color={accentColor} mb={4} />
                <Heading size="md" mb={3} color={headingColor}>
                  For Healthcare Providers
                </Heading>
                <Text color={textColor}>
                  Streamline your operations, reduce costs, and improve patient care
                  with instant access to complete medical histories and secure data
                  sharing capabilities.
                </Text>
              </Box>
              <Box
                bg={useColorModeValue('blue.50', 'blue.900')}
                p={8}
                borderRadius="lg"
                border="1px"
                borderColor={borderColor}
              >
                <Icon icon={FiUsers} w={8} h={8} color={accentColor} mb={4} />
                <Heading size="md" mb={3} color={headingColor}>
                  For Patients
                </Heading>
                <Text color={textColor}>
                  Take control of your health data, easily share records with
                  healthcare providers, and maintain a comprehensive medical history
                  in one secure location.
                </Text>
              </Box>
            </Stack>
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={8}
            bg={useColorModeValue('blue.500', 'blue.600')}
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
              color="blue.500"
              _hover={{ bg: 'gray.100' }}
              onClick={() => navigate('/dashboard')}
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