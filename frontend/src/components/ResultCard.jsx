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

ChartJS.register(ArcElement, ChartTooltip, Legend);

const ResultCard = ({ result, imageURL }) => {
  const canvasRef = useRef(null);
  const [dirtinessPoints, setDirtinessPoints] = useState([]);

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
    if (result && imageURL && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
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
        };
        img.src = imageURL;
    }
  }, [result, imageURL]);
  
  if (!result) {
    return <p>Loading results...</p>;
  }
  
  const userPosition = [parseFloat(result.lat), parseFloat(result.lng)];
  
  const suggestions = [];
  let potentialBaseReward = result.base_reward;
  let potentialCleanlinessBonus = result.cleanliness_bonus;
  const maxDirtinessPoint = dirtinessPoints.reduce(
    (max, p) => (p.score > max.score ? p : max),
    { score: 0, lat: 0, lng: 0, name: "Unknown" }
  );
  let isRecyclableImproved = false;
  if (result.trash_type.toLowerCase() !== 'recyclable') {
    potentialBaseReward = 10;
    isRecyclableImproved = true;
  }
  let isLocationImproved = false;
  if (maxDirtinessPoint.score > result.cleanliness_score) {
    potentialCleanlinessBonus = potentialBaseReward * maxDirtinessPoint.score;
    isLocationImproved = true;
  }
  const totalPotentialReward = potentialBaseReward + potentialCleanlinessBonus;
  const rewardType = result.reward.includes("Tax Credit") ? "Tax Credit" : "Ration Subsidy";

  const commonChartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
    },
  };
  const currentChartData = {
    labels: ['Base Reward', 'Cleanliness Bonus'],
    datasets: [{
      data: [result.base_reward, result.cleanliness_bonus],
      backgroundColor: ['#36A2EB', '#FFCE56'],
      hoverBackgroundColor: ['#36A2EB', '#FFCE56'],
    }],
  };
  const potentialChartData = {
    labels: ['Base Reward', 'Cleanliness Bonus'],
    datasets: [{
      data: [potentialBaseReward, potentialCleanlinessBonus.toFixed(2)],
      backgroundColor: ['#4BC0C0', '#FF9F40'],
      hoverBackgroundColor: ['#4BC0C0', '#FF9F40'],
    }],
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '30px', padding: '0 20px' }}>
      <h2>Classification Complete</h2>
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
                <CircleMarker key={`${point.lat}-${point.lng}`} center={[point.lat, point.lng]} radius={20} pathOptions={{ color: getScoreColor(point.score), fillColor: getScoreColor(point.score), fillOpacity: 0.5 }}>
                    <Tooltip permanent direction="center" className="dirtiness-tooltip">{point.score.toFixed(2)}</Tooltip>
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
                    <td style={{ padding: '8px' }}>{result.trash_type} (Base: ₹{result.base_reward})</td>
                    <td style={{ padding: '8px' }}>
                        {isRecyclableImproved ? `Recyclable (Base: ₹${potentialBaseReward})` : '✅ Optimal'}
                    </td>
                </tr>
                <tr>
                    <td style={{ padding: '8px', fontWeight: 'bold' }}>Location Score</td>
                    <td style={{ padding: '8px' }}>{result.cleanliness_score.toFixed(2)}</td>
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
            <h3 style={{marginTop: '15px'}}>Total: {result.reward}</h3>
        </div>
        <div style={{ flex: 1, minWidth: '300px', maxWidth: '450px', border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
            <h4>Potential Reward Breakdown</h4>
            <Doughnut options={commonChartOptions} data={potentialChartData} />
            {/* THIS IS THE LINE THAT WAS CHANGED */}
            <h3 style={{marginTop: '15px', color: '#FFFFFF'}}>{`Potential Total: ₹${totalPotentialReward.toFixed(2)} ${rewardType}`}</h3>
        </div>
      </div>
    </div>
  );
};

export default ResultCard;