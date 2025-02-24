'use client'

import AnalysisDashboard from "@/components/ApplicationAnalysis";
import ApplicationAnalysis from "@/components/ApplicationAnalysis";
import { useEffect, useState } from "react";

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
    return <div>Loading...</div>;
  }

  return (
    <div className=" mx-auto mt-6">
      <h1 className="text-2xl font-bold">Application Analysis</h1>
      <AnalysisDashboard applicationId={applicationId} />
    </div>
  );
}
