'use client';

import AnalysisDashboard from "@/components/ApplicationAnalysis";
import { useEffect, useState } from "react";

// Re-use the same TechLoader component for consistency
const TechLoader: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
    <svg width="100" height="100" viewBox="0 0 100 100" className="animate-pulse">
      <defs>
        <linearGradient id="techGradientPage" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#93c5fd" />
        </linearGradient>
      </defs>
      <rect x="10" y="40" width="80" height="20" fill="url(#techGradientPage)">
        <animate attributeName="x" from="10" to="30" dur="1s" repeatCount="indefinite" />
      </rect>
      <circle cx="50" cy="50" r="10" fill="#2563eb">
        <animate attributeName="r" from="10" to="15" dur="0.5s" repeatCount="indefinite" />
      </circle>
    </svg>
    <p className="mt-4 text-xl text-gray-600 animate-pulse">AI is analyzing...</p>
  </div>
);

export default function ApplicationPage({ params }: { params: Promise<{ id: string }> }) {
  const [applicationId, setApplicationId] = useState<number | null>(null);

  useEffect(() => {
    const fetchParams = async () => {
      const { id } = await params;
      setApplicationId(parseInt(id, 10));
    };

    fetchParams();
  }, [params]);

  if (applicationId === null) { 
    return <TechLoader />;
  }

  return (
    <div className="mx-auto mt-6">
      <AnalysisDashboard applicationId={applicationId} />
    </div>
  );
}
