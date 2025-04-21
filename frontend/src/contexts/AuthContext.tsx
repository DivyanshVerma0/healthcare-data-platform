import React, { createContext, useContext, useState, useEffect } from 'react';
import { login as apiLogin, register as apiRegister, getUserData } from '../services/api';
import { getContract, verifyRole } from '../utils/contract';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blockchainRoleVerified, setBlockchainRoleVerified] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!user && blockchainRoleVerified;

  useEffect(() => {
    verifyToken();
  }, []);

  useEffect(() => {
    if (user) {
      verifyBlockchainRole();
    }
  }, [user]);

  const verifyBlockchainRole = async () => {
    if (!user || !window.ethereum) return;

    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const address = await signer.getAddress();
      
      const hasRole = await verifyRole(contract, address, user.role.toUpperCase());
      
      if (!hasRole) {
        toast.error('Your blockchain role does not match your account role. Please contact an administrator.');
        setBlockchainRoleVerified(false);
        return;
      }
      
      setBlockchainRoleVerified(true);
    } catch (err) {
      console.error('Error verifying blockchain role:', err);
      setBlockchainRoleVerified(false);
      toast.error('Failed to verify blockchain role. Please make sure your wallet is connected.');
    }
  };

  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const userData = await getUserData();
      setUser(userData as User);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      const response = await apiLogin(email, password);
      if (response && typeof response === 'object' && 'token' in response && 'user' in response) {
        localStorage.setItem('token', response.token as string);
        setUser(response.user as User);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
      throw err;
    }
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    try {
      setError(null);
      const response = await apiRegister(email, password, name, role);
      if (response && typeof response === 'object' && 'token' in response && 'user' in response) {
        localStorage.setItem('token', response.token as string);
        setUser(response.user as User);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setBlockchainRoleVerified(false);
    navigate('/');
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 