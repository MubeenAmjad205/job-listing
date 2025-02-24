'use client';

import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import axios from 'axios';

type Application = {
  id: string;
  userName: string;
  jobTitle: string;
  resume: string;
  status: 'pending' | 'approved' | 'rejected';
  analysis?: {
    similarityScore: number;
    suggestions: string[];
  };
};

export default function ApplicationPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Mock API calls
  const fetchApplication = async () => {
    const response = await fetch(`/api/applications/${id}`);
    if (!response.ok) throw new Error('Failed to fetch application');
    return response.json();
  };

  const analyzeApplication = async () => {
    setIsAnalyzing(true);
    const response = await axios.get(`/api/applications/analyze/${id}`, {
 withCredentials: true,
    });
    if (!response) throw new Error('Analysis failed');
    console.log('Analysis complete',"     "+response.data);
    
    setIsAnalyzing(false);
    return response.data;
  };

  // Query and mutation
  const { data, isLoading, error } = useQuery<Application>({
    queryKey: ['application', id],
    queryFn: fetchApplication,
  });

  const mutation = useMutation({
    mutationFn: analyzeApplication,
    onSuccess: () => {
      queryClient.invalidateQueries<any>(['application', id]);
    },
  });

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-2xl p-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
            <div className="h-10 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-2xl p-8">
          <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
            Error: {(error as Error).message}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-2xl p-8">
        <div className="flex flex-col gap-6">
          {/* Header Section */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {data?.userName || 'Unknown Applicant'}
              </h1>
              <p className="text-lg text-gray-600 mt-1">
                {data?.jobTitle || 'No job title provided'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              data?.status === 'approved' 
                ? 'bg-green-100 text-green-800' 
                : data?.status === 'rejected' 
                ? 'bg-red-100 text-red-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {data?.status || 'pending'}
            </div>
          </div>

          {/* Resume Section */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h2 className="text-lg font-semibold mb-2">Resume</h2>
            <a
              href={data?.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              View PDF Resume
            </a>
          </div>

          {/* Analysis Section */}
          {data?.analysis ? (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 text-blue-800 rounded-lg border border-blue-200">
                <p className="font-medium">
                  AI Match Score: {data.analysis.similarityScore.toFixed(2)}
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200">
                <h3 className="text-xl font-semibold mb-4">AI Suggestions</h3>
                <ul className="list-disc pl-6 space-y-3">
                  {data.analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-gray-700">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4 mt-6">
              <button
                onClick={() => mutation.mutate()}
                disabled={isAnalyzing}
                className={`w-full max-w-xs px-6 py-3 rounded-lg font-medium transition-colors ${
                  isAnalyzing
                    ? 'bg-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {isAnalyzing ? 'Analyzing...' : 'Run AI Analysis'}
              </button>
              <p className="text-sm text-gray-500 text-center">
                This may take a few seconds
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}