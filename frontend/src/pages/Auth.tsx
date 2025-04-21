import React, { useState } from 'react';
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
  Select,
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
import { FiUser, FiLock, FiShield, FiMail } from 'react-icons/fi';
import { useNavigate, Navigate } from 'react-router-dom';
import { useWeb3React } from '@web3-react/core';
import { useAuth } from '../contexts/AuthContext';
import { useRole, ROLES } from '../contexts/RoleContext';

const Auth = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { activate } = useWeb3React();
  const { register, isAuthenticated } = useAuth();
  const { setRole } = useRole();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    selectedRole: '',
  });

  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    selectedRole: '',
  });

  const [isLoading, setIsLoading] = useState(false);

  // Color scheme
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const headingColor = useColorModeValue('gray.800', 'white');

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      selectedRole: '',
    };
    
    let isValid = true;
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
      isValid = false;
    }
    
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
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }
    
    if (!formData.selectedRole) {
      newErrors.selectedRole = 'Role is required';
      isValid = false;
    }
    
    setErrors(newErrors);
    return isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      await register(
        formData.email,
        formData.password,
        formData.name,
        formData.selectedRole
      );
      
      // Set the selected role
      setRole(formData.selectedRole as any);
      
      toast({
        title: 'Success',
        description: 'Account created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Navigate to wallet connection page
      navigate('/connect-wallet');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create account. Please try again.',
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
                  Create Your Account
                </Heading>
                <Text color={textColor}>
                  Join our healthcare platform and take control of your medical records
                </Text>
              </Stack>

              <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                <VStack spacing={6}>
                  <FormControl isRequired isInvalid={!!errors.name}>
                    <FormLabel>Full Name</FormLabel>
                    <InputGroup>
                      <InputLeftElement pointerEvents="none">
                        <Icon as={FiUser as any} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter your full name"
                        size="lg"
                      />
                    </InputGroup>
                    <FormErrorMessage>{errors.name}</FormErrorMessage>
                  </FormControl>

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

                  <FormControl isRequired isInvalid={!!errors.selectedRole}>
                    <FormLabel>Select Your Role</FormLabel>
                    <Select
                      name="selectedRole"
                      value={formData.selectedRole}
                      onChange={handleInputChange}
                      placeholder="Choose your role"
                      size="lg"
                    >
                      {ROLES.map(role => (
                        <option key={role.value} value={role.value}>
                          {role.label}
                        </option>
                      ))}
                    </Select>
                    <FormErrorMessage>{errors.selectedRole}</FormErrorMessage>
                  </FormControl>

                  <Button
                    type="submit"
                    colorScheme="blue"
                    size="lg"
                    width="full"
                    isLoading={isLoading}
                  >
                    Create Account
                  </Button>
                </VStack>
              </form>

              <Divider />

              <HStack spacing={4}>
                <Text color={textColor}>Already have an account?</Text>
                <Button
                  variant="link"
                  colorScheme="blue"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      </Container>
    </Box>
  );
};

export default Auth; 