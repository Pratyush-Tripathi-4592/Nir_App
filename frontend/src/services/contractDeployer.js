import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

// Contract bytecode and ABI for deployment
const CONTRACT_BYTECODE = "0x608060405234801561001057600080fd5b50610150806100206000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063a0e47bf61461003b578063f8b2cb4f1461005a575b600080fd5b61004361007a565b6040516100519291906100a8565b60405180910390f35b610063610089565b6040516100719291906100d7565b60405180910390f35b60008060009054906101000a900460ff16905090565b60008060009054906101000a900460ff16905090565b6000819050919050565b6100a28161008f565b82525050565b60006020820190506100bd6000830184610099565b92915050565b6100cc8161008f565b82525050565b60006020820190506100e760008301846100c3565b9291505056fea2646970667358221220a0e47bf61461003b578063f8b2cb4f1461005a575b600080fd5b61004361007a565b6040516100519291906100a8565b60405180910390f35b610063610089565b6040516100719291906100d7565b60405180910390f35b60008060009054906101000a900460ff16905090565b60008060009054906101000a900460ff16905090565b6000819050919050565b6100a28161008f565b82525050565b60006020820190506100bd6000830184610099565b92915050565b6100cc8161008f565b82525050565b60006020820190506100e760008301846100c3565b9291505056fea2646970667358221220";

const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "submissionId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "submitter",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "trashType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "weightKg",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "name": "GarbageSubmitted",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getNextSubmissionId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_submissionId",
        "type": "uint256"
      }
    ],
    "name": "getSubmission",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "submissionId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "submitter",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "trashType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "weightKg",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "locationType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "citizenType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "areaDirtinessLevel",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalSubmissions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "submissions",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "submissionId",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "submitter",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "trashType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "weightKg",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "locationType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "citizenType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "areaDirtinessLevel",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "rewardAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "timestamp",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_trashType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_weightKg",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_locationType",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_citizenType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "_areaDirtinessLevel",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "_rewardAmount",
        "type": "uint256"
      }
    ],
    "name": "submitGarbage",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Ensure MetaMask is on Sepolia; try to switch or add the chain if needed
const ensureSepoliaNetwork = async (provider) => {
  const SEPOLIA_CHAIN_ID_HEX = '0xaa36a7'; // 11155111
  try {
    const currentChainId = await provider.request({ method: 'eth_chainId' });
    if (currentChainId !== SEPOLIA_CHAIN_ID_HEX) {
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: SEPOLIA_CHAIN_ID_HEX }]
        });
      } catch (switchError) {
        // 4902 = Unrecognized chain, try adding
        if (switchError && switchError.code === 4902) {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: SEPOLIA_CHAIN_ID_HEX,
              chainName: 'Sepolia',
              nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
              rpcUrls: ['https://rpc.sepolia.org'],
              blockExplorerUrls: ['https://sepolia.etherscan.io']
            }]
          });
        } else {
          throw switchError;
        }
      }
    }
  } catch (error) {
    console.error('Failed to ensure Sepolia network:', error);
    throw new Error('We can\'t connect to Sepolia. Please switch the network in MetaMask and try again.');
  }
};

// Normalize area dirtiness to contract range 1..5
const normalizeAreaDirtiness = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 3n; // default medium
  // If already in 1..5, keep it
  if (num >= 1 && num <= 5) return BigInt(Math.floor(num));
  // If 0..100 scale, bucketize into 1..5
  const clamped = Math.max(0, Math.min(100, Math.floor(num)));
  if (clamped <= 20) return 1n;
  if (clamped <= 40) return 2n;
  if (clamped <= 60) return 3n;
  if (clamped <= 80) return 4n;
  return 5n;
};

export const deployNewContract = async () => {
  try {
    const provider = await detectEthereumProvider();
    
    if (!provider) {
      throw new Error('Please install MetaMask!');
    }

    // Request account access
    await provider.request({ method: 'eth_requestAccounts' });
    // Ensure we are on Sepolia
    await ensureSepoliaNetwork(provider);
    
    // Create ethers provider and signer
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await ethersProvider.getSigner();
    
    // Get the factory for deploying contracts
    const factory = new ethers.ContractFactory(CONTRACT_ABI, CONTRACT_BYTECODE, signer);
    
    // Deploy the contract
    console.log('Deploying new contract...');
    const contract = await factory.deploy();
    
    // Wait for deployment
    await contract.waitForDeployment();
    
    // Get the deployed contract address
    const contractAddress = await contract.getAddress();
    
    console.log('Contract deployed at:', contractAddress);
    
    return {
      success: true,
      contractAddress: contractAddress,
      contract: contract
    };
    
  } catch (error) {
    console.error('Error deploying contract:', error);
    throw error;
  }
};

export const submitToNewContract = async (submissionData, contractAddress) => {
  try {
    const provider = await detectEthereumProvider();
    
    if (!provider) {
      throw new Error('Please install MetaMask!');
    }

    await provider.request({ method: 'eth_requestAccounts' });
    await ensureSepoliaNetwork(provider);
    const ethersProvider = new ethers.BrowserProvider(window.ethereum);
    const signer = await ethersProvider.getSigner();
    
    // Create contract instance with the new address
    const contract = new ethers.Contract(contractAddress, CONTRACT_ABI, signer);
    
    const formattedData = {
      trashType: submissionData.trashType || 'unknown',
      weightKg: ethers.getBigInt(Math.floor(submissionData.weightKg || 1)),
      locationType: submissionData.locationType || 'urban',
      citizenType: submissionData.citizenType || 'regular',
      areaDirtinessLevel: normalizeAreaDirtiness(submissionData.areaDirtinessLevel ?? 50),
      rewardAmount: ethers.getBigInt(Math.max(1, Math.floor(submissionData.rewardAmount || 1)))
    };
    
    // Submit to the new contract
    let tx;
    try {
      tx = await contract.submitGarbage(
        formattedData.trashType,
        formattedData.weightKg,
        formattedData.locationType,
        formattedData.citizenType,
        formattedData.areaDirtinessLevel,
        formattedData.rewardAmount
      );
    } catch (err) {
      console.error('Contract call reverted or gas estimation failed:', err);
      throw new Error('Transaction failed. Ensure dirtiness level is between 1 and 5 (we\'ve adjusted it automatically) and try again on Sepolia.');
    }
    
    await tx.wait();
    
    return { 
      success: true, 
      transactionHash: tx.hash,
      contractAddress: contractAddress
    };
    
  } catch (error) {
    console.error('Error submitting to new contract:', error);
    throw error;
  }
};
