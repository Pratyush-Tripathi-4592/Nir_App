import React, { useState } from 'react';
import { submitToBlockchain } from '../services/blockchain';

const UploadForm = ({ citizenType, onResult }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewURL(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!imageFile) {
      setError('Please select an image file');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      // Get location
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      // Create FormData object
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('citizen_type', citizenType || 'regular');
      formData.append('lat', position.coords.latitude.toString());
      formData.append('lng', position.coords.longitude.toString());

      // Log FormData contents (for debugging)
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }

      // Make API call
      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Server error');
      }

      const result = await response.json();
      onResult(result, previewURL);

    } catch (error) {
      console.error('Error:', error);
      setError(error.message || 'Failed to process image');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container p-4">
      <h2 className="mb-4">Upload Waste Image</h2>
      <div className="mb-3">
        <p>Selected Type: {citizenType}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="form-control"
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="alert alert-danger mb-3">
            {error}
          </div>
        )}

        {previewURL && (
          <div className="mb-3">
            <img
              src={previewURL}
              alt="Preview"
              className="img-thumbnail"
              style={{ maxHeight: '300px' }}
            />
          </div>
        )}

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!imageFile || isSubmitting}
        >
          {isSubmitting ? 'Processing...' : 'Predict Reward'}
        </button>
      </form>
    </div>
  );
};

export default UploadForm;