import React, { useState } from 'react';
import { submitToBlockchain } from '../services/blockchain';

const UploadForm = ({ citizenType, onResult }) => {
  const [imageURL, setImageURL] = useState(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleClassify = (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    navigator.geolocation.getCurrentPosition(async (position) => {
      const formData = new FormData();
      formData.append('file', imageURL);
      formData.append('lat', position.coords.latitude);
      formData.append('lng', position.coords.longitude);
      formData.append('citizen_type', citizenType);

      try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Submit to blockchain with better error handling
        try {
          await submitToBlockchain({
            trashType: data.trash_type || 'unknown',
            weightKg: Math.floor(data.estimated_weight || 1),
            locationType: 'urban',
            citizenType: citizenType,
            areaDirtinessLevel: Math.floor(data.cleanliness_score * 100) || 50,
            rewardAmount: Math.floor(parseFloat(data.reward) || 0)
          });

          onResult(data, imageURL);
        } catch (blockchainError) {
          console.error('Blockchain error:', blockchainError);
          setError('Blockchain submission failed. Please check your wallet connection and try again.');
        }
      } catch (error) {
        console.error('API error:', error);
        setError('Failed to process image. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }, (geoError) => {
      setError('Location access is required. Please enable location services.');
      setIsSubmitting(false);
    });
  };

  return (
    <div className="card">
      <h2>Upload Waste Image</h2>
      <p>Selected Type: <strong>{citizenType.charAt(0).toUpperCase() + citizenType.slice(1)}</strong></p>
      {isSubmitting && <p style={{ color: '#666' }}>Recording data on blockchain...</p>}
      <div style={{ margin: '20px 0' }}>
        <input type="file" accept="image/*" onChange={handleImageUpload} />
      </div>
      
      {imageURL && (
        <div style={{ margin: '20px 0' }}>
          <img src={imageURL} alt="Uploaded Preview" style={{ maxWidth: '300px', borderRadius: '8px' }} />
        </div>
      )}
      
      <button onClick={handleClassify}>
        Predict Reward
      </button>

      {error && <p style={{ color: 'yellow', marginTop: '15px' }}>{error}</p>}
    </div>
  );
};

export default UploadForm;