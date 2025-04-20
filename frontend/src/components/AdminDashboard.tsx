import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
  HStack,
  useColorModeValue,
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useRole } from '../contexts/RoleContext';
import { getContract, ROLES } from '../utils/contract';
import { ethers } from 'ethers';

interface RoleRequest {
  address: string;
  requestedRole: string;
  timestamp: number;
}

interface RoleChangeRequestedEventArgs extends ethers.utils.Result {
  requester: string;
  requestedRole: string;
}

type RoleChangeRequestedEvent = ethers.Event & {
  args: RoleChangeRequestedEventArgs;
};

const AdminDashboard = () => {
  const { role } = useRole();
  const { account, library } = useWeb3React();
  const [pendingRequests, setPendingRequests] = useState<RoleRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchPendingRequests = useCallback(async () => {
    if (!library || !account) return;
    
    try {
      setIsLoading(true);
      const contract = getContract(library.getSigner());
      
      // Get role change request events
      const filter = contract.filters.RoleChangeRequested();
      const events = await contract.queryFilter(filter);
      const roleChangeEvents = events.map(event => event as RoleChangeRequestedEvent);
      
      // Get the status of each request
      const requests = await Promise.all(
        roleChangeEvents.map(async (event) => {
          const args = event.args;
          if (!args) return null;
          
          const request = await contract.getPendingRoleRequest(args.requester);
          if (request.isPending) {
            return {
              address: args.requester,
              requestedRole: getRoleName(args.requestedRole),
              timestamp: request.timestamp.toNumber(),
            };
          }
          return null;
        })
      );
      
      setPendingRequests(requests.filter((req): req is RoleRequest => req !== null));
    } catch (error) {
      console.error('Error fetching pending requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch pending role requests',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  }, [library, account, toast]);

  const handleRequest = async (requesterAddress: string, approved: boolean) => {
    if (!library || !account) return;

    try {
      const contract = getContract(library.getSigner());
      const tx = await contract.processRoleChangeRequest(requesterAddress, approved);
      
      toast({
        title: 'Processing Request',
        description: 'Please wait while the transaction is being processed',
        status: 'info',
        duration: 5000,
        isClosable: true,
      });

      await tx.wait();
      
      toast({
        title: 'Success',
        description: `Role change request ${approved ? 'approved' : 'rejected'} successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Refresh the pending requests
      fetchPendingRequests();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to process role request',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getRoleName = (roleHash: string): string => {
    const roleMap: Record<string, string> = {
      [ROLES.PATIENT]: 'Patient',
      [ROLES.DOCTOR]: 'Doctor',
      [ROLES.RESEARCHER]: 'Researcher',
      [ROLES.ADMIN]: 'Admin',
    };
    return roleMap[roleHash] || 'Unknown Role';
  };

  useEffect(() => {
    if (role === 'ADMIN') {
      fetchPendingRequests();
    }
  }, [role, fetchPendingRequests]);

  // Only render for admin users
  if (role !== 'ADMIN') {
    return null;
  }

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading size="lg" mb={2}>Admin Dashboard</Heading>
            <Text color="gray.600">Manage role change requests and user permissions</Text>
          </Box>

          <Box bg={bgColor} borderRadius="lg" borderWidth="1px" borderColor={borderColor} overflow="hidden">
            <Box p={6}>
              <Heading size="md" mb={4}>Pending Role Requests</Heading>
              
              {isLoading ? (
                <VStack py={8}>
                  <Spinner size="xl" />
                  <Text>Loading requests...</Text>
                </VStack>
              ) : pendingRequests.length === 0 ? (
                <Alert status="info">
                  <AlertIcon />
                  No pending role change requests
                </Alert>
              ) : (
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Requester Address</Th>
                      <Th>Requested Role</Th>
                      <Th>Timestamp</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {pendingRequests.map((request) => (
                      <Tr key={request.address}>
                        <Td>
                          <Text fontSize="sm" fontFamily="mono">
                            {request.address.slice(0, 6)}...{request.address.slice(-4)}
                          </Text>
                        </Td>
                        <Td>
                          <Badge colorScheme="blue">{request.requestedRole}</Badge>
                        </Td>
                        <Td>
                          {new Date(request.timestamp * 1000).toLocaleString()}
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="green"
                              onClick={() => handleRequest(request.address, true)}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              onClick={() => handleRequest(request.address, false)}
                            >
                              Reject
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              )}
            </Box>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
};

export default AdminDashboard; 