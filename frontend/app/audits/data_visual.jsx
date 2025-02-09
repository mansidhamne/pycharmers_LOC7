'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DepartmentStatsVisualization = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchDepartmentStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:7000/departmentstats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching department stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartmentStats();
  }, []);

  const data = {
    labels: stats.map((stat) => stat.department),
    datasets: [
      {
        label: 'Total Spent',
        data: stats.map((stat) => stat.totalSpent),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Department Spending Overview',
      },
    },
  };

  return (
    <div>
      <h1>Department Spending Statistics</h1>
      {loading && <p>Loading...</p>}
      {stats.length > 0 && <Bar data={data} options={options} />}
    </div>
  );
};

export default DepartmentStatsVisualization;