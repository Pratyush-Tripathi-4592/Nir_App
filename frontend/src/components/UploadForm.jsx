import React, { useState, useEffect, useRef } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip as ChartTooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, ChartTooltip, Legend);

const ResultCard = ({ result, imageURL }) => {
  const canvasRef = useRef(null);
  const [dirtinessPoints, setDirtinessPoints] = useState([]);

  useEffect(() => {
    if (result && imageURL && canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);
            // Add a check to ensure detections is an array
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
  
  // Add a robust check for the result object
  if (!result || typeof result.lat === 'undefined' || typeof result.lng === 'undefined') {
    return <p>Loading results or result data is incomplete...</p>;
  }
  
  const userPosition = [parseFloat(result.lat), parseFloat(result.lng)];
  const dirtinessLevel = result.dirtiness_level || 0;
  const rewardPoints = result.reward_points || 0;

  useEffect(() => {
    const points = [];
    for (let i = 0; i <= 100; i += 10) {
      points.push({ x: i, y: Math.sin((i / 100) * 2 * Math.PI) * 50 + 50 });
    }
    setDirtinessPoints(points);
  }, []);

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h5 className="card-title">Result Details</h5>
        <div className="mb-3">
          <strong>Location:</strong> Latitude {result.lat}, Longitude {result.lng}
        </div>
        <div className="mb-3">
          <strong>Dirtiness Level:</strong> {dirtinessLevel}
        </div>
        <div className="mb-3">
          <strong>Reward Points:</strong> {rewardPoints}
        </div>

        <div className="mb-3">
          <canvas ref={canvasRef} />
        </div>

        <div className="mb-3">
          <h6>Dirtiness Level Over Time</h6>
          <canvas id="dirtinessChart" />
        </div>
      </div>
    </div>
  );
};

export default ResultCard;