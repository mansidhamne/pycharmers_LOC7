'use client'

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, RefreshCcw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import DepartmentStatsVisualization from './data_visual';

const AuditReports = () => {
  const [period, setPeriod] = useState('yearly');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchAuditReport = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:7000/audit/${period}`);
      setReportData(response.data.data);
    } catch (error) {
      console.error('Error fetching audit report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditReport();
  }, [period]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Audit Report', 10, 10);

    if (reportData) {
      Object.entries(reportData).forEach(([key, data], index) => {
        doc.text(`${key} Report`, 10, 20 + index * 30);
        autoTable(doc, {
          startY: 25 + index * 30,
          head: [['Category', 'Amount']],
          body: Object.entries(data.categories).map(([category, amount]) => [
            category,
            `$${amount}`
          ])
        });
      });
    }
    doc.save(`audit_report_${period}.pdf`);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Audit Reports Dashboard</CardTitle>
              <CardDescription>
                View and analyze financial audit reports across different time periods
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <Select value={period} onValueChange={setPeriod}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="half-yearly">Half-Yearly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
              <Button
                onClick={generatePDF}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          ) : reportData ? (
            <Tabs defaultValue={Object.keys(reportData)[0]} className="w-full">
              <TabsList className="w-full justify-start">
                {Object.keys(reportData).map((key) => (
                  <TabsTrigger key={key} value={key}>
                    {key}
                  </TabsTrigger>
                ))}
              </TabsList>
              {Object.entries(reportData).map(([key, data]) => (
                <TabsContent key={key} value={key}>
                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Summary</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          Total Expenses: ${data.total.toLocaleString()}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle>Category Breakdown</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Category</TableHead>
                              <TableHead className="text-right">Amount</TableHead>
                              <TableHead className="text-right">% of Total</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(data.categories).map(([category, amount]) => (
                              <TableRow key={category}>
                                <TableCell className="font-medium">{category}</TableCell>
                                <TableCell className="text-right">
                                  ${amount.toLocaleString()}
                                </TableCell>
                                <TableCell className="text-right">
                                  {((amount / data.total) * 100).toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          ) : (
            <Alert>
              <AlertDescription>
                No report data available. Please try again later.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Department Statistics</CardTitle>
          <CardDescription>Visualize department-wise performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <DepartmentStatsVisualization />
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditReports;