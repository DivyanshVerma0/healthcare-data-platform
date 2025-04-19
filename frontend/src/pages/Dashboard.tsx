import { Box, Heading, Text, SimpleGrid, Card, CardBody, Button, Input, VStack, useToast, Progress, Select, Divider, Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useState, useEffect } from 'react';
import { uploadToIPFS } from '../utils/ipfs';
import { ethers } from 'ethers';
import MedicalRecord from '../contracts/MedicalRecord.json';
import RecordsList from '../components/RecordsList';
import { MedicalRecord as IMedicalRecord } from '../types/records';
import SharedAccessList from '../components/SharedAccessList';
import SharedWithMeRecords from '../components/SharedWithMeRecords';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

const Dashboard = () => {
  const { active, account, library } = useWeb3React();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [records, setRecords] = useState<IMedicalRecord[]>([]);
  const [shareAddress, setShareAddress] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [sharedWithMeRecords, setSharedWithMeRecords] = useState<IMedicalRecord[]>([]);
  const toast = useToast();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !library || !account) {
      toast({
        title: "Error",
        description: "Please select a file and connect your wallet",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress('Preparing upload...');
    
    try {
      // Upload to IPFS
      setUploadProgress('Uploading to IPFS...');
      console.log('Starting upload process...');
      const ipfsHash = await uploadToIPFS(selectedFile);
      console.log('IPFS Hash:', ipfsHash);
      
      // Create contract instance
      setUploadProgress('Creating blockchain transaction...');
      const signer = library.getSigner();
      console.log('Got signer:', await signer.getAddress());
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, signer);
      console.log('Contract instance created');
      
      // Create record on blockchain
      setUploadProgress('Waiting for transaction approval...');
      const tx = await contract.createRecord(ipfsHash, true);
      console.log('Transaction submitted:', tx.hash);
      
      setUploadProgress('Waiting for transaction confirmation...');
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);

      toast({
        title: "Success!",
        description: "Medical record uploaded successfully",
        status: "success",
        duration: 5000,
      });

      setSelectedFile(null);
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        status: "error",
        duration: 5000,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress('');
    }
  };

  const fetchRecords = async () => {
    if (!library || !account) return;
    
    try {
      const signer = library.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, signer);
      
      // Get record IDs for the connected account
      const recordIds = await contract.getPatientRecordIds(account);
      console.log('Fetched record IDs:', recordIds);
      
      // Get details for each record and filter out non-existent ones
      const recordsData = await Promise.all(
        recordIds.map(async (recordId: any) => {
          try {
            // Check if record exists
            const exists = await contract.recordExists(recordId);
            if (!exists) {
              console.log('Record does not exist:', recordId.toString());
              return null;
            }

            const [ipfsHash, owner, timestamp, isEncrypted] = await contract.getRecordDetails(recordId);
            return {
              recordId: recordId.toString(),
              ipfsHash,
              timestamp: new Date(timestamp.toNumber() * 1000),
              isActive: true,
              ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`
            };
          } catch (error) {
            console.log('Error fetching record details:', recordId.toString(), error);
            return null;
          }
        })
      );
      
      // Filter out null values (non-existent records)
      const validRecords = recordsData.filter((record): record is IMedicalRecord => record !== null);
      console.log('Formatted records:', validRecords);
      setRecords(validRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch records",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleShare = async () => {
    if (!library || !account || !shareAddress || !selectedRecordId) {
      toast({
        title: "Error",
        description: "Please select a record and enter a wallet address",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsSharing(true);
    try {
      const signer = library.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, signer);
      
      console.log('Sharing record:', {
        recordId: selectedRecordId,
        to: shareAddress,
        from: account
      });

      // Convert recordId to BigNumber
      const recordIdBN = ethers.BigNumber.from(selectedRecordId);
      console.log('Record ID as BigNumber:', recordIdBN.toString());

      const tx = await contract.grantAccess(recordIdBN, shareAddress, {
        gasLimit: 500000
      });
      
      console.log('Transaction submitted:', tx.hash);
      
      await tx.wait();
      console.log('Transaction confirmed');

      toast({
        title: "Success",
        description: "Access granted successfully",
        status: "success",
        duration: 5000,
      });

      setShareAddress('');
      setSelectedRecordId('');
      await fetchRecords(); // Refresh the records list
    } catch (error) {
      console.error('Detailed sharing error:', error);
      
      // Extract the most relevant error message
      let errorMessage = "Failed to grant access";
      if (error instanceof Error) {
        if (error.message.includes("user rejected")) {
          errorMessage = "Transaction was rejected by user";
        } else if (error.message.includes("insufficient funds")) {
          errorMessage = "Insufficient funds for transaction";
        } else if (error.message.includes("execution reverted")) {
          // Try to extract the revert reason if available
          errorMessage = error.message.includes(":") 
            ? error.message.split(":")[1].trim()
            : "Transaction reverted by the contract";
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
      setIsSharing(false);
    }
  };

  const fetchSharedWithMeRecords = async () => {
    if (!library || !account) return;
    
    try {
      const signer = library.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, signer);
      
      // Get records shared with the current account
      const sharedRecordIds = await contract.getSharedWithMeRecords(account);
      console.log('Fetched shared record IDs:', sharedRecordIds);
      
      if (!sharedRecordIds || sharedRecordIds.length === 0) {
        setSharedWithMeRecords([]); // Set empty array instead of showing error
        return;
      }
      
      // Get details for each shared record
      const sharedRecordsData = await Promise.all(
        sharedRecordIds.map(async (recordId: any) => {
          const [ipfsHash, owner, timestamp, isEncrypted] = await contract.getRecordDetails(recordId);
          return {
            recordId: recordId.toString(),
            ipfsHash,
            timestamp: new Date(timestamp.toNumber() * 1000),
            isActive: true,
            ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`
          };
        })
      );
      
      console.log('Formatted shared records:', sharedRecordsData);
      setSharedWithMeRecords(sharedRecordsData);
    } catch (error) {
      console.error('Error fetching shared records:', error);
      // Only show error toast for actual errors, not for empty records
      if (error instanceof Error && !error.message.includes("no shared records")) {
        toast({
          title: "Error",
          description: "Failed to fetch shared records",
          status: "error",
          duration: 5000,
        });
      }
    }
  };

  useEffect(() => {
    if (active && account) {
      fetchRecords();
      fetchSharedWithMeRecords();
    }
  }, [active, account]);

  return (
    <Box p={8}>
      <Heading mb={6}>Your Medical Records Dashboard</Heading>
      {active ? (
        <>
          <Text mb={4}>Connected Wallet: {account}</Text>
          <Tabs>
            <TabList mb={4}>
              <Tab>My Records</Tab>
              <Tab>Shared By Me</Tab>
              <Tab>Shared With Me</Tab>
            </TabList>
            <TabPanels>
              <TabPanel>
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                  <Card>
                    <CardBody>
                      <VStack spacing={4}>
                        <Heading size="md">Upload Records</Heading>
                        <Text>Upload your medical records securely</Text>
                        <Input
                          type="file"
                          onChange={handleFileSelect}
                          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          disabled={isUploading}
                        />
                        {isUploading && (
                          <Box w="100%">
                            <Progress size="xs" isIndeterminate />
                            <Text mt={2} fontSize="sm">{uploadProgress}</Text>
                          </Box>
                        )}
                        <Button 
                          colorScheme="blue" 
                          onClick={handleUpload}
                          isDisabled={!selectedFile || isUploading}
                          isLoading={isUploading}
                          loadingText={uploadProgress}
                        >
                          Upload File
                        </Button>
                      </VStack>
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <Heading size="md" mb={4}>View Records</Heading>
                      <RecordsList 
                        records={records}
                        onRefresh={fetchRecords}
                      />
                    </CardBody>
                  </Card>
                  <Card>
                    <CardBody>
                      <VStack spacing={4} align="stretch">
                        <Heading size="md">Share Records</Heading>
                        <Text>Share your records with healthcare providers</Text>
                        <Input 
                          placeholder="Enter wallet address to share with"
                          value={shareAddress}
                          onChange={(e) => setShareAddress(e.target.value)}
                        />
                        <Select 
                          placeholder="Select record to share"
                          value={selectedRecordId}
                          onChange={(e) => setSelectedRecordId(e.target.value)}
                        >
                          {records.map((record) => (
                            <option key={record.recordId} value={record.recordId}>
                              Record {new Date(record.timestamp).toLocaleDateString()}
                            </option>
                          ))}
                        </Select>
                        <Button
                          colorScheme="blue"
                          onClick={handleShare}
                          isLoading={isSharing}
                        >
                          Share Access
                        </Button>
                        
                        {selectedRecordId && (
                          <>
                            <Divider my={2} />
                            <Text fontWeight="bold">Current Access:</Text>
                            <SharedAccessList
                              recordId={selectedRecordId}
                              contract={new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, library.getSigner())}
                              onAccessRevoked={fetchRecords}
                            />
                          </>
                        )}
                      </VStack>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              </TabPanel>
              <TabPanel>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Records I've Shared</Heading>
                    <VStack spacing={4} align="stretch">
                      {records.map((record) => (
                        <Box key={record.recordId} p={4} borderWidth={1} borderRadius="md">
                          <Text fontWeight="bold">
                            Record {new Date(record.timestamp).toLocaleDateString()}
                          </Text>
                          <Text fontSize="sm" color="gray.600" mt={1}>
                            IPFS Hash: {record.ipfsHash}
                          </Text>
                          <Divider my={2} />
                          <Text fontWeight="bold" mb={2}>Shared With:</Text>
                          <SharedAccessList
                            recordId={record.recordId}
                            contract={new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, library.getSigner())}
                            onAccessRevoked={() => {
                              fetchRecords();
                              fetchSharedWithMeRecords();
                            }}
                          />
                        </Box>
                      ))}
                      {records.length === 0 && (
                        <Text color="gray.500">No records found</Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>
              </TabPanel>
              <TabPanel>
                <Card>
                  <CardBody>
                    <Heading size="md" mb={4}>Records Shared With Me</Heading>
                    <SharedWithMeRecords 
                      records={sharedWithMeRecords}
                      onRefresh={fetchSharedWithMeRecords}
                    />
                  </CardBody>
                </Card>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </>
      ) : (
        <Text>Please connect your wallet to access your records</Text>
      )}
    </Box>
  );
};

export default Dashboard;