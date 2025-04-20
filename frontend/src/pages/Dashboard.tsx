import { Box, Heading, Text, SimpleGrid, Card, CardBody, Button, Input, VStack, useToast, Progress, Select, Divider, Tabs, TabList, TabPanels, Tab, TabPanel, HStack, Tag } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { useState, useEffect } from 'react';
import { uploadToIPFS } from '../utils/ipfs';
import { ethers } from 'ethers';
import MedicalRecord from '../contracts/MedicalRecord.json';
import RecordsList from '../components/RecordsList';
import { MedicalRecord as IMedicalRecord } from '../types/records';
import SharedAccessList from '../components/SharedAccessList';
import SharedWithMeRecords from '../components/SharedWithMeRecords';
import EmergencyAccess from '../components/EmergencyAccess';
import SearchFilter from '../components/SearchFilter';

const CONTRACT_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

// File upload constants
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = {
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png']
};

const Dashboard = () => {
  const { active, account, library } = useWeb3React();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState('');
  const [records, setRecords] = useState<IMedicalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<IMedicalRecord[]>([]);
  const [shareAddress, setShareAddress] = useState('');
  const [selectedRecordId, setSelectedRecordId] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [sharedWithMeRecords, setSharedWithMeRecords] = useState<IMedicalRecord[]>([]);
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const toast = useToast();

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        isValid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`
      };
    }

    // Check file type
    const fileType = Object.entries(ALLOWED_FILE_TYPES).find(([mimeType, extensions]) => 
      file.type === mimeType || extensions.some(ext => file.name.toLowerCase().endsWith(ext))
    );

    if (!fileType) {
      return {
        isValid: false,
        error: 'Invalid file type. Allowed types: PDF, DOC, DOCX, JPG, PNG'
      };
    }

    return { isValid: true };
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "Invalid File",
        description: validation.error,
        status: "error",
        duration: 3000,
      });
      event.target.value = ''; // Reset file input
      return;
    }

    // Sanitize filename
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const sanitizedFile = new File([file], sanitizedName, { type: file.type });
    
    setSelectedFile(sanitizedFile);
  };

  const addTag = () => {
    if (tagInput.trim() !== '') {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !library || !account) return;

    setIsUploading(true);
    setUploadProgress('Uploading to IPFS...');

    try {
      // Upload to IPFS
      const ipfsHash = await uploadToIPFS(selectedFile);
      setUploadProgress('Creating blockchain record...');

      // Get signer and contract
      const signer = library.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, signer);

      // Convert category string to BigNumber or default to BigNumber.from(0)
      let categoryValue;
      try {
        categoryValue = category ? ethers.BigNumber.from(category) : ethers.BigNumber.from(0);
      } catch (error) {
        console.error('Error converting category to BigNumber:', error);
        categoryValue = ethers.BigNumber.from(0);
      }
      
      // Make sure tags is an array (even if empty)
      const tagsArray = Array.isArray(tags) ? tags : [];

      // Call the contract function with all required parameters
      const tx = await contract.createRecord(
        ipfsHash,          // IPFS hash
        true,              // isEncrypted
        categoryValue,     // category as a BigNumber
        tagsArray          // tags array
      );

      setUploadProgress('Waiting for confirmation...');
      await tx.wait();

      toast({
        title: "Success",
        description: "Medical record uploaded successfully",
        status: "success",
        duration: 5000,
      });

      // Reset form and fetch updated records
      setSelectedFile(null);
      setCategory('');
      setTags([]);
      fetchRecords();

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = "Upload failed";
      if (error instanceof Error) {
        // Handle specific error messages
        errorMessage = error.message;
      }

      toast({
        title: "Error",
        description: errorMessage,
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
        recordIds.map(async (recordId: ethers.BigNumber) => {
          try {
            // Additional validation to ensure recordId is valid
            if (!recordId || recordId.toString() === 'NaN' || !ethers.BigNumber.isBigNumber(recordId)) {
              console.log('Invalid record ID format:', recordId);
              return null;
            }

            // Ensure recordId is a valid BigNumber
            if (!recordId || recordId.isZero()) {
              console.log('Invalid record ID:', recordId?.toString());
              return null;
            }

            // Check if record exists
            const exists = await contract.recordExists(recordId);
            if (!exists) {
              console.log('Record does not exist:', recordId.toString());
              return null;
            }

            const [ipfsHash, owner, timestamp, isEncrypted, category, tags] = await contract.getRecordDetails(recordId);
            
            return {
              recordId: recordId.toString(),
              ipfsHash,
              owner,
              timestamp: new Date(timestamp.toNumber() * 1000),
              isActive: true,
              ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`,
              category,
              tags,
              title: `Record #${recordId.toString()}`,
              description: `Medical record with ${tags.length} tags`
            };
          } catch (error) {
            console.error('Error fetching record details:', recordId?.toString(), error);
            return null;
          }
        })
      );
      
      // Filter out null values (non-existent records)
      const validRecords = recordsData.filter((record): record is IMedicalRecord => record !== null);
      console.log('Formatted records:', validRecords);
      setRecords(validRecords);
      setFilteredRecords(validRecords);
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
      
      // Validate the record ID before converting to BigNumber
      if (!selectedRecordId.match(/^\d+$/)) {
        throw new Error('Invalid record ID format');
      }

      // Convert recordId to BigNumber
      const recordIdBN = ethers.BigNumber.from(selectedRecordId);
      console.log('Record ID as BigNumber:', recordIdBN.toString());

      // Verify record exists before sharing
      const exists = await contract.recordExists(recordIdBN);
      if (!exists) {
        throw new Error('Record does not exist');
      }

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

      // Reset form
      setShareAddress('');
      setSelectedRecordId('');
    } catch (error) {
      console.error('Share error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to share record",
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
        setSharedWithMeRecords([]);
        return;
      }
      
      // Get details for each shared record
      const sharedRecordsData = await Promise.all(
        sharedRecordIds.map(async (recordId: ethers.BigNumber) => {
          try {
            // Additional validation to ensure recordId is valid
            if (!recordId || recordId.toString() === 'NaN' || !ethers.BigNumber.isBigNumber(recordId)) {
              console.log('Invalid shared record ID format:', recordId);
              return null;
            }

            // Ensure recordId is valid
            if (!recordId || recordId.isZero()) {
              console.log('Invalid shared record ID:', recordId?.toString());
              return null;
            }

            // Check if record exists
            const exists = await contract.recordExists(recordId);
            if (!exists) {
              console.log('Shared record does not exist:', recordId.toString());
              return null;
            }

            // Get full record details including category and tags
            const [ipfsHash, owner, timestamp, isEncrypted, category, tags] = await contract.getRecordDetails(recordId);
            
            return {
              recordId: recordId.toString(),
              ipfsHash,
              owner,
              timestamp: new Date(timestamp.toNumber() * 1000),
              isActive: true,
              ipfsUrl: `https://ipfs.io/ipfs/${ipfsHash}`,
              category,
              tags,
              title: `Record #${recordId.toString()}`,
              description: `Medical record with ${tags.length} tags`
            };
          } catch (error) {
            console.error('Error fetching shared record details:', recordId?.toString(), error);
            return null;
          }
        })
      );
      
      // Filter out null values (non-existent records)
      const validSharedRecords = sharedRecordsData.filter((record): record is IMedicalRecord => record !== null);
      console.log('Formatted shared records:', validSharedRecords);
      setSharedWithMeRecords(validSharedRecords);
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
      // Set empty array on error to avoid undefined state
      setSharedWithMeRecords([]);
    }
  };

  const handleSearch = (query: string) => {
    const lowerCaseQuery = query.trim().toLowerCase();
    if (!lowerCaseQuery) {
      setFilteredRecords(records);
      return;
    }
  
    // Log a sample record to see its structure in console
    if (records.length > 0) {
      console.log('Sample record structure:', records[0]);
    }
  
    try {
      const filtered = records.filter((record) => {
        // First check if record is null/undefined
        if (!record) return false;
  
        // Search in record ID
        if (record.recordId && record.recordId.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
  
        // Search in IPFS hash
        if (record.ipfsHash && record.ipfsHash.toLowerCase().includes(lowerCaseQuery)) {
          return true;
        }
  
        // Search in timestamp if it exists and is a Date
        if (record.timestamp) {
          const dateString = new Date(record.timestamp).toLocaleDateString();
          if (dateString.toLowerCase().includes(lowerCaseQuery)) {
            return true;
          }
        }
  
        // If we reach here, record doesn't match search criteria
        return false;
      });
  
      setFilteredRecords(filtered);
    } catch (error) {
      console.error('Search error:', error);
      // In case of error, just show all records
      setFilteredRecords(records);
      
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Showing all records.",
        status: "error",
        duration: 3000,
      });
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
          <SearchFilter onSearch={handleSearch} />
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
                        <Select
                          placeholder="Select Category"
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                        >
                          <option value="0">General</option>
                          <option value="1">Lab Report</option>
                          <option value="2">Prescription</option>
                          <option value="3">Imaging</option>
                          <option value="4">Vaccination</option>
                          <option value="5">Surgery</option>
                          <option value="6">Consultation</option>
                          <option value="7">Emergency</option>
                          <option value="8">Other</option>
                        </Select>
                        <HStack>
                          <Input
                            placeholder="Add a tag"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                          />
                          <Button onClick={addTag}>Add Tag</Button>
                        </HStack>
                        <HStack>
                          {tags.map((tag, index) => (
                            <Tag key={index} colorScheme="blue" mr={2}>
                              {tag}
                            </Tag>
                          ))}
                        </HStack>
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
                        records={filteredRecords.length > 0 ? filteredRecords : records}
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
                              isOwner={account?.toLowerCase() === records.find(r => r.recordId === selectedRecordId)?.owner?.toLowerCase()}
                            />
                            
                            <Divider my={2} />
                            <Text fontWeight="bold">Emergency Access:</Text>
                            <EmergencyAccess
                              recordId={selectedRecordId}
                              contract={new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, library.getSigner())}
                              onAccessChanged={fetchRecords}
                              isOwner={account?.toLowerCase() === records.find(r => r.recordId === selectedRecordId)?.owner?.toLowerCase()}
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
                            isOwner={account?.toLowerCase() === record.owner?.toLowerCase()}
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