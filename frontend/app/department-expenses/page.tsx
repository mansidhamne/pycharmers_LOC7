"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"

// Mock data
const departmentData = [
  { name: "Engineering", expenses: 50000, budget: 60000 },
  { name: "Marketing", expenses: 35000, budget: 40000 },
  { name: "Sales", expenses: 45000, budget: 50000 },
  { name: "HR", expenses: 20000, budget: 25000 },
  { name: "Finance", expenses: 15000, budget: 20000 },
]

const categoryData = [
  { name: "Travel", value: 30 },
  { name: "Office Supplies", value: 15 },
  { name: "Software", value: 25 },
  { name: "Training", value: 20 },
  { name: "Miscellaneous", value: 10 },
]

const monthlyData = [
  { name: "Jan", Engineering: 4000, Marketing: 2400, Sales: 3000 },
  { name: "Feb", Engineering: 3000, Marketing: 1398, Sales: 2500 },
  { name: "Mar", Engineering: 2000, Marketing: 9800, Sales: 2800 },
  { name: "Apr", Engineering: 2780, Marketing: 3908, Sales: 3300 },
  { name: "May", Engineering: 1890, Marketing: 4800, Sales: 2900 },
  { name: "Jun", Engineering: 2390, Marketing: 3800, Sales: 3100 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"]

export default function DepartmentExpenses() {
  const [selectedDepartment, setSelectedDepartment] = useState("All")

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Department Expenses</h1>
        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All Departments</SelectItem>
            {departmentData.map((dept) => (
              <SelectItem key={dept.name} value={dept.name}>
                {dept.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Expenses</CardTitle>
            <CardDescription>Across all departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${departmentData.reduce((sum, dept) => sum + dept.expenses, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
            <CardDescription>Average across departments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {Math.round(
                (departmentData.reduce((sum, dept) => sum + dept.expenses, 0) /
                  departmentData.reduce((sum, dept) => sum + dept.budget, 0)) *
                  100,
              )}
              %
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Highest Spending Dept</CardTitle>
            <CardDescription>Department with max expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {departmentData.reduce((max, dept) => (dept.expenses > max.expenses ? dept : max)).name}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Expenses vs Budget</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={departmentData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="expenses" fill="#8884d8" name="Expenses" />
                  <Bar dataKey="budget" fill="#82ca9d" name="Budget" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Categories</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Expense Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={monthlyData}
                  margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="Engineering" stroke="#8884d8" activeDot={{ r: 8 }} />
                  <Line type="monotone" dataKey="Marketing" stroke="#82ca9d" />
                  <Line type="monotone" dataKey="Sales" stroke="#ffc658" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Cost Optimization Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              The Engineering department has the highest expenses but is still under budget. Consider reallocating funds
              to departments that are closer to their budget limits.
            </li>
            <li>
              Travel expenses make up 30% of total expenses. Implement a stricter travel policy or encourage virtual
              meetings to reduce costs.
            </li>
            <li>
              Software expenses are significant. Review software licenses and subscriptions to identify potential areas
              for consolidation or negotiation of better rates.
            </li>
            <li>
              Marketing expenses show high variability month-to-month. Work with the Marketing department to create more
              consistent budgeting and spending practices.
            </li>
            <li>
              HR has the lowest expenses relative to its budget. Evaluate if additional investments in employee
              development or wellness programs could be beneficial.
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

