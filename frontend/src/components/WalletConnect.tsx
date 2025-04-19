import { Button, Text, Box } from '@chakra-ui/react';
import { useWeb3React } from '@web3-react/core';
import { injected } from '../utils/web3';

const WalletConnect = () => {
  const { active, account, activate, deactivate } = useWeb3React();

  const connect = async () => {
    try {
      await activate(injected);
    } catch (error) {
      console.error(error);
    }
  };

  const disconnect = () => {
    deactivate();
  };

  return (
    <Box>
      {active ? (
        <Box>
          <Text color="white" fontSize="sm" mb={1}>
            {account?.slice(0, 6)}...{account?.slice(-4)}
          </Text>
          <Button onClick={disconnect} colorScheme="red" size="sm">
            Disconnect
          </Button>
        </Box>
      ) : (
        <Button onClick={connect} colorScheme="blue" size="sm">
          Connect Wallet
        </Button>
      )}
    </Box>
  );
};

export default WalletConnect;