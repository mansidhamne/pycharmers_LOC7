'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Bar, Pie, Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
)

const mockData = [
  { 
    department: 'HR', 
    totalSpent: 50000, 
    employeeCount: 25, 
    averageSpentPerEmployee: 2000,
    trend: 'up',
    insight: 'Training costs increased by 15%. Consider bulk training programs for better cost efficiency.'
  },
  { 
    department: 'Engineering', 
    totalSpent: 150000, 
    employeeCount: 75, 
    averageSpentPerEmployee: 2000,
    trend: 'down',
    insight: 'Tool costs decreased due to consolidated licenses. Keep monitoring unused subscriptions.'
  },
  { 
    department: 'Marketing', 
    totalSpent: 80000, 
    employeeCount: 35, 
    averageSpentPerEmployee: 2285.71,
    trend: 'up',
    insight: 'High ad spend relative to outcomes. Review campaign ROI and optimize channel allocation.'
  },
  { 
    department: 'Sales', 
    totalSpent: 120000, 
    employeeCount: 50, 
    averageSpentPerEmployee: 2400,
    trend: 'neutral',
    insight: 'Travel expenses stable but high. Consider hybrid client meeting approach.'
  },
]

const colorScheme = [
  'rgba(255, 99, 132, 0.6)',
  'rgba(54, 162, 235, 0.6)',
  'rgba(255, 206, 86, 0.6)',
  'rgba(75, 192, 192, 0.6)',
]

const DepartmentStatsVisualization = () => {
  const [stats, setStats] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)
  const statsi = [
    { department: "HR", trend: "up", insight: "Monthly expenses increased by 12%. Consider optimizing hiring costs." },
    { department: "IT", trend: "down", insight: "Infrastructure expenses reduced by 8%. Maintain cost-saving measures." },
    { department: "Marketing", trend: "neutral", insight: "Ad spend remains consistent. Monitor upcoming campaign budgets." },
    { department: "Operations", trend: "up", insight: "Logistics costs surged by 15%. Evaluate alternative vendors." },
  ];
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('http://localhost:7000/departmentstats')
        setStats(response.data.data.length ? response.data.data : mockData)
      } catch (error) {
        setIsError(true)
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  const chartData = {
    labels: stats.map((stat) => stat.department),
    datasets: [
      {
        label: 'Total Spent',
        data: stats.map((stat) => stat.totalSpent),
        backgroundColor: colorScheme,
      },
    ],
  }

  const employeeData = {
    labels: stats.map((stat) => stat.department),
    datasets: [
      {
        label: 'Avg Spend per Employee',
        data: stats.map((stat) => stat.averageSpentPerEmployee),
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.1,
      },
    ],
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
      {isLoading ? (
        Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-64 w-full" />)
      ) : (
        <>
          <Card className="col-span-1 lg:col-span-2 row-span-2">
            <CardHeader>
              <CardTitle>Total Department Spending</CardTitle>
            </CardHeader>
            <CardContent className="h-96">
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>

          <Card className="col-span-1 row-span-1">
            <CardHeader>
              <CardTitle>Spending Distribution</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>

          <Card className="col-span-1 row-span-1">
            <CardHeader>
              <CardTitle>Avg. Spend per Employee</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <Line data={employeeData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>

          <Card className="col-span-1 lg:col-span-3">
            <CardHeader>
              <CardTitle>Department Insights & Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsi.map((stat, index) => (
                  <div key={index} className="p-4 rounded-lg bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-lg">{stat.department}</h3>
                      {stat.trend === 'up' && <TrendingUp className="text-red-500" />}
                      {stat.trend === 'down' && <TrendingDown className="text-green-500" />}
                      {stat.trend === 'neutral' && <AlertTriangle className="text-yellow-500" />}
                    </div>
                    <p className="text-sm text-gray-600">{stat.insight}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default DepartmentStatsVisualization