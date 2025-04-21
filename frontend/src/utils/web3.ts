import { InjectedConnector } from '@web3-react/injected-connector';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const injected = new InjectedConnector({
    supportedChainIds: [1, 5, 11155111, 1337, 80001] // Mainnet, Goerli, Sepolia, Local, Mumbai
});

export const getLibrary = (provider: any) => {
    return new ethers.providers.Web3Provider(provider);
};

export const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
};

export const NETWORK_NAMES: { [chainId: number]: string } = {
    1: 'Ethereum Mainnet',
    5: 'Goerli Testnet',
    11155111: 'Sepolia Testnet',
    1337: 'Local Network',
    80001: 'Mumbai Testnet'
};