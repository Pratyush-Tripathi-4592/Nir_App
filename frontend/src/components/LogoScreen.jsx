import React from 'react';

const LogoScreen = ({ onNext }) => {
  return (
    // The fade-in class creates the smooth appearance from the video
    <div className="fade-in" style={{ textAlign: 'center' }}>
      {/* CORRECTED: Using the actual filename from your project */}
      <img src="/Nirmalya_logo.jpg" alt="Nirmalya.AI Logo" style={{ maxWidth: '100px', marginBottom: '10px' }} />
      <h2 style={{ margin: '0' }}>Nirmalya</h2>
      <p>Welcome to the future of waste management.</p>
      {/* CORRECTED: The button is now back, as shown in the video */}
      <button onClick={onNext} style={{ marginTop: '20px' }}>
        Launch Reward Predictor
      </button>
    </div>
  );
};

export default LogoScreen;