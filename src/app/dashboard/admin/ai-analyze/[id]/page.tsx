'use client';


import AnalysisDashboard from "@/components/ApplicationAnalysis";
import { useEffect, useState } from "react";
import{ Loader} from "@/components/Loader";

// Re-use the same TechLoader component for consistency

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
    return <Loader/>;
  }

  return (
    <div className="mx-auto">
      <AnalysisDashboard applicationId={applicationId} />
    </div>
  );
}
