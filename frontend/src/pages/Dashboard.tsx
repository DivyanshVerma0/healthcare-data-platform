import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardBody,
  Button,
  Input,
  useToast,
  Progress,
  Select,
  Divider,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  useColorModeValue,
  Badge,
  Flex,
  chakra,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
} from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { uploadToIPFS } from '../utils/ipfs';
import { ethers } from 'ethers';
import MedicalRecord from '../contracts/MedicalRecord.json';
import RecordsList from '../components/RecordsList';
import { MedicalRecord as IMedicalRecord } from '../types/records';
import SharedAccessList from '../components/SharedAccessList';
import { SharedWithMeRecords } from '../components/SharedWithMeRecords';
import EmergencyAccess from '../components/EmergencyAccess';
import SearchFilter from '../components/SearchFilter';
import { FiUpload, FiFolder, FiShare2, FiUsers, FiLock, FiShield } from 'react-icons/fi';
import Icon from '../components/Icon';
import { CONTRACT_ADDRESS, ROLES } from '../utils/contract';
import { useRole } from '../contexts/RoleContext';
import React, { useState, useEffect } from 'react';

// Define colors directly in the component for now
const COLORS = {
  primary: {
    500: '#0967D2',
    600: '#0552B5'
  },
  secondary: {
    500: '#2C7A7B',
    600: '#285E61'
  },
  accent: {
    500: '#6B46C1',
    600: '#553C9A'
  }
};

const CATEGORY_NAMES = [
  'General',
  'Lab Report',
  'Prescription',
  'Imaging',
  'Vaccination',
  'Surgery',
  'Consultation',
  'Emergency',
  'Other'
];

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
  const [recordName, setRecordName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const toast = useToast();
  const { role } = useRole();

  // Move all color mode values to the top
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const containerBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.100', 'gray.700');
  const textColor = useColorModeValue('gray.800', 'white');
  const subTextColor = useColorModeValue('gray.600', 'gray.400');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputBorderColor = useColorModeValue('gray.200', 'gray.600');
  const hoverBg = useColorModeValue('gray.100', 'gray.700');
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const iconColor = useColorModeValue('gray.600', 'gray.400');

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

  const requestRole = async (roleToRequest: string) => {
    if (!library || !account) return;

    try {
      const signer = library.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, signer);
      
      // Get the role hash
      const roleHash = roleToRequest === 'PATIENT' 
        ? await contract.PATIENT_ROLE()
        : await contract.DOCTOR_ROLE();

      // Request the role
      const tx = await contract.requestRoleChange(roleHash);
      await tx.wait();

      toast({
        title: "Role Requested",
        description: "Your role request has been submitted. Please wait for an admin to approve it.",
        status: "info",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error requesting role:', error);
      toast({
        title: "Error",
        description: "Failed to request role. Please try again.",
        status: "error",
        duration: 5000,
      });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !library || !account || !recordName.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a file and a name for the record",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsUploading(true);
    setUploadProgress('Uploading to IPFS...');

    try {
      const ipfsHash = await uploadToIPFS(selectedFile);
      setUploadProgress('Creating blockchain record...');

      const signer = library.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, signer);

      let categoryValue;
      try {
        categoryValue = category ? ethers.BigNumber.from(category) : ethers.BigNumber.from(0);
      } catch (error) {
        console.error('Error converting category to BigNumber:', error);
        categoryValue = ethers.BigNumber.from(0);
      }

      // Add name as the first element in the tags array
      const tx = await contract.createRecord(
        ipfsHash,
        true,
        categoryValue,
        [recordName.trim()]  // Use tags array to store the name
      );

      setUploadProgress('Waiting for confirmation...');
      await tx.wait();

      toast({
        title: "Success",
        description: "Medical record uploaded successfully",
        status: "success",
        duration: 5000,
      });

      setSelectedFile(null);
      setCategory('');
      setRecordName('');
      fetchRecords();

    } catch (error) {
      console.error('Upload error:', error);
      
      let errorMessage = "Upload failed";
      if (error instanceof Error) {
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

    // Validate Ethereum address format
    if (!ethers.utils.isAddress(shareAddress)) {
      toast({
        title: "Error",
        description: "Invalid Ethereum address format",
        status: "error",
        duration: 3000,
      });
      return;
    }

    // Prevent sharing with own address
    if (shareAddress.toLowerCase() === account.toLowerCase()) {
      toast({
        title: "Error",
        description: "Cannot share record with yourself",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setIsSharing(true);
    try {
      const signer = library.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, MedicalRecord.abi, signer);
      
      // Validate the record ID format
      if (!selectedRecordId.match(/^\d+$/)) {
        throw new Error('Invalid record ID format');
      }

      // Convert recordId to BigNumber
      const recordIdBN = ethers.BigNumber.from(selectedRecordId);
      
      // Verify record exists and ownership
      const exists = await contract.recordExists(recordIdBN);
      if (!exists) {
        throw new Error('Record does not exist');
      }

      const owner = await contract.ownerOf(recordIdBN);
      if (owner.toLowerCase() !== account.toLowerCase()) {
        throw new Error('You are not the owner of this record');
      }

      // Check if recipient already has access
      const hasAccess = await contract.hasAccess(recordIdBN, shareAddress);
      if (hasAccess) {
        throw new Error('Recipient already has access to this record');
      }

      // Verify recipient has a valid role
      const hasPatientRole = await contract.hasRole(ROLES.PATIENT, shareAddress);
      const hasDoctorRole = await contract.hasRole(ROLES.DOCTOR, shareAddress);
      const hasResearcherRole = await contract.hasRole(ROLES.RESEARCHER, shareAddress);

      if (!hasPatientRole && !hasDoctorRole && !hasResearcherRole) {
        throw new Error('Recipient must have a valid role (Patient, Doctor, or Researcher)');
      }

      // Show pending transaction toast
      const pendingToast = toast({
        title: "Sharing Record",
        description: "Please wait while the transaction is being processed...",
        status: "info",
        duration: null,
        isClosable: false,
      });

      const tx = await contract.grantAccess(recordIdBN, shareAddress, {
        gasLimit: 500000
      });
      
      console.log('Transaction submitted:', tx.hash);
      await tx.wait();
      console.log('Transaction confirmed');

      // Close pending toast
      toast.close(pendingToast);

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
      
      // Extract meaningful error message
      let errorMessage = "Failed to share record";
      if (error instanceof Error) {
        // Check for specific error messages from the contract
        if (error.message.includes("execution reverted")) {
          const revertMessage = error.message.match(/reason: ([^"]+)/)?.[1] || errorMessage;
          errorMessage = revertMessage;
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

  // Simple filtering that won't interfere with core functionality
  const applyFilters = () => {
    let result = [...records];

    // Apply category filter
    if (selectedCategory) {
      result = result.filter(record => record.category.toString() === selectedCategory);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(record => {
        const name = record.tags?.[0] || '';
        return name.toLowerCase().includes(query);
      });
    }

    setFilteredRecords(result);
  };

  // Update filters when records change
  useEffect(() => {
    setFilteredRecords(records);
  }, [records]);

  // Update filters when search or category changes
  useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedCategory]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
  };

  useEffect(() => {
    if (active && account) {
      fetchRecords();
      fetchSharedWithMeRecords();
    }
  }, [active, account]);

  if (!active) {
    return (
      <Box bg={bgColor} minH="100vh" py={8}>
        <Container maxW="container.xl">
          <Card 
            p={8} 
            textAlign="center" 
            bg={containerBg}
            borderRadius="xl"
            boxShadow="lg"
          >
            <VStack spacing={6}>
              <Icon icon={FiLock} boxSize={12} color={COLORS.primary[500]} />
              <Heading size="lg" color={textColor}>
                Connect Your Wallet
              </Heading>
              <Text fontSize="lg" color={subTextColor}>
                Please connect your wallet to access your medical records dashboard
              </Text>
            </VStack>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} minH="100vh" py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          <Flex 
            direction={{ base: 'column', md: 'row' }}
            justify="space-between" 
            align={{ base: 'flex-start', md: 'center' }}
            bg={containerBg}
            p={6}
            borderRadius="xl"
            boxShadow="sm"
            mb={6}
          >
            <Box>
              <Heading 
                fontSize={{ base: '2xl', md: '3xl' }}
                color={textColor}
                mb={2}
              >
                Medical Records Dashboard
              </Heading>
              <Text color={subTextColor}>
                Securely manage and share your medical records
              </Text>
            </Box>
            {!active && (
              <Badge 
                colorScheme="red" 
                p={3} 
                borderRadius="lg"
                display="flex"
                alignItems="center"
                mt={{ base: 4, md: 0 }}
              >
                <Icon icon={FiLock} boxSize={4} mr={2} />
                Wallet Not Connected
              </Badge>
            )}
          </Flex>

          {active ? (
            <>
              <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={6}>
                <Stat
                  px={6}
                  py={4}
                  bg={containerBg}
                  borderRadius="lg"
                  boxShadow="sm"
                  border="1px"
                  borderColor={borderColor}
                >
                  <StatLabel color={subTextColor}>Total Records</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" color={COLORS.primary[500]}>
                    {records.length}
                  </StatNumber>
                  <StatHelpText>Your medical documents</StatHelpText>
                </Stat>
                <Stat
                  px={6}
                  py={4}
                  bg={containerBg}
                  borderRadius="lg"
                  boxShadow="sm"
                  border="1px"
                  borderColor={borderColor}
                >
                  <StatLabel color={subTextColor}>Shared Records</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" color={COLORS.secondary[500]}>
                    {records.filter(r => r.isActive).length}
                  </StatNumber>
                  <StatHelpText>Records you've shared</StatHelpText>
                </Stat>
                <Stat
                  px={6}
                  py={4}
                  bg={containerBg}
                  borderRadius="lg"
                  boxShadow="sm"
                  border="1px"
                  borderColor={borderColor}
                >
                  <StatLabel color={subTextColor}>Shared With Me</StatLabel>
                  <StatNumber fontSize="3xl" fontWeight="bold" color={COLORS.accent[500]}>
                    {sharedWithMeRecords.length}
                  </StatNumber>
                  <StatHelpText>Records shared with you</StatHelpText>
                </Stat>
              </SimpleGrid>

              <HStack spacing={4} mb={6}>
                <Box flex="1">
                  <SearchFilter onSearch={handleSearch} />
                </Box>
                <Select
                  placeholder="Filter by category"
                  value={selectedCategory}
                  onChange={(e) => handleCategoryFilter(e.target.value)}
                  maxW="200px"
                  bg={inputBg}
                  borderColor={inputBorderColor}
                  _hover={{ borderColor: COLORS.primary[500] }}
                  _focus={{ borderColor: COLORS.primary[500], boxShadow: 'outline' }}
                >
                  <option value="">All Categories</option>
                  {CATEGORY_NAMES.map((name: string, index: number) => (
                    <option key={index} value={index.toString()}>
                      {name}
                    </option>
                  ))}
                </Select>
              </HStack>

              <Tabs 
                variant="soft-rounded" 
                colorScheme="blue"
                bg={containerBg}
                p={6}
                borderRadius="xl"
                boxShadow="sm"
                border="1px"
                borderColor={borderColor}
              >
                <TabList mb={8} gap={4}>
                  <Tab 
                    _selected={{ 
                      color: 'white',
                      bg: COLORS.primary[500]
                    }}
                    _hover={{
                      bg: hoverBg
                    }}
                  >
                    <Icon icon={FiFolder} boxSize={5} mr={2} /> My Records
                  </Tab>
                  <Tab
                    _selected={{ 
                      color: 'white',
                      bg: COLORS.secondary[500]
                    }}
                    _hover={{
                      bg: hoverBg
                    }}
                  >
                    <Icon icon={FiShare2} boxSize={5} mr={2} /> Shared By Me
                  </Tab>
                  <Tab
                    _selected={{ 
                      color: 'white',
                      bg: COLORS.accent[500]
                    }}
                    _hover={{
                      bg: hoverBg
                    }}
                  >
                    <Icon icon={FiUsers} boxSize={5} mr={2} /> Shared With Me
                  </Tab>
                </TabList>

                <TabPanels>
                  <TabPanel px={0}>
                    <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={6}>
                      <Card
                        variant="outline"
                        bg={containerBg}
                        borderRadius="xl"
                        boxShadow="sm"
                        borderColor={borderColor}
                        _hover={{ 
                          borderColor: COLORS.primary[500],
                          transform: 'translateY(-2px)',
                          transition: 'all 0.2s'
                        }}
                      >
                        <CardBody>
                          <VStack spacing={6}>
                            <Icon icon={FiUpload} boxSize={10} color={COLORS.primary[500]} />
                            <Heading size="md" color={textColor}>
                              Upload Records
                            </Heading>
                            <Text textAlign="center" color={subTextColor}>
                              Upload your medical records securely to the blockchain
                            </Text>
                            <Input
                              placeholder="Enter record name"
                              value={recordName}
                              onChange={(e) => setRecordName(e.target.value)}
                              bg={inputBg}
                              borderColor={inputBorderColor}
                              _hover={{ borderColor: COLORS.primary[500] }}
                              _focus={{ borderColor: COLORS.primary[500], boxShadow: 'outline' }}
                            />
                            <Box
                              position="relative"
                              width="100%"
                              height="100px"
                              border="2px dashed"
                              borderColor={inputBorderColor}
                              borderRadius="lg"
                              p={4}
                              _hover={{ borderColor: COLORS.primary[500] }}
                            >
                              <Input
                                type="file"
                                height="100%"
                                width="100%"
                                position="absolute"
                                top="0"
                                left="0"
                                opacity="0"
                                aria-hidden="true"
                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                disabled={isUploading}
                                onChange={handleFileSelect}
                              />
                              <VStack spacing={2} justify="center" height="100%">
                                <Icon icon={FiUpload} boxSize={6} color={iconColor} />
                                <Text fontSize="sm" color={subTextColor}>
                                  {selectedFile ? selectedFile.name : 'Drop files here or click to upload'}
                                </Text>
                              </VStack>
                            </Box>
                            <Select
                              placeholder="Select Category"
                              value={category}
                              onChange={(e) => setCategory(e.target.value)}
                              bg={inputBg}
                              borderColor={inputBorderColor}
                              _hover={{ borderColor: COLORS.primary[500] }}
                              _focus={{ borderColor: COLORS.primary[500], boxShadow: 'outline' }}
                            >
                              {CATEGORY_NAMES.map((name, index) => (
                                <option key={index} value={index}>
                                  {name}
                                </option>
                              ))}
                            </Select>
                            {isUploading && (
                              <Box w="100%">
                                <Progress 
                                  size="xs" 
                                  isIndeterminate 
                                  colorScheme="blue"
                                  borderRadius="full"
                                />
                                <Text mt={2} fontSize="sm" color={subTextColor}>
                                  {uploadProgress}
                                </Text>
                              </Box>
                            )}
                            <Button 
                              colorScheme="blue"
                              onClick={handleUpload}
                              isDisabled={!selectedFile || isUploading}
                              isLoading={isUploading}
                              loadingText={uploadProgress}
                              width="full"
                              leftIcon={<Icon icon={FiUpload} />}
                              bg={COLORS.primary[500]}
                              _hover={{ bg: COLORS.primary[600] }}
                            >
                              Upload File
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>

                      <Card
                        variant="outline"
                        bg={containerBg}
                        borderRadius="xl"
                        boxShadow="sm"
                        borderColor={borderColor}
                        gridColumn={{ base: "auto", lg: "span 2" }}
                      >
                        <CardBody>
                          <HStack mb={6} justify="space-between">
                            <Heading size="md" color={textColor}>
                              Your Records
                            </Heading>
                            <Icon icon={FiShield} boxSize={6} color={COLORS.primary[500]} />
                          </HStack>
                          <RecordsList 
                            records={filteredRecords.length > 0 ? filteredRecords : records}
                            onRefresh={fetchRecords}
                          />
                        </CardBody>
                      </Card>
                    </SimpleGrid>
                  </TabPanel>

                  <TabPanel>
                    <Card 
                      variant="outline" 
                      bg={containerBg}
                      borderRadius="xl"
                      borderColor={borderColor}
                    >
                      <CardBody>
                        <HStack mb={6} justify="space-between" align="center">
                          <Box>
                            <Heading size="md" color={textColor}>
                              Share Record
                            </Heading>
                            <Text color={subTextColor} mt={1}>
                              Share your medical records with other addresses
                            </Text>
                          </Box>
                          <Icon icon={FiShare2} boxSize={6} color={COLORS.secondary[500]} />
                        </HStack>
                        <VStack spacing={4}>
                          <Select
                            placeholder="Select Record"
                            value={selectedRecordId}
                            onChange={(e) => setSelectedRecordId(e.target.value)}
                            bg={inputBg}
                            borderColor={inputBorderColor}
                          >
                            {records.map((record) => (
                              <option key={record.recordId} value={record.recordId}>
                                {record.tags?.[0] || `Record ${record.recordId}`}
                              </option>
                            ))}
                          </Select>
                          <Input
                            placeholder="Enter wallet address"
                            value={shareAddress}
                            onChange={(e) => setShareAddress(e.target.value)}
                            bg={inputBg}
                            borderColor={inputBorderColor}
                          />
                          <Button
                            colorScheme="blue"
                            onClick={handleShare}
                            isLoading={isSharing}
                            width="full"
                            leftIcon={<Icon icon={FiShare2} />}
                            bg={COLORS.secondary[500]}
                            _hover={{ bg: COLORS.secondary[600] }}
                          >
                            Share Record
                          </Button>
                        </VStack>
                        <Divider my={6} />
                        <VStack spacing={4} align="stretch">
                          {records.map((record) => (
                            <Box 
                              key={record.recordId} 
                              p={6} 
                              borderWidth={1} 
                              borderRadius="lg"
                              bg={cardBg}
                              _hover={{ 
                                borderColor: COLORS.secondary[500],
                                transform: 'translateY(-2px)',
                                transition: 'all 0.2s'
                              }}
                            >
                              <Text 
                                fontWeight="bold"
                                color={textColor}
                              >
                                {record.tags && record.tags.length > 0 ? record.tags[0] : `Record ${record.recordId}`}
                              </Text>
                              <Text 
                                fontSize="sm" 
                                color={subTextColor} 
                                mt={1}
                              >
                                Date: {new Date(record.timestamp).toLocaleDateString()}
                              </Text>
                              <Text 
                                fontSize="sm" 
                                color={subTextColor} 
                                mt={1}
                                fontFamily="mono"
                              >
                                IPFS Hash: {record.ipfsHash}
                              </Text>
                              <Divider my={4} />
                              <Text 
                                fontWeight="bold" 
                                mb={3}
                                color={textColor}
                              >
                                Shared With:
                              </Text>
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
                        </VStack>
                      </CardBody>
                    </Card>
                  </TabPanel>

                  <TabPanel>
                    <Card 
                      variant="outline" 
                      bg={containerBg}
                      borderRadius="xl"
                      borderColor={borderColor}
                    >
                      <CardBody>
                        <HStack mb={6} justify="space-between">
                          <Heading size="md" color={textColor}>
                            Records Shared With Me
                          </Heading>
                          <Icon icon={FiUsers} boxSize={6} color={COLORS.accent[500]} />
                        </HStack>
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
            <Card 
              p={8} 
              textAlign="center" 
              bg={containerBg}
              borderRadius="xl"
              boxShadow="lg"
            >
              <VStack spacing={6}>
                <Icon icon={FiLock} boxSize={12} color={COLORS.primary[500]} />
                <Heading size="lg" color={textColor}>
                  Connect Your Wallet
                </Heading>
                <Text fontSize="lg" color={subTextColor}>
                  Please connect your wallet to access your medical records dashboard
                </Text>
              </VStack>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  );
};

export default Dashboard;