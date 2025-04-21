import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { toast } from 'react-toastify';
import { updateUserRole } from '../services/api';
import { getContract, grantRole, revokeRole, ROLES as CONTRACT_ROLES } from '../utils/contract';
import { ethers } from 'ethers';
import { useAuth } from './AuthContext';
import { useWeb3React } from '@web3-react/core';

export type Role = 'ADMIN' | 'PATIENT' | 'DOCTOR' | 'RESEARCHER' | null;

interface UserProfile {
  name: string;
  specialization?: string;
  institution?: string;
}

interface RoleContextType {
  role: Role;
  setRole: (role: Role) => void;
  userProfile: UserProfile | null;
  updateProfile: (name: string, specialization?: string, institution?: string) => Promise<void>;
  requestRoleChange: (newRole: Role) => Promise<void>;
  isLoading: boolean;
  updateRole: (userId: string, newRole: string) => Promise<void>;
  isUpdating: boolean;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { account, library, active } = useWeb3React();
  const [role, setRole] = useState<Role>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const checkBlockchainRole = async () => {
      if (!library || !account || !active) return;

      try {
        const contract = getContract(library.getSigner());
        
        const isAdmin = await contract.hasRole(CONTRACT_ROLES.ADMIN, account);
        if (isAdmin) {
          setRole('ADMIN');
          return;
        }

        const isDoctor = await contract.hasRole(CONTRACT_ROLES.DOCTOR, account);
        if (isDoctor) {
          setRole('DOCTOR');
          return;
        }

        const isPatient = await contract.hasRole(CONTRACT_ROLES.PATIENT, account);
        if (isPatient) {
          setRole('PATIENT');
          return;
        }

        const isResearcher = await contract.hasRole(CONTRACT_ROLES.RESEARCHER, account);
        if (isResearcher) {
          setRole('RESEARCHER');
          return;
        }

        setRole(null);
      } catch (error) {
        console.error('Error checking blockchain role:', error);
        setRole(null);
      }
    };

    checkBlockchainRole();
  }, [library, account, active]);

  const updateProfile = async (name: string, specialization?: string, institution?: string) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to update profile
      setUserProfile({ name, specialization, institution });
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Error updating profile');
    } finally {
      setIsLoading(false);
    }
  };

  const requestRoleChange = async (newRole: Role) => {
    setIsLoading(true);
    try {
      // TODO: Implement API call to request role change
      setRole(newRole);
      toast.success('Role change requested successfully');
    } catch (error) {
      toast.error('Error requesting role change');
    } finally {
      setIsLoading(false);
    }
  };

  const updateRole = async (userId: string, newRole: string) => {
    if (!window.ethereum) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsUpdating(true);
    try {
      // Update role in backend
      await updateUserRole(userId, newRole);

      // Update role in blockchain
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const contract = getContract(signer);
      const targetAddress = await signer.getAddress();

      // Revoke all existing roles first
      const roles = ['PATIENT', 'DOCTOR', 'RESEARCHER', 'ADMIN'];
      for (const role of roles) {
        try {
          await revokeRole(contract, targetAddress, role);
        } catch (err) {
          console.log(`No ${role} role to revoke`);
        }
      }

      // Grant new role
      await grantRole(contract, targetAddress, newRole.toUpperCase());
      
      toast.success('Role updated successfully in both system and blockchain');
    } catch (err: any) {
      console.error('Error updating role:', err);
      toast.error(err.message || 'Failed to update role');
    } finally {
      setIsUpdating(false);
    }
  };

  const value = {
    role,
    setRole,
    userProfile,
    updateProfile,
    requestRoleChange,
    isLoading,
    updateRole,
    isUpdating
  };

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
};

export const useRole = () => {
  const context = useContext(RoleContext);
  if (context === undefined) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

export const ROLES = [
  { value: 'PATIENT', label: 'Patient' },
  { value: 'DOCTOR', label: 'Doctor' },
  { value: 'RESEARCHER', label: 'Researcher' }
] as const; 