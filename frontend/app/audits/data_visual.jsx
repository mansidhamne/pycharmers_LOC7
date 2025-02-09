'use client'

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { format, subMonths } from 'date-fns'
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
  { department: 'HR', totalSpent: 5000, employeeCount: 10, averageSpentPerEmployee: 500 },
  { department: 'Engineering', totalSpent: 15000, employeeCount: 30, averageSpentPerEmployee: 500 },
  { department: 'Marketing', totalSpent: 8000, employeeCount: 15, averageSpentPerEmployee: 533.33 },
  { department: 'Sales', totalSpent: 12000, employeeCount: 20, averageSpentPerEmployee: 600 },
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

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const response = await axios.get('http://localhost:3001/departmentstats')
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

  return (
    <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3 lg:grid-cols-4">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)
      ) : (
        <>
          <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Total Spending</CardTitle>
            </CardHeader>
            <CardContent>
              <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>

          <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Spending Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <Pie data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>

          <Card className="col-span-2 lg:col-span-1">
            <CardHeader>
              <CardTitle>Avg. Spend per Employee</CardTitle>
            </CardHeader>
            <CardContent>
              <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

export default DepartmentStatsVisualization
