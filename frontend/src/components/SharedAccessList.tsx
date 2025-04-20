import React, { useState, useEffect, useCallback } from 'react';
import {
  VStack,
  Text,
  Button,
  HStack,
  Box,
  useToast,
  Spinner,
  Input,
  List,
  ListItem,
  IconButton,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { DeleteIcon } from '@chakra-ui/icons';

export interface SharedAccessListProps {
  recordId: string;
  contract: ethers.Contract;
  onAccessRevoked: () => void;
  isOwner: boolean;
}

const SharedAccessList: React.FC<SharedAccessListProps> = ({ 
  recordId, 
  contract, 
  onAccessRevoked,
  isOwner 
}) => {
  const [sharedAddresses, setSharedAddresses] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const fetchSharedAddresses = useCallback(async () => {
    if (!recordId || !contract) {
      setSharedAddresses([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Validate record ID format
      if (!recordId.match(/^\d+$/)) {
        console.error('Invalid record ID format:', recordId);
        setError('Invalid record ID format');
        setSharedAddresses([]);
        return;
      }

      // Convert recordId to BigNumber
      const recordIdBN = ethers.BigNumber.from(recordId);
      console.log('Checking record:', recordIdBN.toString());
      
      // First check if record exists
      const exists = await contract.recordExists(recordIdBN);
      console.log('Record exists:', exists);
      
      if (!exists) {
        console.log('Record does not exist:', recordId);
        setSharedAddresses([]);
        return;
      }

      // Get the list of addresses that have access
      const addresses = await contract.getSharedAddresses(recordIdBN);
      console.log('Raw shared addresses:', addresses);

      // Filter out zero addresses and convert to lowercase
      const validAddresses = addresses
        .filter((addr: string) => addr !== ethers.constants.AddressZero)
        .map((addr: string) => addr.toLowerCase());

      console.log('Filtered shared addresses:', validAddresses);
      setSharedAddresses(validAddresses);
      setError(null);
    } catch (error) {
      console.error('Error fetching shared addresses:', error);
      if (error instanceof Error) {
        if (error.message.includes("Not the owner")) {
          setError("You don't have permission to view shared addresses");
        } else if (error.message.includes("Record does not exist")) {
          setSharedAddresses([]);
        } else {
          setError(error.message || "Failed to fetch shared addresses");
          console.error('Detailed error:', error);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, [recordId, contract]);

  useEffect(() => {
    fetchSharedAddresses();
  }, [fetchSharedAddresses]);

  const revokeAccess = async (address: string) => {
    if (!isOwner) return;
    
    try {
      setIsLoading(true);
      const tx = await contract.revokeAccess(recordId, address);
      await tx.wait();
      
      toast({
        title: "Access Revoked",
        status: "success",
        duration: 3000,
      });
      
      onAccessRevoked();
    } catch (error) {
      console.error('Error revoking access:', error);
      toast({
        title: "Error",
        description: "Failed to revoke access",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOwner) {
    return null;
  }

  if (isLoading) {
    return (
      <VStack spacing={4} align="center" w="100%">
        <Spinner />
        <Text>Loading shared access...</Text>
      </VStack>
    );
  }

  if (error) {
    return <Text color="red.500">{error}</Text>;
  }

  if (!recordId || sharedAddresses.length === 0) {
    return <Text color="gray.500">No shared access</Text>;
  }

  return (
    <VStack spacing={2} align="stretch">
      {sharedAddresses.map((address) => (
        <Box 
          key={address}
          p={2}
          borderWidth={1}
          borderRadius="md"
          display="flex"
          justifyContent="space-between"
          alignItems="center"
        >
          <Text fontSize="sm" fontFamily="mono">
            {address}
          </Text>
          <Button
            size="sm"
            colorScheme="red"
            onClick={() => revokeAccess(address)}
            isLoading={isLoading}
          >
            Revoke
          </Button>
        </Box>
      ))}
      {sharedAddresses.length === 0 && (
        <Text color="gray.500" fontSize="sm">
          No shared access
        </Text>
      )}
    </VStack>
  );
};

export default SharedAccessList;
