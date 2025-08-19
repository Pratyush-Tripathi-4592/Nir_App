import React from "react";

export default function RewardResult({ result }) {
  if (!result) return null;

  return (
    <div className="p-4 bg-gray-100 rounded mt-4 shadow">
      <h3 className="text-lg font-bold">Reward Result</h3>
      <p>Classification: {result.classification}</p>
      <p>Reward: {result.reward} credits</p>
      <p>Location: {result.lat}, {result.lon}</p>
      <p>Dirtyness Index: {result.dirtyness_score}</p>
    </div>
  );
}
