'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardContent,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CheckCircle, XCircle, FileText, AlertTriangle, Shield } from 'lucide-react';

const AIScoreBadge = ({ score }) => {
  const getColor = () => {
    if (score < 30) return 'bg-green-100 text-green-700';
    if (score < 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  const getIcon = () => {
    if (score < 30) return <Shield className="h-4 w-4 mr-1" />;
    if (score < 70) return <AlertTriangle className="h-4 w-4 mr-1" />;
    return <XCircle className="h-4 w-4 mr-1" />;
  };

  return (
    <div className={`flex items-center px-2 py-1 rounded-full ${getColor()}`}>
      {getIcon()}
      <span className="text-sm font-medium">AI Score: {score}</span>
    </div>
  );
};

const ReimbursementCard = ({ reimbursement, onView, onApprove, onReject, showActions = true }) => (
  <div className="flex items-center justify-between p-4 border-b last:border-b-0">
    <div className="space-y-2">
      <p className="font-medium">{reimbursement.employee.email}</p>
      <p className="text-sm text-muted-foreground">
        {reimbursement.category} - ${reimbursement.amount.toFixed(2)}
      </p>
      <p className="text-xs text-muted-foreground">
        Submitted: {new Date(reimbursement.dateSubmitted).toLocaleDateString()}
      </p>
      <AIScoreBadge score={reimbursement.aiAnalysis.fraudProbability} />
    </div>
    <div className="flex items-center space-x-4">
      <Button variant="outline" onClick={onView}>
        <FileText className="h-4 w-4 mr-2" /> View Details
      </Button>
      {showActions && (
        <>
          <Button 
            variant="outline" 
            className="bg-green-50 hover:bg-green-100 text-green-600"
            onClick={onApprove}
          >
            <CheckCircle className="h-4 w-4 mr-2" /> Approve
          </Button>
          <Button 
            variant="outline" 
            className="bg-red-50 hover:bg-red-100 text-red-600"
            onClick={onReject}
          >
            <XCircle className="h-4 w-4 mr-2" /> Reject
          </Button>
        </>
      )}
    </div>
  </div>
);

const ReimbursementDetails = ({ reimbursement }) => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 gap-4">
      <div>
        <strong>Employee:</strong> {reimbursement.employee.email}
      </div>
      <div>
        <strong>Amount:</strong> ${reimbursement.amount.toFixed(2)}
      </div>
      <div>
        <strong>Category:</strong> {reimbursement.category}
      </div>
      <div>
        <strong>Date Submitted:</strong> {new Date(reimbursement.dateSubmitted).toLocaleDateString()}
      </div>
    </div>
    <div>
      <strong>Description:</strong>
      <p className="mt-1">{reimbursement.description}</p>
    </div>
    <div>
      <strong>AI Analysis</strong>
      <div className="mt-1 p-4 bg-slate-50 rounded-md">
        <div className="text-amber-600">
          Fraud Probability: {reimbursement.aiAnalysis.fraudProbability}%
        </div>
        {reimbursement.aiAnalysis.anomalies.length > 0 && (
          <div className="mt-2">
            <div className="font-medium">Detected Anomalies:</div>
            <ul className="list-disc list-inside">
              {reimbursement.aiAnalysis.anomalies.map((anomaly, index) => (
                <li key={index} className="text-sm text-gray-600">{anomaly}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
    <div>
      <strong>Receipts:</strong>
      <div className="mt-2 grid grid-cols-3 gap-4">
        {reimbursement.receipts.map((receipt, index) => (
          <img 
            key={index} 
            src={receipt} 
            alt={`Receipt ${index + 1}`} 
            className="w-full h-32 object-cover rounded-md border"
          />
        ))}
      </div>
    </div>
  </div>
);

export default function ApprovalPage() {
  const router = useRouter();
  const [employeeData, setEmployeeData] = useState(null);
  const [pendingReimbursements, setPendingReimbursements] = useState([]);
  const [approvedReimbursements, setApprovedReimbursements] = useState([]);
  const [rejectedReimbursements, setRejectedReimbursements] = useState([]);
  const [selectedReimbursement, setSelectedReimbursement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');

  const fetchReimbursements = async (status) => {
    try {
      const edata = localStorage.getItem('employeeData');
      console.log("Raw employeeData from localStorage:", edata);

      if (!edata) {
        throw new Error("No employee data found in localStorage");
      }

      let parsedData;
      try {
        parsedData = JSON.parse(edata);
        setEmployeeData(parsedData);
      } catch (error) {
        console.error("Error parsing employeeData:", error);
        throw new Error("Invalid employeeData format");
      }

      console.log("Parsed employeeData:", parsedData);
      console.log("Role:", parsedData.role);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error("No token found in localStorage");
      }

      const queryParams = new URLSearchParams({
        status,
        role: parsedData.role,
        department: parsedData.department,
      });

      const response = await fetch(`http://localhost:3001/reimbursement?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch reimbursements');
      }

      const data = await response.json();
      if (status === 'pending') setPendingReimbursements(data);
      else if (status === 'approved') setApprovedReimbursements(data);
      else if (status === 'rejected') setRejectedReimbursements(data);
    } catch (error) {
      toast.error(`Error fetching ${status} reimbursements`);
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
};

  useEffect(() => {
    const data = localStorage.getItem('employeeData');
    setEmployeeData(JSON.parse(data));
    setIsLoading(true); // Set isLoading to true before fetching
    fetchReimbursements(activeTab);
  }, [activeTab]);
  

  const handleDecision = async (id, decision) => {
    if (decision === "rejected") {
      const reason = prompt("Please provide a reason for rejection:");
      if (!reason) {
        toast.error("Rejection reason is required.");
        return;
      }
  
      await processDecision(id, decision, reason);
      toast.success("Thank you for your feedback. This will be valuable for future analysis.");
    } else {
      await processDecision(id, decision, "Approved by manager");
    }
  };
  
  const processDecision = async (id, decision, reason) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("token");
  
      const response = await fetch(`http://localhost:3001/reimbursement/${id}/decision`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ decision, reason }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to process decision");
      }
  
      fetchReimbursements("pending");
      fetchReimbursements("approved");
      fetchReimbursements("rejected");
      setSelectedReimbursement(null);
    } catch (error) {
      toast.error(`Error ${decision} reimbursement`);
      console.error("Error:", error);
    } finally {
      setIsLoading(false);
    }
  };
  

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <ToastContainer position="top-right" autoClose={3000} />
      <div className="container mx-auto">
        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full max-w-md mb-6">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="rejected">Rejected</TabsTrigger>
          </TabsList>
          <TabsContent value="pending">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reimbursements</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : pendingReimbursements.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No pending reimbursements
                  </div>
                ) : (
                  pendingReimbursements.map(reimbursement => (
                    <ReimbursementCard
                      key={reimbursement._id}
                      reimbursement={reimbursement}
                      onView={() => setSelectedReimbursement(reimbursement)}
                      onApprove={() => handleDecision(reimbursement._id, 'approved')}
                      onReject={() => handleDecision(reimbursement._id, 'rejected')}
                      showActions={true}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="approved">
            <Card>
              <CardHeader>
                <CardTitle>Approved Reimbursements</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : approvedReimbursements.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No approved reimbursements
                  </div>
                ) : (
                  approvedReimbursements.map(reimbursement => (
                    <ReimbursementCard
                      key={reimbursement._id}
                      reimbursement={reimbursement}
                      onView={() => setSelectedReimbursement(reimbursement)}
                      showActions={false}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="rejected">
            <Card>
              <CardHeader>
                <CardTitle>Rejected Reimbursements</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : rejectedReimbursements.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No rejected reimbursements
                  </div>
                ) : (
                  rejectedReimbursements.map(reimbursement => (
                    <ReimbursementCard
                      key={reimbursement._id}
                      reimbursement={reimbursement}
                      onView={() => setSelectedReimbursement(reimbursement)}
                      showActions={false}
                    />
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Dialog 
          open={!!selectedReimbursement} 
          onOpenChange={(open) => !open && setSelectedReimbursement(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Reimbursement Details</DialogTitle>
            </DialogHeader>
            {selectedReimbursement && (
              <ReimbursementDetails reimbursement={selectedReimbursement} />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
