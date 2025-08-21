// frontend/src/components/ResultCard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, CircleMarker, Popup, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import BlockchainPopup from './BlockchainPopup.jsx';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const ResultCard = ({ result, imageURL }) => {
  const canvasRef = useRef(null);
  const [dirtinessPoints, setDirtinessPoints] = useState([]);
  const [showBlockchainPopup, setShowBlockchainPopup] = useState(false);
  const [lastContractAddress, setLastContractAddress] = useState('');

  // ... (All the logic and useEffect hooks remain exactly the same) ...
  const getScoreColor = (score) => {
    if (score > 0.8) return 'red';
    if (score > 0.6) return 'orange';
    return 'green';
  };

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/dirtiness-points')
      .then(res => res.json())
      .then(data => setDirtinessPoints(data))
      .catch(err => console.error("Failed to fetch dirtiness points:", err));
  }, []);
  
  useEffect(() => {
    const storedAddress = localStorage.getItem('lastContractAddress');
    if (storedAddress) {
      setLastContractAddress(storedAddress);
    }
  }, []);

  useEffect(() => {
    if (result && imageURL && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            if (result.detections && Array.isArray(result.detections)) {
                result.detections.forEach(det => {
                    const [x1, y1, x2, y2] = det.box;
                    const label = `${det.label} ${det.confidence.toFixed(2)}`;
                    ctx.strokeStyle = det.label === 'recyclable' ? '#00FF00' : '#FF0000';
                    ctx.lineWidth = 2;
                    ctx.font = '16px Arial';
                    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
                    ctx.fillStyle = ctx.strokeStyle;
                    const textWidth = ctx.measureText(label).width;
                    const textHeight = 20;
                    const textY = y1 > textHeight ? y1 - textHeight : y1;
                    ctx.fillRect(x1, textY, textWidth + 8, textHeight);
                    ctx.fillStyle = '#FFFFFF';
                    ctx.fillText(label, x1 + 4, textY + 15);
                });
            }
        };
        img.src = imageURL;
    }
  }, [result, imageURL]);
  
  if (!result) {
    return <p>Loading results...</p>;
  }
  
  const userPosition = [parseFloat(result.lat || 0), parseFloat(result.lng || 0)];
  
  const suggestions = [];
  let potentialBaseReward = result.base_reward || 0;
  let potentialCleanlinessBonus = result.cleanliness_bonus || 0;
  const maxDirtinessPoint = dirtinessPoints.reduce(
    (max, p) => (p.score > max.score ? p : max),
    { score: 0, lat: 0, lng: 0, name: "Unknown" }
  );
  let isRecyclableImproved = false;
  if (result.trash_type && result.trash_type.toLowerCase() !== 'recyclable') {
    potentialBaseReward = 10;
    isRecyclableImproved = true;
  }
  let isLocationImproved = false;
  if (maxDirtinessPoint.score > (result.cleanliness_score || 0)) {
    potentialCleanlinessBonus = potentialBaseReward * maxDirtinessPoint.score;
    isLocationImproved = true;
  }
  const totalPotentialReward = potentialBaseReward + potentialCleanlinessBonus;
  const rewardType = (result.reward && result.reward.includes("Tax Credit")) ? "Tax Credit" : "Ration Subsidy";

  const commonChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  };
  const currentChartData = {
    labels: ['Base Reward', 'Cleanliness Bonus'],
    datasets: [{
      data: [result.base_reward || 0, result.cleanliness_bonus || 0],
      backgroundColor: ['#36A2EB', '#FFCE56'],
      hoverBackgroundColor: ['#36A2EB', '#FFCE56'],
    }],
  };
  const potentialChartData = {
    labels: ['Base Reward', 'Cleanliness Bonus'],
    datasets: [{
      data: [potentialBaseReward, Number(potentialCleanlinessBonus.toFixed(2))],
      backgroundColor: ['#4BC0C0', '#FF9F40'],
      hoverBackgroundColor: ['#4BC0C0', '#FF9F40'],
    }],
  };

  const handleGetReward = () => {
    setShowBlockchainPopup(true);
  };

  const handleBlockchainSuccess = (blockchainResult) => {
    console.log('Blockchain submission successful:', blockchainResult);
    console.log('New contract deployed at:', blockchainResult.contractAddress);
    console.log('Transaction hash:', blockchainResult.transactionHash);
    
    // You can add additional logic here like updating UI or showing success message
    // For example, you could store the contract address in localStorage or state
    if (blockchainResult.contractAddress) {
      localStorage.setItem('lastContractAddress', blockchainResult.contractAddress);
      setLastContractAddress(blockchainResult.contractAddress);
    }
  };

  const prepareSubmissionData = () => {
    return {
      trashType: result.trash_type || 'unknown',
      weightKg: result.weight_kg || 1,
      locationType: result.location_type || 'urban',
      citizenType: result.citizen_type || 'regular',
      areaDirtinessLevel: Math.floor((result.cleanliness_score || 0) * 100) || 50,
      rewardAmount: parseFloat((result.reward || '0').replace(/[^\d.]/g, '')) || 0
    };
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '30px', padding: '0 20px' }}>
      <h2>Classification Complete</h2>
      
      {/* Get Reward Button - Add this at the top */}
      <div style={{ marginBottom: '30px' }}>
        <button
          onClick={handleGetReward}
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '15px 30px',
            borderRadius: '25px',
            fontSize: '1.2rem',
            fontWeight: '600',
            cursor: 'pointer',
            boxShadow: '0 10px 20px rgba(102, 126, 234, 0.3)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-3px)';
            e.target.style.boxShadow = '0 15px 30px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 10px 20px rgba(102, 126, 234, 0.3)';
          }}
        >
          🚀 Deploy New Contract & Get Reward
        </button>
        <p style={{ 
          color: '#6b7280', 
          fontSize: '0.9rem', 
          marginTop: '10px',
          fontStyle: 'italic'
        }}>
          ✨ Each submission gets its own fresh, isolated smart contract on the blockchain
        </p>
      </div>

      {/* Top section with Canvas and Map */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'flex-start', marginBottom: '30px' }}>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>Detected Items</h3>
          <canvas ref={canvasRef} style={{ maxWidth: '100%', border: '1px solid grey' }} />
        </div>
        <div style={{ flex: 1, minWidth: '300px' }}>
          <h3>Location & Cleanliness Map</h3>
          <MapContainer center={userPosition} zoom={11} style={{ height: '400px', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
            {dirtinessPoints.map(point => (
                <CircleMarker key={`${point.lat}-${point.lng}`} center={[point.lat, point.lng]} radius={20} pathOptions={{ color: getScoreColor(point.score || 0), fillColor: getScoreColor(point.score || 0), fillOpacity: 0.5 }}>
                    <Tooltip permanent direction="center" className="dirtiness-tooltip">{(point.score || 0).toFixed(2)}</Tooltip>
                </CircleMarker>
            ))}
            <Marker position={userPosition}><Popup>Your Location</Popup></Marker>
          </MapContainer>
        </div>
      </div>

      {/* Reward Factors Comparison Table */}
      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', maxWidth: '900px', margin: 'auto' }}>
        <h3>💡 Reward Factors & Suggestions</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Factor</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Your Current</th>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Potential Improvement</th>
                </tr>
            </thead>
            <tbody>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Waste Type</td>
                    <td style={{ padding: '8px' }}>{result.trash_type || 'Unknown'} (Base: ₹{result.base_reward || 0})</td>
                    <td style={{ padding: '8px' }}>
                        {isRecyclableImproved ? `Recyclable (Base: ₹${potentialBaseReward})` : '✅ Optimal'}
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Location Score</td>
                    <td style={{ padding: '8px' }}>{(result.cleanliness_score || 0).toFixed(2)}</td>
                    <td style={{ padding: '8px' }}>
                        {isLocationImproved ? `${maxDirtinessPoint.score.toFixed(2)} at ${maxDirtinessPoint.name}` : '✅ Optimal'}
                    </td>
                </tr>
            </tbody>
        </table>
      </div>

      {/* Two-Graph Comparison Section */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap', alignItems: 'center', marginTop: '30px' }}>
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '450px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
            <h4>Your Reward Breakdown</h4>
            <Doughnut options={commonChartOptions} data={currentChartData} />
            <h3 style={{marginTop: '15px'}}>Total: {result.reward || '₹0'}</h3>
        </div>
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '450px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
            <h4>Potential Reward Breakdown</h4>
            <Doughnut options={commonChartOptions} data={potentialChartData} />
            <h3 style={{marginTop: '15px', color: '#FFFFFF'}}>{`Potential Total: ₹${(totalPotentialReward || 0).toFixed(2)} ${rewardType}`}</h3>
        </div>
      </div>

      {/* Blockchain Popup */}
      <BlockchainPopup
        isOpen={showBlockchainPopup}
        onClose={() => setShowBlockchainPopup(false)}
        submissionData={prepareSubmissionData()}
        onSuccess={handleBlockchainSuccess}
      />
      
      {/* Last Contract Info */}
      {lastContractAddress && (
        <div style={{
          background: '#f0fdf4',
          border: '1px solid #22c55e',
          borderRadius: '8px',
          padding: '15px',
          margin: '20px auto',
          maxWidth: '600px',
          textAlign: 'center'
        }}>
          <p style={{ margin: '0 0 10px 0', color: '#166534', fontWeight: '600' }}>
            📋 Last Deployed Contract:
          </p>
          <code style={{
            background: '#1e293b',
            color: '#e2e8f0',
            padding: '8px 12px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '0.8rem',
            wordBreak: 'break-all',
            display: 'block',
            margin: '0 auto',
            maxWidth: '400px'
          }}>
            {lastContractAddress}
          </code>
          <a 
            href={`https://sepolia.etherscan.io/address/${lastContractAddress}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: '#22c55e',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              textDecoration: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              display: 'inline-block',
              marginTop: '10px'
            }}
          >
            🔍 View on Etherscan
          </a>
        </div>
      )}
    </div>
  );
};

export default ResultCard;