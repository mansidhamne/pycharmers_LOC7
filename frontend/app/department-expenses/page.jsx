'use client'
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import HeirarchyFlow from "./HeirarchyFlow";
import { useRouter, useSearchParams } from 'next/navigation';

const Dashboard = () => {
  const router = useRouter();
  const [employeeData, setEmployeeData] = useState(null);
  const [stats, setStats] = useState(null);

  // Move localStorage logic into useEffect
  useEffect(() => {
    const edata = localStorage.getItem('employeeData');
    console.log("Stored Employee Data:", edata); // Debugging
    if (edata) {
      const parsedData = JSON.stringify(edata);
      setEmployeeData(parsedData);
    }
  }, []); // Empty dependency array means this runs once on mount
console.log("Employee Data:", employeeData); // Debugging
  // Fetch stats when employeeData changes
  useEffect(() => {
    if (employeeData?.role && employeeData?.department) {
      const response =fetch(`http://localhost:3001/department-stats?role=${employeeData.role}&department=${employeeData.department}`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(err => console.error("Error fetching stats:", err));
    }
  }, [employeeData]); // Dependency on employeeData


  return (
    <div className="grid grid-cols-2 gap-6 p-4">
      {stats ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Total Employees</CardTitle>
            </CardHeader>
            <CardContent>{stats.totalEmployees}</CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Role Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {Object.entries(stats.roleBreakdown).map(([role, count]) => (
                <div key={role}>{role}: {count}</div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Reimbursement Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Total: {stats.reimbursementStats.totalRequests}</p>
              <p>Pending: {stats.reimbursementStats.pending}</p>
              <p>Approved: {stats.reimbursementStats.approved}</p>
              <p>Rejected: {stats.reimbursementStats.rejected}</p>
              <p>Flagged: {stats.reimbursementStats.flagged}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Fraud Risk</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.reimbursementStats.fraudRisk.length > 0 ? (
                stats.reimbursementStats.fraudRisk.map((risk, index) => (
                  <div key={index}>{risk.employee}: {risk.fraudProbability}%</div>
                ))
              ) : (
                <p>No high-risk claims.</p>
              )}
            </CardContent>
          </Card>

          <HeirarchyFlow />
        </>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Dashboard;