import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  useColorModeValue,
  useToast,
  Card,
  CardBody,
  Stack,
  HStack,
  Icon,
  Divider,
  InputGroup,
  InputLeftElement,
  FormErrorMessage,
} from '@chakra-ui/react';
import { FiMail, FiLock } from 'react-icons/fi';
import { useNavigate, Navigate } from 'react-router-dom';
import { useRole } from '../contexts/RoleContext';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { setRole } = useRole();
  const { login, isAuthenticated } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Color scheme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
    const newErrors = {
      email: '',
      password: '',
    };
    
    let isValid = true;
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
      isValid = false;
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await login(formData.email, formData.password);
      
      toast({
        title: 'Success',
        description: 'Logged in successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate to dashboard
      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to login. Please try again.',
        status: 'error',
        duration: 3000,
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
                <Heading size="xl" color={headingColor}>
                  Welcome Back
                </Heading>
                <Text color={textColor}>
                  Sign in to your account to continue
                </Text>
              </Stack>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={6}>
                  <FormControl isRequired isInvalid={!!errors.email}>
                    <FormLabel>Email</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiMail as any} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="Enter your email"
                        size="lg"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.email}</FormErrorMessage>
                  </FormControl>

                  <FormControl isRequired isInvalid={!!errors.password}>
                    <FormLabel>Password</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiLock as any} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter your password"
                        size="lg"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.password}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    isLoading={isLoading}
                  >
                    Sign In
                  </Button>
                </VStack>
              </form>

              <Divider />

              <HStack spacing={4}>
                <Text color={textColor}>Don't have an account?</Text>
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => navigate('/auth')}
                >
                  Create Account
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default Login; 