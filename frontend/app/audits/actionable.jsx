'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AIInsights = () => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAIInsights = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:7000/ai-insights');
      setInsights(response.data.insights);
    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIInsights();
  }, []);

  return (
    <div>
      <h1>AI Insights</h1>
      {loading && <p>Loading...</p>}
      {insights && (
        <div>
          <h2>Insights:</h2>
          <ul>
            {insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
          <h2>Actionable Steps:</h2>
          <ul>
            {insights.map((insight, index) => (
              <li key={index}>
                {insight} - <button>Take Action</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default AIInsights;