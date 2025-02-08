"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card"
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
    aiApproved: true,
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
    aiApproved: false,
  },
]

export default function Approvals() {
  const router = useRouter()
  const [selectedExpense, setSelectedExpense] = useState(null)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Expense Approvals</h1>
            <p className="text-muted-foreground">Manage and review expense submissions</p>
          </div>
        </div>

        {/* Summary Section */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium">Total Pending</h3>
              <p className="text-2xl font-bold">{expenses.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium">AI Approved</h3>
              <p className="text-2xl font-bold">{expenses.filter((e) => e.aiApproved).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="text-lg font-medium">AI Rejected</h3>
              <p className="text-2xl font-bold">{expenses.filter((e) => !e.aiApproved).length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {expenses.map((expense) => (
              <Card
                key={expense.id}
                className="hover:bg-slate-50 cursor-pointer"
                onClick={() => setSelectedExpense(expense)}
              >
                <CardContent className="p-6 flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">{expense.employeeName}</h3>
                    <p className="text-sm text-muted-foreground">{expense.department}</p>
                  </div>
                  <div>
                    <p className="font-medium">${expense.amount}</p>
                    <p className="text-sm text-muted-foreground">{expense.category}</p>
                  </div>
                  <div>
                    <p className="text-sm">{expense.date}</p>
                    <p className="text-sm text-muted-foreground">{expense.receipts} receipt(s)</p>
                  </div>
                  {expense.aiApproved ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Detailed View */}
        {selectedExpense && (
          <Card className="mt-6">
            <CardHeader>
              <h3 className="text-lg font-bold">Expense Details</h3>
            </CardHeader>
            <CardContent className="p-6">
              <p><strong>Employee:</strong> {selectedExpense.employeeName}</p>
              <p><strong>Department:</strong> {selectedExpense.department}</p>
              <p><strong>Amount:</strong> ${selectedExpense.amount}</p>
              <p><strong>Category:</strong> {selectedExpense.category}</p>
              <p><strong>Date:</strong> {selectedExpense.date}</p>
              <p><strong>Receipts:</strong> {selectedExpense.receipts}</p>
              <p><strong>AI Approval:</strong> {selectedExpense.aiApproved ? "Approved" : "Rejected"}</p>
              <Button className="mt-4" onClick={() => setSelectedExpense(null)}>Close</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
// "use client"

// import { useState, useEffect } from "react"
// import { useRouter } from "next/navigation"
// import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Badge } from "@/components/ui/badge"
// import { CheckCircle, XCircle, Search, Filter, ChevronDown, Receipt, Users } from "lucide-react"
// import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
// import { Toast, ToastAction } from "@/components/ui/toast"
// import { Skeleton } from "@/components/ui/skeleton"

// export default function Approvals() {
//   const router = useRouter()
//   const [selectedExpenses, setSelectedExpenses] = useState([])
//   const [expenses, setExpenses] = useState([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState(null)
//   const [viewMode, setViewMode] = useState('pending')
//   const [searchTerm, setSearchTerm] = useState('')
//   const [departmentFilter, setDepartmentFilter] = useState('all')
//   const [employeeData, setEmployeeData] = useState(null)

//   useEffect(() => {
//     const checkAuth = () => {
//       const data = localStorage.getItem('employeeData')
//       if (!data) {
//         router.push('/login')
//         return false
//       }
//       setEmployeeData(JSON.parse(data))
//       return true
//     }

//     if (checkAuth()) {
//       fetchExpenses()
//     }
//   }, [viewMode])

//   const fetchExpenses = async () => {
//     try {
//       setLoading(true)
//       setError(null)
      
//       const employeeData = JSON.parse(localStorage.getItem('employeeData'))
//       const endpoint = viewMode === 'pending' 
//         ? 'http://localhost:7000/expenses/pending'
//         : 'http://localhost:7000/expenses/subordinates'
        
//       const response = await fetch(endpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ employeeData })
//       })
      
//       if (!response.ok) {
//         if (response.status === 401) {
//           router.push('/login')
//           return
//         }
//         throw new Error(`HTTP error! status: ${response.status}`)
//       }
      
//       const data = await response.json()
      
//       const transformedExpenses = data.map(expense => ({
//         id: expense._id,
//         employeeName: expense.employeeId?.name || 'Unknown',
//         department: expense.department,
//         amount: expense.amount,
//         date: new Date(expense.date).toLocaleDateString(),
//         status: expense.status,
//         currentApprovalLevel: expense.currentApprovalLevel,
//         description: expense.description,
//         category: expense.category
//       }))

//       setExpenses(transformedExpenses)
//     } catch (err) {
//       console.error('Error fetching expenses:', err)
//       Toast({
//         title: "Error",
//         description: "Failed to load expenses. Please try again later.",
//         variant: "destructive"
//       })
//       setError('Failed to load expenses. Please try again later.')
//     } finally {
//       setLoading(false)
//     }
//   }

//   const filteredExpenses = expenses.filter(expense => {
//     const matchesSearch = 
//       expense.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       expense.category?.toLowerCase().includes(searchTerm.toLowerCase())
    
//     const matchesDepartment = 
//       departmentFilter === 'all' || 
//       expense.department === departmentFilter

//     return matchesSearch && matchesDepartment
//   })

//   const handleBatchApprove = async () => {
//     try {
//       const employeeData = JSON.parse(localStorage.getItem('employeeData'))
//       await Promise.all(
//         selectedExpenses.map(id => 
//           fetch(`http://localhost:7000/expenses/approve/${id}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ 
//               comments: 'Batch approved',
//               employeeData 
//             })
//           })
//         )
//       )
//       Toast({
//         title: "Success",
//         description: "Selected expenses have been approved",
//       })
//       fetchExpenses()
//       setSelectedExpenses([])
//     } catch (error) {
//       console.error('Error approving expenses:', error)
//       Toast({
//         title: "Error",
//         description: "Failed to approve expenses. Please try again.",
//         variant: "destructive"
//       })
//     }
//   }

//   const handleBatchReject = async () => {
//     try {
//       const employeeData = JSON.parse(localStorage.getItem('employeeData'))
//       await Promise.all(
//         selectedExpenses.map(id => 
//           fetch(`http://localhost:7000/expenses/reject/${id}`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ 
//               comments: 'Batch rejected',
//               employeeData 
//             })
//           })
//         )
//       )
//       Toast({
//         title: "Success",
//         description: "Selected expenses have been rejected",
//       })
//       fetchExpenses()
//       setSelectedExpenses([])
//     } catch (error) {
//       console.error('Error rejecting expenses:', error)
//       Toast({
//         title: "Error",
//         description: "Failed to reject expenses. Please try again.",
//         variant: "destructive"
//       })
//     }
//   }

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-6">
//         <div className="container mx-auto max-w-6xl space-y-6">
//           <div className="flex justify-between items-center">
//             <Skeleton className="h-10 w-48" />
//             <Skeleton className="h-10 w-32" />
//           </div>
//           {[1, 2, 3].map((i) => (
//             <Card key={i} className="w-full">
//               <CardHeader className="p-4">
//                 <Skeleton className="h-6 w-48" />
//                 <Skeleton className="h-4 w-32" />
//               </CardHeader>
//               <CardContent className="p-4">
//                 <Skeleton className="h-4 w-full" />
//               </CardContent>
//             </Card>
//           ))}
//         </div>
//       </div>
//     )
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-slate-50 p-6">
//         <Card className="max-w-md mx-auto">
//           <CardContent className="p-6 text-center">
//             <p className="text-red-500">{error}</p>
//             <Button 
//               className="mt-4" 
//               onClick={fetchExpenses}
//             >
//               Try Again
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     )
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-6">
//       <div className="container mx-auto max-w-6xl">
//         <div className="flex justify-between items-center mb-6">
//           <div>
//             <h1 className="text-3xl font-bold text-gray-900">Expense Approvals</h1>
//             <p className="text-muted-foreground">
//               {viewMode === 'pending' ? 'Review pending expenses' : 'View subordinate expenses'}
//             </p>
//           </div>
//           <div className="flex space-x-4">
//             <Button 
//               variant="outline" 
//               onClick={() => setViewMode(viewMode === 'pending' ? 'subordinates' : 'pending')}
//             >
//               <Users className="mr-2 h-4 w-4" />
//               {viewMode === 'pending' ? 'View Subordinate Expenses' : 'View Pending Approvals'}
//             </Button>
//             {selectedExpenses.length > 0 && (
//               <>
//                 <Button variant="outline" onClick={handleBatchReject}>
//                   <XCircle className="mr-2 h-4 w-4" />
//                   Reject Selected ({selectedExpenses.length})
//                 </Button>
//                 <Button onClick={handleBatchApprove}>
//                   <CheckCircle className="mr-2 h-4 w-4" />
//                   Approve Selected ({selectedExpenses.length})
//                 </Button>
//               </>
//             )}
//           </div>
//         </div>

//         <div className="flex justify-between items-center mb-6">
//           <div className="flex space-x-4 flex-1 max-w-md">
//             <div className="relative flex-1">
//               <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
//               <Input 
//                 placeholder="Search expenses..." 
//                 className="pl-9"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
//             <DropdownMenu>
//               <DropdownMenuTrigger asChild>
//                 <Button variant="outline">
//                   <Filter className="mr-2 h-4 w-4" />
//                   {departmentFilter === 'all' ? 'All Departments' : departmentFilter}
//                   <ChevronDown className="ml-2 h-4 w-4" />
//                 </Button>
//               </DropdownMenuTrigger>
//               <DropdownMenuContent>
//                 <DropdownMenuItem onClick={() => setDepartmentFilter('all')}>
//                   All Departments
//                 </DropdownMenuItem>
//                 {Array.from(new Set(expenses.map(e => e.department))).map(dept => (
//                   <DropdownMenuItem key={dept} onClick={() => setDepartmentFilter(dept)}>
//                     {dept}
//                   </DropdownMenuItem>
//                 ))}
//               </DropdownMenuContent>
//             </DropdownMenu>
//           </div>
//         </div>

//         <div className="space-y-4">
//           {filteredExpenses.length === 0 ? (
//             <Card className="p-6 text-center text-muted-foreground">
//               No expenses found
//             </Card>
//           ) : (
//             filteredExpenses.map((expense) => (
//               <Card key={expense.id} className="hover:bg-slate-50">
//                 <CardHeader className="flex flex-row justify-between items-center p-4">
//                   <div>
//                     <h2 className="text-lg font-semibold text-gray-900">
//                       {expense.category} - ${expense.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
//                     </h2>
//                     <CardDescription>
//                       {expense.employeeName} - {expense.department}
//                     </CardDescription>
//                   </div>
//                   <Badge variant="outline">
//                     {expense.currentApprovalLevel?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
//                   </Badge>
//                 </CardHeader>
//                 <CardContent className="p-4 flex justify-between items-center">
//                   <div>
//                     <p className="text-sm text-gray-500">Submitted: {expense.date}</p>
//                     <p className="text-sm text-gray-700 mt-1">{expense.description}</p>
//                   </div>
//                   <div className="flex items-center space-x-3">
//                     <input 
//                       type="checkbox" 
//                       checked={selectedExpenses.includes(expense.id)} 
//                       onChange={() => {
//                         setSelectedExpenses(prev => 
//                           prev.includes(expense.id) 
//                             ? prev.filter(id => id !== expense.id) 
//                             : [...prev, expense.id]
//                         )
//                       }}
//                       className="h-5 w-5 cursor-pointer"
//                     />
//                     <Button 
//                       variant="outline" 
//                       onClick={() => router.push(`/expenses/${expense.id}`)}
//                     >
//                       <Receipt className="mr-2 h-4 w-4" /> View Details
//                     </Button>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   )
// }