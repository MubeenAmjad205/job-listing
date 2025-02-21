'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

export interface StatusData {
  name: string;
  value: number;
}

interface ApplicationStatusChartProps {
  data: StatusData[];
  // Colors mapped to: [pending, approved, rejected]
  colors?: string[];
}

const ApplicationStatusChart: React.FC<ApplicationStatusChartProps> = ({
  data,
  colors = ['#FFBB28', '#00C49F', '#FF8042']
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return null;
  
  console.log("data from cahrt    ", data);
  
  return (
    <PieChart width={300} height={300}>
      <Pie 
        data={data} 
        dataKey="value" 
        nameKey="name" 
        cx="50%" 
        cy="50%" 
        innerRadius={50}
        outerRadius={80} 
        fill="#8884d8" 
        label
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default ApplicationStatusChart;
