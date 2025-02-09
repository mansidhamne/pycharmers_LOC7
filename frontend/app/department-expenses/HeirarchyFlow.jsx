'use client'
import React, { useEffect, useState } from 'react';
import ReactFlow, { Controls } from 'reactflow';
import 'reactflow/dist/style.css';

const HierarchyTree = () => {
      const router = useRouter();
  const [nodes, setNodes] = useState([]);
  const [employeeData, setEmployeeData] = useState(null);
  useEffect(() => {
    const edata = localStorage.getItem('employeeData');
    console.log("Stored Employee Data:", edata); // Debugging
    if (edata) {
      const parsedData = JSON.parse(edata);
      setEmployeeData(parsedData);
    }
  }, []); // Empty dependency array means this runs once on mount
console.log("Employee Data:", employeeData); // Debugging
  // Fetch stats when employeeData changes
  useEffect(() => {
    fetch(`http://localhost:7000/subordinates?role=${employeeData.role}&department=${employeeData.department}`, )
      .then(res => res.json())
      .then(data => {
        const formattedNodes = data.map((emp, index) => ({
          id: emp.employeeId,
          data: { label: `${emp.role} - ${emp.employeeId}` },
          position: { x: index * 200, y: emp.role === 'employee' ? 200 : 100 }
        }));
        setNodes([{ id: 'root', data: { label: 'You' }, position: { x: 200, y: 0 } }, ...formattedNodes]);
      });
  }, []);

  return (
    <div style={{ height: 400, width: '100%' }}>
      <ReactFlow nodes={nodes}>
        <Controls />
      </ReactFlow>
    </div>
  );
};

export default HierarchyTree;
