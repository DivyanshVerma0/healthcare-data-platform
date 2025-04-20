import React, { useState, useEffect } from 'react';
import {
  VStack,
  HStack,
  Text,
  Input,
  Button,
  Box,
  useToast,
  Select,
  Spinner,
  Badge,
  List,
  ListItem,
  IconButton,
} from '@chakra-ui/react';
import { ethers } from 'ethers';
import { DeleteIcon } from '@chakra-ui/icons';

interface EmergencyAccessProps {
  recordId: string;
  contract: ethers.Contract;
  isOwner: boolean;
  onAccessChanged: () => void;
}

interface EmergencyAccess {
  contact: string;
  expiryTime: number;
  isActive: boolean;
}

const EmergencyAccess: React.FC<EmergencyAccessProps> = ({ recordId, contract, isOwner, onAccessChanged }) => {
  const [emergencyContact, setEmergencyContact] = useState('');
  const [duration, setDuration] = useState('24');
  const [isLoading, setIsLoading] = useState(false);
  const [emergencyAccesses, setEmergencyAccesses] = useState<EmergencyAccess[]>([]);
  const toast = useToast();

  const checkRecordExists = async (recordIdBN: ethers.BigNumber) => {
    try {
      const exists = await contract.recordExists(recordIdBN);
      console.log('Record exists check:', recordIdBN.toString(), exists);
      return exists;
    } catch (error) {
      console.error('Error checking record existence:', error);
      return false;
    }
  };

  const fetchEmergencyAccesses = async () => {
    if (!recordId || !contract) return;

    try {
      setIsLoading(true);
      const recordIdBN = ethers.BigNumber.from(recordId);
      
      // First check if record exists
      const exists = await checkRecordExists(recordIdBN);
      if (!exists) {
        console.log('Record does not exist:', recordId);
        setEmergencyAccesses([]);
        return;
      }

      // Check if the current user is the owner
      const owner = await contract.ownerOf(recordIdBN);
      const signer = await contract.signer.getAddress();
      
      if (owner.toLowerCase() !== signer.toLowerCase()) {
        console.log('Not the owner of the record');
        setEmergencyAccesses([]);
        return;
      }

      // Get emergency access list
      const accesses = await contract.getEmergencyAccessDetails(recordIdBN);
      console.log('Emergency accesses:', accesses);

      if (Array.isArray(accesses) && accesses.length > 0) {
        const validAccesses = accesses
          .map((access: any) => ({
            contact: access.emergencyContact.toLowerCase(),
            expiryTime: access.expiryTime.toNumber(),
            isActive: access.isActive,
          }))
          .filter(access => access.isActive);

        console.log('Valid emergency accesses:', validAccesses);
        setEmergencyAccesses(validAccesses);
      } else {
        setEmergencyAccesses([]);
      }
    } catch (error) {
      console.error('Error fetching emergency accesses:', error);
      setEmergencyAccesses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEmergencyAccesses();
  }, [recordId, contract]);

  const grantEmergencyAccess = async () => {
    if (!recordId || !contract || !emergencyContact) {
      toast({
        title: "Error",
        description: "Please enter an emergency contact address",
        status: "error",
        duration: 3000,
      });
      return;
    }

    try {
      setIsLoading(true);
      const recordIdBN = ethers.BigNumber.from(recordId);
      
      // Validate record exists
      const exists = await checkRecordExists(recordIdBN);
      if (!exists) {
        throw new Error("Record does not exist");
      }

      // Validate ownership
      const owner = await contract.ownerOf(recordIdBN);
      const signer = await contract.signer.getAddress();
      
      if (owner.toLowerCase() !== signer.toLowerCase()) {
        throw new Error("Not the owner of the record");
      }

      // Validate emergency contact address
      if (!ethers.utils.isAddress(emergencyContact)) {
        throw new Error("Invalid emergency contact address");
      }

      const durationHours = parseInt(duration);
      console.log('Granting emergency access:', {
        recordId: recordIdBN.toString(),
        emergencyContact,
        durationHours
      });

      const tx = await contract.grantEmergencyAccess(
        recordIdBN,
        emergencyContact,
        durationHours,
        {
          gasLimit: 500000
        }
      );

      toast({
        title: "Transaction Submitted",
        description: "Granting emergency access...",
        status: "info",
        duration: 3000,
      });

      console.log('Transaction submitted:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed');

      toast({
        title: "Success",
        description: "Emergency access granted successfully",
        status: "success",
        duration: 3000,
      });

      setEmergencyContact('');
      await fetchEmergencyAccesses();
      onAccessChanged();
    } catch (error) {
      console.error('Error granting emergency access:', error);
      let errorMessage = "Failed to grant emergency access";
      
      if (error instanceof Error) {
        if (error.message.includes("Record does not exist")) {
          errorMessage = "Record does not exist";
        } else if (error.message.includes("Not the owner")) {
          errorMessage = "You are not the owner of this record";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected";
        } else if (error.message.includes("Invalid emergency contact")) {
          errorMessage = "Invalid emergency contact address";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const revokeEmergencyAccess = async (contact: string) => {
    if (!recordId || !contract) return;

    try {
      setIsLoading(true);
      const recordIdBN = ethers.BigNumber.from(recordId);

      // Validate record exists
      const exists = await checkRecordExists(recordIdBN);
      if (!exists) {
        throw new Error("Record does not exist");
      }

      // Validate ownership
      const owner = await contract.ownerOf(recordIdBN);
      const signer = await contract.signer.getAddress();
      
      if (owner.toLowerCase() !== signer.toLowerCase()) {
        throw new Error("Not the owner of the record");
      }

      console.log('Revoking emergency access:', {
        recordId: recordIdBN.toString(),
        contact
      });

      const tx = await contract.revokeEmergencyAccess(
        recordIdBN,
        contact,
        {
          gasLimit: 300000
        }
      );

      toast({
        title: "Transaction Submitted",
        description: "Revoking emergency access...",
        status: "info",
        duration: 3000,
      });

      console.log('Transaction submitted:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed');

      toast({
        title: "Success",
        description: "Emergency access revoked successfully",
        status: "success",
        duration: 3000,
      });

      await fetchEmergencyAccesses();
      onAccessChanged();
    } catch (error) {
      console.error('Error revoking emergency access:', error);
      let errorMessage = "Failed to revoke emergency access";
      
      if (error instanceof Error) {
        if (error.message.includes("Record does not exist")) {
          errorMessage = "Record does not exist";
        } else if (error.message.includes("Not the owner")) {
          errorMessage = "You are not the owner of this record";
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <VStack spacing={4} align="center" w="100%">
        <Spinner />
        <Text>Loading emergency access...</Text>
      </VStack>
    );
  }

  return (
    <VStack spacing={4} align="stretch" w="100%">
      <Box p={4} borderWidth="1px" borderRadius="md">
        <Text fontWeight="bold" mb={2}>Grant Emergency Access</Text>
        <VStack spacing={3}>
          <Input
            placeholder="Enter emergency contact address"
            value={emergencyContact}
            onChange={(e) => setEmergencyContact(e.target.value)}
          />
          <HStack w="100%">
            <Select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              w="50%"
            >
              <option value="1">1 hour</option>
              <option value="24">24 hours</option>
              <option value="72">72 hours</option>
              <option value="168">1 week</option>
            </Select>
            <Button
              colorScheme="blue"
              onClick={grantEmergencyAccess}
              isLoading={isLoading}
              w="50%"
            >
              Grant Access
            </Button>
          </HStack>
        </VStack>
      </Box>

      <Box p={4} borderWidth="1px" borderRadius="md">
        <Text fontWeight="bold" mb={2}>Active Emergency Access</Text>
        {emergencyAccesses.length > 0 ? (
          emergencyAccesses.map((access) => (
            <Box key={access.contact} p={2} borderWidth="1px" borderRadius="md" mb={2}>
              <HStack justify="space-between">
                <VStack align="start" spacing={1}>
                  <Text fontSize="sm">{access.contact}</Text>
                  <Badge colorScheme={access.isActive ? "green" : "red"}>
                    Expires: {new Date(access.expiryTime * 1000).toLocaleString()}
                  </Badge>
                </VStack>
                <Button
                  size="sm"
                  colorScheme="red"
                  onClick={() => revokeEmergencyAccess(access.contact)}
                  isLoading={isLoading}
                >
                  Revoke
                </Button>
              </HStack>
            </Box>
          ))
        ) : (
          <Text color="gray.500">No active emergency access</Text>
        )}
      </Box>
    </VStack>
  );
};

export default EmergencyAccess; 