import React from 'react';

const CitizenTypeSelect = ({ onSelect }) => {
  return (
    <div className="card">
      <h2>Select Your Citizen Type</h2>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '20px' }}>
        <button onClick={() => onSelect('ration')}>
          Ration Card Holder
        </button>
        <button onClick={() => onSelect('taxpayer')}>
          Tax Payer
        </button>
      </div>
    </div>
  );
};

export default CitizenTypeSelect;