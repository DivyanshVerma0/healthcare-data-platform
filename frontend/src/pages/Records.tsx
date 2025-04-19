import { Box, Heading, Text, Table, Thead, Tbody, Tr, Th, Td } from '@chakra-ui/react';

const Records = () => {
  return (
    <Box p={8}>
      <Heading mb={6}>Your Medical Records</Heading>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Record ID</Th>
            <Th>Date</Th>
            <Th>Type</Th>
            <Th>Status</Th>
          </Tr>
        </Thead>
        <Tbody>
          <Tr>
            <Td>MR001</Td>
            <Td>2024-03-20</Td>
            <Td>Prescription</Td>
            <Td>Active</Td>
          </Tr>
        </Tbody>
      </Table>
    </Box>
  );
};

export default Records;
