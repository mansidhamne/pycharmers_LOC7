"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Search, Filter, ChevronDown, Receipt } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data
const expenses = [
  {
    id: 1,
    employeeName: "John Doe",
    department: "Engineering",
    amount: 250,
    category: "Travel",
    date: "2024-02-08",
    status: "pending",
    receipts: 2,
  },
  {
    id: 2,
    employeeName: "Jane Smith",
    department: "Marketing",
    amount: 175,
    category: "Meals",
    date: "2024-02-07",
    status: "pending",
    receipts: 1,
  },
  // Add more mock data as needed
]

export default function Approvals() {
  const router = useRouter()
  const [selectedExpenses, setSelectedExpenses] = useState<number[]>([])

  const toggleExpense = (id: number) => {
    setSelectedExpenses((prev) => (prev.includes(id) ? prev.filter((expenseId) => expenseId !== id) : [...prev, id]))
  }

  const handleBatchApprove = () => {
    // Add your batch approval logic here
    console.log("Approving:", selectedExpenses)
  }

  const handleBatchReject = () => {
    // Add your batch rejection logic here
    console.log("Rejecting:", selectedExpenses)
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Approvals</h1>
            <p className="text-muted-foreground">Manage and review expense submissions</p>
          </div>
          <div className="flex space-x-4">
            {selectedExpenses.length > 0 && (
              <>
                <Button variant="outline" onClick={handleBatchReject}>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject Selected
                </Button>
                <Button onClick={handleBatchApprove}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Selected
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search expenses..." className="pl-9" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem>All Departments</DropdownMenuItem>
                <DropdownMenuItem>Engineering</DropdownMenuItem>
                <DropdownMenuItem>Marketing</DropdownMenuItem>
                <DropdownMenuItem>Sales</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              Pending
              <Badge variant="secondary" className="ml-2">
                12
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="approved">
              Approved
              <Badge variant="secondary" className="ml-2">
                48
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="rejected">
              Rejected
              <Badge variant="secondary" className="ml-2">
                7
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {expenses.map((expense) => (
              <Card key={expense.id} className="hover:bg-slate-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300"
                        checked={selectedExpenses.includes(expense.id)}
                        onChange={() => toggleExpense(expense.id)}
                      />
                      <div>
                        <h3 className="font-medium">{expense.employeeName}</h3>
                        <p className="text-sm text-muted-foreground">{expense.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-medium">${expense.amount}</p>
                        <p className="text-sm text-muted-foreground">{expense.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{expense.date}</p>
                        <p className="text-sm text-muted-foreground">{expense.receipts} receipt(s)</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/expenses/${expense.id}`)}>
                        <Receipt className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardDescription>Showing approved expenses from the last 30 days</CardDescription>
              </CardHeader>
              {/* Add approved expenses list here */}
            </Card>
          </TabsContent>

          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardDescription>Showing rejected expenses from the last 30 days</CardDescription>
              </CardHeader>
              {/* Add rejected expenses list here */}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

