'use client';

import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Tooltip, Legend, Cell } from 'recharts';

export interface CategoryData {
  category: string;
  count: number;
}

interface JobsByCategoryDonutChartProps {
  data: CategoryData[];
  colors?: string[];
}

const JobsByCategoryDonutChart: React.FC<JobsByCategoryDonutChartProps> = ({
  data,
  colors = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#00C49F'],
}) => {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) return <p>Loading...</p>;
  
  return (
    <PieChart width={300} height={300}>
      <Pie
        data={data}
        dataKey="count"
        nameKey="category"
        cx="50%"
        cy="50%"
        innerRadius={50} // inner radius creates a donut effect
        outerRadius={80}
        fill="#8884d8"
        label
      >
        {data?.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
        ))}
      </Pie>
      <Tooltip />
      {/* <Legend  /> */}
    </PieChart>
  );
};

export default JobsByCategoryDonutChart;
