import { InjectedConnector } from '@web3-react/injected-connector';
import { ethers } from 'ethers';

declare global {
    interface Window {
        ethereum?: any;
    }
}

export const injected = new InjectedConnector({
    supportedChainIds: [1337] // Hardhat local network
});

export const getLibrary = (provider: any) => {
    return new ethers.providers.Web3Provider(provider);
};

export const isMetaMaskInstalled = () => {
    return typeof window.ethereum !== 'undefined';
};