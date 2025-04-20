import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Records from './pages/Records';
import SharedAccess from './pages/SharedAccess';
import RoleManagement from './components/RoleManagement';
import { Web3ReactProvider } from '@web3-react/core';
import { getLibrary } from './utils/web3';
import { RoleProvider } from './contexts/RoleContext';

function App() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <RoleProvider>
        <ChakraProvider>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/records" element={<Records />} />
              <Route path="/shared" element={<SharedAccess />} />
              <Route path="/roles" element={<RoleManagement />} />
            </Routes>
          </Router>
        </ChakraProvider>
      </RoleProvider>
    </Web3ReactProvider>
  );
}

export default App;
