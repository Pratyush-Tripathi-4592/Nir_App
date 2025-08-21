import React, { useState } from 'react';
import { deployNewContract, submitToNewContract } from '../services/contractDeployer.js';

const BlockchainPopup = ({ isOpen, onClose, submissionData, onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [transactionHash, setTransactionHash] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [currentStep, setCurrentStep] = useState('deploy'); // 'deploy' or 'submit'

  const handleDeployAndSubmit = async () => {
    setIsLoading(true);
    setError('');
    setCurrentStep('deploy');
    
    try {
      // Step 1: Deploy new contract
      console.log('Step 1: Deploying new contract...');
      const deployResult = await deployNewContract();
      setContractAddress(deployResult.contractAddress);
      
      // Step 2: Submit data to the new contract
      setCurrentStep('submit');
      console.log('Step 2: Submitting data to new contract...');
      const submitResult = await submitToNewContract(submissionData, deployResult.contractAddress);
      
      setSuccess(true);
      setTransactionHash(submitResult.transactionHash);
      
      // Call the success callback after a delay
      setTimeout(() => {
        onSuccess({
          ...submitResult,
          contractAddress: deployResult.contractAddress
        });
        onClose();
      }, 3000);
      
    } catch (err) {
      setError(err.message || 'Failed to deploy contract or submit data');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '0',
        maxWidth: '500px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 24px',
          borderBottom: '1px solid #e5e7eb',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          borderRadius: '12px 12px 0 0'
        }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600 }}>
            🚀 Deploy New Contract & Get Reward
          </h2>
          <button 
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '24px',
              cursor: 'pointer',
              padding: 0,
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
          >
            ×
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          {!success ? (
            <>
              <div style={{ marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#374151', fontSize: '1.2rem' }}>
                  📋 Submission Details
                </h3>
                <div style={{
                  background: '#f9fafb',
                  padding: '15px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb'
                }}>
                  <p><strong>Trash Type:</strong> {submissionData.trashType}</p>
                  <p><strong>Weight:</strong> {submissionData.weightKg} kg</p>
                  <p><strong>Location:</strong> {submissionData.locationType}</p>
                  <p><strong>Citizen Type:</strong> {submissionData.citizenType}</p>
                  <p><strong>Dirtiness Level:</strong> {submissionData.areaDirtinessLevel}</p>
                  <p><strong>Reward Amount:</strong> ₹{submissionData.rewardAmount}</p>
                </div>
              </div>
              
              <div style={{
                background: '#fef3c7',
                border: '1px solid #f59e0b',
                borderRadius: '8px',
                padding: '15px',
                marginBottom: '20px'
              }}>
                <p style={{ margin: '5px 0', color: '#92400e', fontSize: '0.9rem' }}>
                  ⚠️ Make sure you have MetaMask installed and connected to Sepolia testnet
                </p>
                <p style={{ margin: '5px 0', color: '#92400e', fontSize: '0.9rem' }}>
                  💰 You'll need some Sepolia ETH for contract deployment (~0.001-0.005 ETH) and gas fees
                </p>
                <p style={{ margin: '5px 0', color: '#92400e', fontSize: '0.9rem' }}>
                  🆕 A completely fresh smart contract will be deployed for each submission
                </p>
                <p style={{ margin: '5px 0', color: '#92400e', fontSize: '0.9rem' }}>
                  🔄 This ensures your data is stored in a brand new, clean contract instance
                </p>
                <p style={{ margin: '5px 0', color: '#92400e', fontSize: '0.9rem' }}>
                  ✨ Benefits: Isolated data, no conflicts, maximum security, and transparency
                </p>
              </div>
              
              {currentStep === 'deploy' && isLoading && (
                <div style={{
                  background: '#dbeafe',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  color: '#1e40af',
                  textAlign: 'center'
                }}>
                  🔄 Deploying new smart contract...
                </div>
              )}
              
              {currentStep === 'submit' && isLoading && (
                <div style={{
                  background: '#dbeafe',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  color: '#1e40af',
                  textAlign: 'center'
                }}>
                  📝 Submitting data to new contract...
                </div>
              )}
              
              {error && (
                <div style={{
                  background: '#fee2e2',
                  border: '1px solid #ef4444',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  color: '#dc2626'
                }}>
                  ❌ {error}
                </div>
              )}
              
              {currentStep === 'deploy' && isLoading && (
                <div style={{
                  background: '#dbeafe',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  color: '#1e40af',
                  textAlign: 'center'
                }}>
                  🔄 Deploying new smart contract...
                </div>
              )}
              
              {currentStep === 'submit' && isLoading && (
                <div style={{
                  background: '#dbeafe',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '20px',
                  color: '#1e40af',
                  textAlign: 'center'
                }}>
                  📝 Submitting data to new contract...
                </div>
              )}
              
              <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '15px'
                }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: currentStep === 'deploy' ? '#3b82f6' : '#d1d5db',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    1
                  </div>
                  <span style={{ color: currentStep === 'deploy' ? '#3b82f6' : '#6b7280' }}>
                    Deploy Contract
                  </span>
                  <div style={{ width: '20px', height: '2px', backgroundColor: '#d1d5db' }}></div>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    backgroundColor: currentStep === 'submit' ? '#3b82f6' : '#d1d5db',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold'
                  }}>
                    2
                  </div>
                  <span style={{ color: currentStep === 'submit' ? '#3b82f6' : '#6b7280' }}>
                    Submit Data
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button 
                  onClick={handleDeployAndSubmit}
                  disabled={isLoading}
                  style={{
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    opacity: isLoading ? 0.6 : 1,
                    minWidth: '200px'
                  }}
                >
                  {isLoading ? '⏳ Processing...' : '🚀 Deploy & Submit'}
                </button>
                <button 
                  onClick={onClose}
                  disabled={isLoading}
                  style={{
                    background: '#6b7280',
                    color: 'white',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    cursor: isLoading ? 'not-allowed' : 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <div style={{ fontSize: '4rem', marginBottom: '20px' }}>✅</div>
              <h3 style={{ color: '#059669', marginBottom: '15px' }}>
                Successfully Deployed & Submitted!
              </h3>
              <p>Your garbage submission has been recorded on a new smart contract.</p>
              <p style={{ color: '#059669', fontWeight: '600', marginBottom: '20px' }}>
                🆕 This is a completely fresh contract deployed just for your submission!
              </p>
              
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                padding: '15px',
                margin: '20px 0'
              }}>
                <p><strong>New Contract Address:</strong></p>
                <code style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  wordBreak: 'break-all',
                  display: 'block',
                  marginTop: '8px'
                }}>
                  {contractAddress}
                </code>
              </div>
              
              <div style={{
                background: '#f0f9ff',
                border: '1px solid #0ea5e9',
                borderRadius: '8px',
                padding: '15px',
                margin: '20px 0'
              }}>
                <p><strong>Transaction Hash:</strong></p>
                <code style={{
                  background: '#1e293b',
                  color: '#e2e8f0',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  wordBreak: 'break-all',
                  display: 'block',
                  marginTop: '8px'
                }}>
                  {transactionHash}
                </code>
              </div>
              
              <p>This popup will close automatically in a few seconds...</p>
              
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #22c55e',
                borderRadius: '8px',
                padding: '15px',
                margin: '20px 0'
              }}>
                <p style={{ margin: '0 0 10px 0', color: '#166534', fontWeight: '600' }}>
                  🔍 View on Blockchain Explorer:
                </p>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <a 
                    href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#22c55e',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    📋 Contract
                  </a>
                  <a 
                    href={`https://sepolia.etherscan.io/tx/${transactionHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      background: '#3b82f6',
                      color: 'white',
                      padding: '8px 16px',
                      borderRadius: '6px',
                      textDecoration: 'none',
                      fontSize: '0.9rem',
                      fontWeight: '600'
                    }}
                  >
                    🔗 Transaction
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlockchainPopup;
