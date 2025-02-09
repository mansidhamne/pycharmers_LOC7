'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepartmentStatsVisualization from './data_visual';
import AIInsights from './actionable';
const AuditReports = () => {
  const [period, setPeriod] = useState('yearly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAuditReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:3001audit/${period}`);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching audit report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditReport();
  }, [period]);

  return (
    <div>
      <h1>Audit Reports</h1>
      <select value={period} onChange={(e) => setPeriod(e.target.value)}>
        <option value="yearly">Yearly</option>
        <option value="half-yearly">Half-Yearly</option>
        <option value="quarterly">Quarterly</option>
      </select>

      {loading && <p>Loading...</p>}
      {reportData && (
        <div>
          {Object.entries(reportData).map(([key, data]) => (
            <div key={key}>
              <h2>{key}</h2>
              <p>Total Expenses: ${data.total}</p>
              <h3>Category Breakdown:</h3>
              <ul>
                {Object.entries(data.categories).map(([category, amount]) => (
                  <li key={category}>
                    {category}: ${amount}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <DepartmentStatsVisualization />
    </div>
  );
};

export default AuditReports;