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
        
        // Use the correct function name from the contract
        const tx = await contract.submitGarbage(
            formattedData.trashType,
            formattedData.weightKg,
            formattedData.locationType,
            formattedData.citizenType,
            formattedData.areaDirtinessLevel,
            formattedData.rewardAmount
        );
        
        await tx.wait();
        return { success: true, transactionHash: tx.hash };
    } catch (error) {
        console.error('Error submitting to blockchain:', error);
        throw error;
    }
};

export const checkNetwork = async () => {
    try {
        const provider = await detectEthereumProvider();
        if (provider) {
            const chainId = await provider.request({ method: 'eth_chainId' });
            const expectedChainId = import.meta.env.VITE_NETWORK_ID;
            if (chainId !== `0x${parseInt(expectedChainId).toString(16)}`) {
                throw new Error(`Please switch to Sepolia testnet. Current: ${chainId}, Expected: 0x${parseInt(expectedChainId).toString(16)}`);
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error checking network:', error);
        throw error;
    }
};
