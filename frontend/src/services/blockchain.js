import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';
import contractABI from '../contracts/GarbageRewardSystem.json';

export const initializeBlockchain = async () => {
    try {
        const provider = await detectEthereumProvider();
        
        if (provider) {
            await provider.request({ method: 'eth_requestAccounts' });
            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const signer = await ethersProvider.getSigner();
            const contract = new ethers.Contract(import.meta.env.VITE_CONTRACT_ADDRESS, contractABI.abi, signer);
            return { contract, signer };
        } else {
            throw new Error('Please install MetaMask!');
        }
    } catch (error) {
        console.error('Error initializing blockchain:', error);
        throw error;
    }
};

export const submitToBlockchain = async (submissionData) => {
    try {
        const { contract } = await initializeBlockchain();
        const formattedData = {
            trashType: submissionData.trashType || 'unknown',
            weightKg: ethers.getBigInt(Math.floor(submissionData.weightKg || 1)),
            locationType: submissionData.locationType || 'urban',
            citizenType: submissionData.citizenType || 'regular',
            areaDirtinessLevel: ethers.getBigInt(Math.floor(submissionData.areaDirtinessLevel || 50)),
            rewardAmount: ethers.getBigInt(Math.floor(submissionData.rewardAmount || 0))
        };
        const tx = await contract.submitWasteRecord(
            formattedData.trashType,
            formattedData.weightKg,
            formattedData.locationType,
            formattedData.citizenType,
            formattedData.areaDirtinessLevel,
            formattedData.rewardAmount
        );
        await tx.wait();
        return true;
    } catch (error) {
        console.error('Error submitting to blockchain:', error);
        throw error;
    }
};
