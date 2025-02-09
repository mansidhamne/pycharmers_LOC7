/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Camera, UploadCloud, X } from 'lucide-react'

interface Bill {
  id: string;
  filename: string;
  status: 'Pending' | 'Flagged' | 'Approved' | 'Rejected';
  description: string;
  date: string;
}

export default function UploadReceipt() {
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>();
  const [description, setDescription] = useState<string>("");
  const [summary, setSummary] = useState<any>(null);
  console.log(summary)
  useEffect(() => {
    fetch("http://localhost:3002/bills")
      .then((res) => res.json())
      .then((data) => setBills(data))
      .catch((error) => console.error("Error fetching bills:", error));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      
      // Create previews
      newFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
  
    const formData = new FormData();
    files.forEach(file => formData.append("file", file));
  
    try {
      // 1️⃣ Upload receipts to file server
      const uploadResponse = await fetch("http://localhost:3002/upload", {
        method: "POST",
        body: formData,
      });
  
      if (!uploadResponse.ok) throw new Error("File upload failed");
      const uploadedFiles = await uploadResponse.json(); // Assuming it returns file paths
      console.log(uploadedFiles)
      // 2️⃣ Perform tampering detection
      const tamperingResponse = await fetch("http://localhost:3002/detect_tampering", {
        method: "POST",
        body: formData,
      });
  
      if (!tamperingResponse.ok) throw new Error("Tampering check failed");
      const tamperingData = await tamperingResponse.json();
  
      // 3️⃣ Extract text using OCR
      let OCRdata = null;
      if (!tamperingData.tampered) {
        const ocrResponse = await fetch("http://localhost:3002/get_ocr", {
          method: "POST",
          body: formData,
        });
  
        if (!ocrResponse.ok) throw new Error("OCR failed");
        OCRdata = await ocrResponse.json();
      }
  
      // 4️⃣ Summarization API
      let summaryData = null;
      if (OCRdata) {
        const summaryResponse = await fetch("https://297e-35-247-172-164.ngrok-free.app/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bill_text: OCRdata.text }),
        });
  
        if (!summaryResponse.ok) throw new Error("Summarization failed");
        summaryData = await summaryResponse.json();
        console.log(summaryData)
        // summaryData=JSON.parse(summaryData)
        // alert(summaryData["summary"])
        setSummary(summaryData);
      }

      await fetch("http://localhost:7000/save_summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(summaryData),
      });

      setPreviews([])
      setFiles([]);
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  

  // const notifyUser = (billName: string, reason: string, description: string) => {
  //   // Assuming `NotifyUserInfo` is a notification component
  //   return (
  //     <NotifyUserInfo
  //       flaggedBy="Internal Check"
  //       reason={reason}
  //       billName={billName}
  //       description={description}
  //       username='Akshay'
  //     />
  //   );
  // };
  
  const handleCameraCapture = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();
    
    const canvas = document.createElement("canvas");
    document.body.appendChild(video);
    
    setTimeout(() => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/png");
      setPreviews(prev => [...prev, dataUrl]);
      stream.getTracks().forEach(track => track.stop());
      document.body.removeChild(video);
    }, 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-12">
      <div className="container mx-auto max-w-7xl">
        <div className="flex flex-row gap-8">
          <div className='w-1/2'>
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-700 text-2xl">Upload Expense Receipt</CardTitle>
                  <CardDescription className="text-md">
                    Upload your receipt and fill in the expense details
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpload} className="space-y-6">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <UploadCloud className="h-8 w-8 text-muted-foreground" />
                          <div className="text-center">
                            <p className="text-sm text-muted-foreground">
                              Drag and drop your receipt here, or{' '}
                              <label className="text-primary hover:underline cursor-pointer">
                                browse
                                <Input
                                  type="file"
                                  className="hidden"
                                  accept="image/*"
                                  multiple
                                  onChange={handleFileChange}
                                />
                              </label>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Supports: JPG, PNG, PDF up to 10MB
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              OR
                            </p>
                          </div>
                          <Button onClick={handleCameraCapture} variant="outline" className="mt-2">
                            <Camera className="mr-2" /> Take Photo
                          </Button>
                        </div>
                      </div>

                      {previews.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          {previews.map((preview, index) => (
                            <div key={index} className="relative">
                              <img
                                src={preview || "/placeholder.svg"}
                                alt={`Receipt ${index + 1}`}
                                className="w-full h-40 object-cover rounded-lg"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute -top-2 -right-2 h-6 w-6"
                                onClick={() => removeFile(index)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="description" className="text-md">Description</Label>
                        <Textarea
                          id="description"
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          placeholder="Enter expense description"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex justify-end space-x-4">
                      <Button variant="outline" onClick={() => router.back()} className= "border-blue-200 ">
                        Cancel
                      </Button>
                      <Button type="submit" disabled={loading} className="bg-blue-700 text-white text-md">
                        {loading ? 'Submitting...' : 'Submit Expense'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          <div className="w-1/2 min-h-[500px]">
            <Card className="">
              <CardHeader>
                <CardTitle className="text-blue-700 text-2xl">Submitted Bills</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-100 p-2">Filename</th>
                      <th className="border border-gray-100 p-2">Date</th>
                      <th className="border border-gray-100 p-2">Description</th>
                      <th className="border border-gray-100 p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bills && bills.length > 0 ? (
                      bills.map((bill, index) => (
                        <tr key={index} className="text-center">
                          <td className="border border-gray-100 p-2">{bill.filename}</td>
                          <td className="border border-gray-100 p-2">{bill.date}</td>
                          <td className="border border-gray-100 p-2">{bill.description}</td>
                          <td className={`border border-gray-100 p-2 ${bill.status === "Approved" ? "text-green-600" : bill.status === "Flagged" ? "text-yellow-600" : bill.status === "Rejected" ? "text-red-500" : "bg-gray-300 rounded px-8 text-gray-600"}`}>
                            {bill.status}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr key="no-bills">
                        <td colSpan={3} className="p-4 text-gray-500">No bills submitted yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
