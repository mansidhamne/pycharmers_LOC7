/* eslint-disable @typescript-eslint/no-explicit-any */
// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import axios from "axios"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Alert, AlertDescription } from "@/components/ui/alert"
// import Link from "next/link"

// export default function Register() {
//   const router = useRouter()
//   const [formData, setFormData] = useState({
//     employeeId: "",
//     email: "",
//     password: "",
//     company: "",
//   })
//   const [error, setError] = useState("")
//   const [success, setSuccess] = useState("")

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     try {
//       const response = await axios.post("http://localhost:3001/auth/register", formData)
//       setSuccess(response.data.message)
//       setTimeout(() => router.push("/login"), 3000)
//     } catch (error: any) {
//       setError(error.response?.data?.error || "An error occurred")
//     }
//   }

//   return (
//     <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
//       <div className="w-full max-w-md space-y-4">
//         <div className="flex justify-center mb-6">
//           <img
//             src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-k7l8OwXuw1W4Jg3WyMDSw1oH5oiV8i.png"
//             alt="Logo"
//             className="h-12 w-auto"
//           />
//         </div>

//         <Card>
//           <CardHeader className="space-y-1">
//             <CardTitle className="text-2xl text-center">Create an account</CardTitle>
//             <CardDescription className="text-center">Enter your details to register for an account</CardDescription>
//           </CardHeader>
//           <CardContent>
//             {error && (
//               <Alert variant="destructive" className="mb-4">
//                 <AlertDescription>{error}</AlertDescription>
//               </Alert>
//             )}
//             {success && (
//               <Alert className="mb-4">
//                 <AlertDescription>{success}</AlertDescription>
//               </Alert>
//             )}
//             <form onSubmit={handleSubmit} className="space-y-4">
//               <div className="space-y-2">
//                 <Label htmlFor="employeeId">Employee ID</Label>
//                 <Input
//                   id="employeeId"
//                   required
//                   value={formData.employeeId}
//                   onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="email">Work Email</Label>
//                 <Input
//                   id="email"
//                   type="email"
//                   placeholder="name@company.com"
//                   required
//                   value={formData.email}
//                   onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="password">Password</Label>
//                 <Input
//                   id="password"
//                   type="password"
//                   required
//                   value={formData.password}
//                   onChange={(e) => setFormData({ ...formData, password: e.target.value })}
//                 />
//               </div>
//               <div className="space-y-2">
//                 <Label htmlFor="company">Company Name</Label>
//                 <Input
//                   id="company"
//                   required
//                   value={formData.company}
//                   onChange={(e) => setFormData({ ...formData, company: e.target.value })}
//                 />
//               </div>
//               <Button type="submit" className="w-full">
//                 Create account
//               </Button>
//             </form>
//           </CardContent>
//           <CardFooter className="flex flex-col space-y-4">
//             <div className="text-sm text-center text-muted-foreground">
//               Already have an account?{" "}
//               <Link href="/login" className="text-primary hover:underline">
//                 Sign in
//               </Link>
//             </div>
//           </CardFooter>
//         </Card>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function Register() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    employeeId: "",
    email: "",
    password: "",
    company: "",
  })
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await axios.post("http://localhost:3001/auth/register", formData)
      setSuccess(response.data.message)
      setTimeout(() => router.push("/login"), 3000)
    } catch (error: any) {
      setError(error.response?.data?.error || "An error occurred")
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-blue-700">
      <div className="w-full max-w-md space-y-6">
          <div className="flex flex-col items-center space-y-2 mb-8">
            <h2 className="text-2xl font-semibold text-white">Enterprise Compliance Suite</h2>
            <p className="text-slate-300 text-center max-w-sm">
              Automated compliance checks, reimbursements, and data analytics for modern enterprises
            </p>
          </div>
        <Card className="border-0 shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-bold text-[#1a3247]">Create Account</CardTitle>
            <CardDescription>
              Get started with automated compliance and reimbursement management
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4">
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-sm font-medium">
                  Employee ID
                </Label>
                <Input
                  id="employeeId"
                  required
                  className="border-slate-200"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Work Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  required
                  className="border-slate-200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  className="border-slate-200"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="company" className="text-sm font-medium">
                  Company Name
                </Label>
                <Input
                  id="company"
                  required
                  className="border-slate-200"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-[#1a3247] hover:bg-[#2a4257] text-white"
              >
                Create account
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 border-t pt-6">
            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-[#1a3247] hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
