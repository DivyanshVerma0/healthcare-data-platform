import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWeb3React } from '@web3-react/core';
import { ethers } from 'ethers';
import { getContract, ROLES } from '../utils/contract';
import { useToast } from '@chakra-ui/react';

export type Role = 'PATIENT' | 'DOCTOR' | 'RESEARCHER' | 'ADMIN' | null;

export interface UserProfile {
    name: string;
    specialization: string;
    institution: string;
    role: Role;
}

interface RoleContextType {
    role: Role;
    userProfile: UserProfile | null;
    isLoading: boolean;
    checkRole: () => Promise<void>;
    updateProfile: (name: string, specialization: string, institution: string) => Promise<void>;
    requestRoleChange: (newRole: Role) => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

export const RoleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { account, library } = useWeb3React();
    const [role, setRole] = useState<Role>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const toast = useToast();

    const checkRole = async () => {
        if (!account || !library) {
            setRole(null);
            setUserProfile(null);
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            const contract = getContract(library.getSigner());

            // Check each role
            const roleChecks = await Promise.all([
                contract.hasRole(ROLES.PATIENT, account),
                contract.hasRole(ROLES.DOCTOR, account),
                contract.hasRole(ROLES.RESEARCHER, account),
                contract.hasRole(ROLES.ADMIN, account),
            ]);

            // Get the first matching role
            const roleMap: Role[] = ['PATIENT', 'DOCTOR', 'RESEARCHER', 'ADMIN'];
            const detectedRole = roleMap[roleChecks.findIndex(check => check)] || null;
            setRole(detectedRole);

            // Fetch user profile from contract or API
            if (detectedRole) {
                const profile = await contract.getUserProfile(account);
                setUserProfile({
                    name: profile.name,
                    role: detectedRole,
                    specialization: profile.specialization,
                    institution: profile.institution,
                });
            }
        } catch (error) {
            console.error('Error checking role:', error);
            setRole(null);
            setUserProfile(null);
        } finally {
            setIsLoading(false);
        }
    };

    const updateProfile = async (name: string, specialization: string, institution: string) => {
        if (!account || !library) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            // Optimistic update
            if (userProfile) {
                setUserProfile({
                    ...userProfile,
                    name,
                    specialization,
                    institution
                });
            }

            const contract = getContract(library.getSigner());
            const tx = await contract.updateUserProfile(name, specialization, institution);
            
            toast({
                title: "Updating profile...",
                description: "Please wait while your transaction is being processed",
                status: "info",
                duration: 5000,
                isClosable: true,
            });

            await tx.wait();

            toast({
                title: "Success",
                description: "Your profile has been updated successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
            });

            // Refresh profile to ensure data consistency
            await checkRole();
        } catch (error: any) {
            // Revert optimistic update
            await checkRole();
            
            toast({
                title: "Error",
                description: error.message || "Failed to update profile",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    const requestRoleChange = async (newRole: Role) => {
        if (!account || !library) {
            toast({
                title: "Error",
                description: "Please connect your wallet first",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        if (!newRole) {
            toast({
                title: "Error",
                description: "Please select a valid role",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
            return;
        }

        try {
            const contract = getContract(library.getSigner());
            
            // Store the role request in a separate smart contract function
            // This will emit an event that admins can listen to
            const tx = await contract.requestRoleChange(ROLES[newRole]);
            
            toast({
                title: "Role Change Requested",
                description: "Your role change request has been submitted and is pending admin approval",
                status: "info",
                duration: 5000,
                isClosable: true,
            });

            await tx.wait();
            
            toast({
                title: "Request Submitted",
                description: `Your request to change role to ${newRole} is now pending admin approval`,
                status: "success",
                duration: 5000,
                isClosable: true,
            });
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to request role change",
                status: "error",
                duration: 5000,
                isClosable: true,
            });
        }
    };

    useEffect(() => {
        checkRole();
    }, [account, library]);

    return (
        <RoleContext.Provider value={{ 
            role, 
            userProfile, 
            updateProfile, 
            checkRole, 
            isLoading,
            requestRoleChange 
        }}>
            {children}
        </RoleContext.Provider>
    );
};

export const useRole = () => {
    const context = useContext(RoleContext);
    if (context === undefined) {
        throw new Error('useRole must be used within a RoleProvider');
    }
    return context;
}; 