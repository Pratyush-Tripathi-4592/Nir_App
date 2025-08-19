// src/Classifier.js
import React, { useState } from 'react';

function Classifier() {
  const [image, setImage] = useState(null);
  const [citizenType, setCitizenType] = useState('ration'); // Default to 'ration'
  const [location, setLocation] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    setImage(URL.createObjectURL(e.target.files[0]));
  };

  const handleClassify = async () => {
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput.files[0]) {
      setError('Please upload an image first.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      setLocation({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });

      const formData = new FormData();
      formData.append('file', fileInput.files[0]);
      formData.append('citizen_type', citizenType);
      formData.append('lat', position.coords.latitude);
      formData.append('lng', position.coords.longitude);

      try {
        const response = await fetch('http://127.0.0.1:5000/predict', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        setResult(data);
        setError('');
      } catch (error) {
        setError('There was a problem with the fetch operation.');
        console.error('Fetch error:', error);
      }
    });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Waste Segregation & Reward</h1>
      <div>
        <label>
          <input
            type="radio"
            value="ration"
            checked={citizenType === 'ration'}
            onChange={() => setCitizenType('ration')}
          />
          Ration Card Holder
        </label>
        <label style={{ marginLeft: '10px' }}>
          <input
            type="radio"
            value="taxpayer"
            checked={citizenType === 'taxpayer'}
            onChange={() => setCitizenType('taxpayer')}
          />
          Tax Payer
        </label>
      </div>
      <div style={{ marginTop: '20px' }}>
        <input type="file" onChange={handleImageUpload} />
        <button onClick={handleClassify} style={{ marginLeft: '10px' }}>
          Classify
        </button>
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ marginTop: '20px', display: 'flex', gap: '20px' }}>
        {image && (
          <div>
            <h3>Uploaded Image</h3>
            <img src={image} alt="Uploaded" style={{ maxWidth: '300px' }} />
          </div>
        )}
        {result && (
          <div>
            <h3>Classification Results</h3>
            <p>
              <strong>Trash Type:</strong> {result.trash_type}
            </p>
            <p>
              <strong>Location:</strong> Latitude {result.lat}, Longitude {result.lng}
            </p>
            <p>
              <strong>Cleanliness Score:</strong> {result.cleanliness_score.toFixed(2)}
            </p>
            <p>
              <strong>Reward:</strong> {result.reward}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Classifier;