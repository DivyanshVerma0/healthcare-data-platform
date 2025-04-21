import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { ChakraProvider } from '@chakra-ui/react';
import { Web3ReactProvider } from '@web3-react/core';
import { ethers } from 'ethers';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { RoleProvider } from './contexts/RoleContext';
import AppRoutes from './routes';

function getLibrary(provider: any) {
  return new ethers.providers.Web3Provider(provider);
}

function App() {
  return (
    <ChakraProvider>
      <Web3ReactProvider getLibrary={getLibrary}>
        <Router>
          <AuthProvider>
            <RoleProvider>
              <AppRoutes />
              <ToastContainer position="top-right" autoClose={5000} />
            </RoleProvider>
          </AuthProvider>
        </Router>
      </Web3ReactProvider>
    </ChakraProvider>
  );
}

export default App;
