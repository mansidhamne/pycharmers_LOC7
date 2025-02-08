'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { UploadCloud, FileText, CheckCircle, Clock, Plus, DollarSign, TrendingUp, Receipt } from 'lucide-react'

// Interface for Employee Data


// Mock data for Expense Chart
const expenseData = [
  { month: 'Jan', amount: 1200 },
  { month: 'Feb', amount: 900 },
  { month: 'Mar', amount: 1600 },
  { month: 'Apr', amount: 1100 },
  { month: 'May', amount: 1400 },
  { month: 'Jun', amount: 1000 },
];

// Mock data for Recent Expenses
const recentExpenses = [
  { id: 1, date: '2024-02-08', category: 'Travel', amount: 250, status: 'Pending' },
  { id: 2, date: '2024-02-07', category: 'Meals', amount: 75, status: 'Approved' },
  { id: 3, date: '2024-02-06', category: 'Office Supplies', amount: 120, status: 'Rejected' },
  { id: 4, date: '2024-02-05', category: 'Training', amount: 500, status: 'Approved' },
];

export default function Dashboard() {
  const router = useRouter();
  const [employeeData, setEmployeeData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const data = localStorage.getItem('employeeData');

    console.log("Stored Employee Data:", data); // Debugging
    if (!token || !data) {
      console.error("Authentication failed, redirecting...");
      router.push('/login');
      return;
    }

    try {
      setEmployeeData(JSON.parse(data));
    } catch (error) {
      console.error("Error parsing employeeData:", error);
      router.push('/login');
    }
  }, [router]);

  if (!employeeData) return <p className="text-center mt-10">Loading...</p>;

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'text-green-600';
      case 'rejected': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto p-6">
        {/* Welcome Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {employeeData.email}</h1>
            <p className="text-muted-foreground">{employeeData.department} • {employeeData.role}</p>
          </div>
          <Button onClick={() => router.push('/expenses/new')}>
            <Plus className="mr-2 h-4 w-4" /> New Expense
          </Button>
        </div>

        {/* Overview Cards */}
        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Total Expenses</CardTitle>
              <DollarSign className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$3,445</div>
              <p className="text-sm text-muted-foreground">+20.1% from last month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pending Approvals</CardTitle>
              <Clock className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-sm text-muted-foreground">3 require immediate action</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Approved Rate</CardTitle>
              <TrendingUp className="h-5 w-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-sm text-muted-foreground">+2% from last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Expense Trends and Recent Expenses */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Expense Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={expenseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentExpenses.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center space-x-4">
                      <Receipt className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{expense.category}</p>
                        <p className="text-sm text-muted-foreground">{expense.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <p className="font-medium">${expense.amount}</p>
                      <span className={`text-sm font-medium ${getStatusColor(expense.status)}`}>
                        {expense.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button variant="outline" className="h-24 flex flex-col" onClick={() => router.push('/expenses/upload')}>
              <UploadCloud className="h-6 w-6 mb-2" /> Upload Receipt
            </Button>
            <Button variant="outline" className="h-24 flex flex-col" onClick={() => router.push('/expenses/reports')}>
              <FileText className="h-6 w-6 mb-2" /> View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
