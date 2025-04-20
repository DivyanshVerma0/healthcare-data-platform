import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useToast,
  Alert,
  AlertIcon,
  Spinner,
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import SharedAccessList from '../components/SharedAccessList';
import { SharedWithMeRecords } from '../components/SharedWithMeRecords';
import { getContract } from '../utils/contract';
import { MedicalRecord } from '../types/records';

const SharedAccess = () => {
  const { active, account, library } = useWeb3React();
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sharedRecords, setSharedRecords] = useState<MedicalRecord[]>([]);
  const [myRecords, setMyRecords] = useState<MedicalRecord[]>([]);
  const toast = useToast();

  const fetchMyRecords = async () => {
    if (!contract || !account) return;
    try {
      const recordIds = await contract.getPatientRecordIds(account);
      const records = await Promise.all(
        recordIds.map(async (id: ethers.BigNumber) => {
          const [ipfsHash, owner, timestamp, isEncrypted, category, tags] = 
            await contract.getRecordDetails(id);
          return {
            recordId: id.toString(),
            ipfsHash,
            owner,
            timestamp: new Date(timestamp.toNumber() * 1000),
            isActive: true,
            category,
            tags
          };
        })
      );
      setMyRecords(records);
    } catch (err) {
      console.error('Error fetching my records:', err);
    }
  };

  const fetchSharedRecords = async () => {
    if (!contract || !account) return;
    try {
      const recordIds = await contract.getSharedWithMeRecords(account);
      const records = await Promise.all(
        recordIds.map(async (id: ethers.BigNumber) => {
          const [ipfsHash, owner, timestamp, isEncrypted, category, tags] = 
            await contract.getRecordDetails(id);
          return {
            recordId: id.toString(),
            ipfsHash,
            owner,
            timestamp: new Date(timestamp.toNumber() * 1000),
            isActive: true,
            category,
            tags
          };
        })
      );
      setSharedRecords(records);
    } catch (err) {
      console.error('Error fetching shared records:', err);
    }
  };

  useEffect(() => {
    const initContract = async () => {
      if (active && library) {
        try {
          const contract = getContract(library.getSigner());
          setContract(contract);
          setError(null);
        } catch (err) {
          console.error('Failed to initialize contract:', err);
          setError('Failed to load contract. Please check your network connection.');
        }
      }
      setLoading(false);
    };

    initContract();
  }, [active, library]);

  useEffect(() => {
    if (contract && account) {
      fetchMyRecords();
      fetchSharedRecords();
    }
  }, [contract, account]);

  if (!active) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning">
          <AlertIcon />
          Please connect your wallet to view shared records
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={4}>
          <Spinner size="xl" />
          <Text>Loading shared access...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Heading size="lg">Shared Access Management</Heading>
        
        <Tabs variant="enclosed">
          <TabList>
            <Tab>Shared By Me</Tab>
            <Tab>Shared With Me</Tab>
          </TabList>

          <TabPanels>
            <TabPanel>
              <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Records You've Shared</Heading>
                  {myRecords.map(record => (
                    <Box key={record.recordId}>
                      <Text fontWeight="bold">
                        {record.tags?.[0] || `Record ${record.recordId}`}
                      </Text>
                      {contract && (
                        <SharedAccessList 
                          recordId={record.recordId}
                          contract={contract}
                          onAccessRevoked={fetchMyRecords}
                          isOwner={account?.toLowerCase() === record.owner?.toLowerCase()}
                        />
                      )}
                    </Box>
                  ))}
                </VStack>
              </Box>
            </TabPanel>

            <TabPanel>
              <Box bg="white" p={6} borderRadius="lg" shadow="sm">
                <VStack spacing={4} align="stretch">
                  <Heading size="md">Records Shared With You</Heading>
                  <SharedWithMeRecords 
                    records={sharedRecords}
                    onRefresh={fetchSharedRecords}
                  />
                </VStack>
              </Box>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default SharedAccess;