import React, { useState } from 'react';

const UploadForm = ({ citizenType, onResult }) => {
  const [imageURL, setImageURL] = useState(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageURL(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleClassify = () => {
    const fileInput = document.querySelector('input[type="file"]');
    if (!fileInput.files[0]) {
      setError('Please upload an image first.');
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
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
        onResult(data, imageURL);
      } catch (error) {
        setError('There was a problem with the fetch operation.');
        console.error('Fetch error:', error);
      }
    });
  };

  return (
    <div className="card">
      <h2>Upload Waste Image</h2>
      <p>Selected Type: <strong>{citizenType.charAt(0).toUpperCase() + citizenType.slice(1)}</strong></p>
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