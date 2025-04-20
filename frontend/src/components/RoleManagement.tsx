import React, { useState } from 'react';
import {
  Box,
  VStack,
  Text,
  useColorModeValue,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Container,
  SimpleGrid,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { FiUser, FiShield, FiUsers, FiHome } from 'react-icons/fi';
import { IconType } from 'react-icons';
import Icon from './Icon';
import { useRole, Role } from '../contexts/RoleContext';
import { useWeb3React } from '@web3-react/core';

interface RoleCardProps {
  title: string;
  description: string;
  icon: IconType;
  isActive: boolean;
  onClick: () => void;
}

const RoleCard = ({
  title,
  description,
  icon,
  isActive,
  onClick,
}: RoleCardProps) => {
  const bg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const iconColor = isActive ? '#3182CE' : textColor;

  return (
    <Box
      p={6}
      bg={bg}
      borderWidth="1px"
      borderColor={isActive ? 'blue.500' : borderColor}
      borderRadius="lg"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{
        bg: hoverBg,
        transform: 'translateY(-2px)',
        shadow: 'md',
      }}
    >
      <VStack spacing={4} align="start">
        <Box>
          <Icon icon={icon} boxSize={6} color={iconColor} />
        </Box>
        <Box>
          <Text fontWeight="bold" fontSize="lg">
            {title}
          </Text>
          <Text color={textColor} fontSize="sm">
            {description}
          </Text>
        </Box>
      </VStack>
    </Box>
  );
};

const RoleManagement = () => {
  const { role, userProfile, updateProfile, requestRoleChange, isLoading } = useRole();
  const { active, account } = useWeb3React();
  const { 
    isOpen: isProfileOpen, 
    onOpen: onProfileOpen, 
    onClose: onProfileClose 
  } = useDisclosure();
  const {
    isOpen: isRoleChangeOpen,
    onOpen: onRoleChangeOpen,
    onClose: onRoleChangeClose
  } = useDisclosure();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  const [selectedRole, setSelectedRole] = useState<Role>(null);
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    specialization: userProfile?.specialization || '',
    institution: userProfile?.institution || ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData.name, formData.specialization, formData.institution);
    onProfileClose();
  };

  const handleRoleSelect = (selectedRole: Role) => {
    setSelectedRole(selectedRole);
    onRoleChangeOpen();
  };

  const handleRoleChangeConfirm = async () => {
    if (selectedRole) {
      await requestRoleChange(selectedRole);
      onRoleChangeClose();
    }
  };

  const roles = [
    {
      id: 'PATIENT',
      title: 'Patient',
      description: 'Access and manage your medical records',
      icon: FiUser,
    },
    {
      id: 'DOCTOR',
      title: 'Doctor',
      description: 'View and update patient records',
      icon: FiShield,
    },
    {
      id: 'RESEARCHER',
      title: 'Researcher',
      description: 'Analyze anonymized medical data',
      icon: FiUsers,
    },
    {
      id: 'ADMIN',
      title: 'Admin',
      description: 'Manage system settings and users',
      icon: FiHome,
    },
  ];

  if (!active) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          Please connect your wallet to view and manage roles
        </Alert>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading role information...</Text>
        </VStack>
      </Container>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box>
            <Text fontSize="2xl" fontWeight="bold" mb={2}>
              Role Management
            </Text>
            <Text color="gray.600">
              Select a role to request access. Role changes require admin approval.
            </Text>
          </Box>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            {roles.map((roleData) => (
              <RoleCard
                key={roleData.id}
                title={roleData.title}
                description={roleData.description}
                icon={roleData.icon}
                isActive={role === roleData.id}
                onClick={() => handleRoleSelect(roleData.id as Role)}
              />
            ))}
          </SimpleGrid>

          {userProfile && (
            <Box mt={8}>
              <Button
                colorScheme="blue"
                onClick={onProfileOpen}
                isLoading={isLoading}
              >
                Update Profile
              </Button>
            </Box>
          )}

          {/* Profile Update Modal */}
          <Modal isOpen={isProfileOpen} onClose={onProfileClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Update Profile</ModalHeader>
              <ModalCloseButton />
              <ModalBody pb={6}>
                <form onSubmit={handleProfileSubmit}>
                  <VStack spacing={4}>
                    <FormControl>
                      <FormLabel>Name</FormLabel>
                      <Input
                        name="name"
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                    {role === 'DOCTOR' && (
                      <FormControl>
                        <FormLabel>Specialization</FormLabel>
                        <Input
                          name="specialization"
                          placeholder="Enter your specialization"
                          value={formData.specialization}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    )}
                    {role === 'RESEARCHER' && (
                      <FormControl>
                        <FormLabel>Institution</FormLabel>
                        <Input
                          name="institution"
                          placeholder="Enter your institution"
                          value={formData.institution}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    )}
                    <Button type="submit" colorScheme="blue" width="full">
                      Save Profile
                    </Button>
                  </VStack>
                </form>
              </ModalBody>
            </ModalContent>
          </Modal>

          {/* Role Change Confirmation Modal */}
          <Modal isOpen={isRoleChangeOpen} onClose={onRoleChangeClose}>
            <ModalOverlay />
            <ModalContent>
              <ModalHeader>Request Role Change</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <Alert status="info" mb={4}>
                  <AlertIcon />
                  Role changes require admin approval. You will be notified once your request is processed.
                </Alert>
                <Text>
                  Are you sure you want to request to change your role to <strong>{selectedRole}</strong>?
                </Text>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="blue" mr={3} onClick={handleRoleChangeConfirm}>
                  Request Change
                </Button>
                <Button variant="ghost" onClick={onRoleChangeClose}>Cancel</Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </VStack>
      </Container>
    </Box>
  );
};

export default RoleManagement; 