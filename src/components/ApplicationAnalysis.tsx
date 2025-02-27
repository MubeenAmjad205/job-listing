'use client';

import React from 'react';
import axios from 'axios';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { 
  FaStar, FaCheckCircle, FaCode, FaTimesCircle, 
  FaUser, FaBriefcase, FaCheck, FaTimes, FaBolt 
} from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'react-toastify';
import { Loader } from './Loader';

interface AnalysisData {
  id: string;
  applicantName: string;
  jobTitle: string;
  currentStatus: 'pending' | 'approved' | 'rejected';
  suggestion: string;
  stats: {
    matchScore: number;
    keySkills: string[];
    experienceSummary: string;
  };
}

interface StatsCardProps {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ icon, title, children }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow h-full">
    <h3 className="flex items-center gap-2 text-lg font-semibold mb-3 text-gray-700">
      {icon}
      {title}
    </h3>
    <div className="text-gray-600">{children}</div>
  </div>
);

const prepareChartData = (score: number) => [
  { name: 'Match', value: score },
  { name: 'Remaining', value: 100 - score },
];

const CHART_COLORS = ['#2563eb', '#e2e8f0'];

// Helper function to parse JSON or extract JSON wrapped in markdown code fences
const parseJSONContent = (content: string): AnalysisData => {
  try {
    return JSON.parse(content);
  } catch {
    const markdownRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = content.match(markdownRegex);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    } else {
      throw new Error('Content is not valid JSON or markdown-wrapped JSON.');
    }
  }
};

// Fetch function that uses robust logic from the first snippet
const fetchAnalysis = async (applicationId: string): Promise<AnalysisData> => {
  if (!applicationId || applicationId === 'undefined') {
    throw new Error('Invalid application ID');
  }
  const { data } = await axios.get(`/api/analyze/${applicationId}`);
  
  if (data && data.suggestion && data.suggestion.kwargs && data.suggestion.kwargs.content) {
    console.log('Analysis data:', data.suggestion.kwargs.content);
    const jsonData = parseJSONContent(data.suggestion.kwargs.content);
    
    return {
      ...jsonData,
      applicantName: data.user.name,
      jobTitle: data.job.title,
      currentStatus: data?.application?.status,
    };
  } else {
    throw new Error('Invalid API response structure.');
  }
};



const AnalysisDashboard: React.FC<{ applicationId: any }> = ({ applicationId }) => {
  const queryClient = useQueryClient();
  const isValidId = !!applicationId && applicationId !== 'undefined';

  // Data fetching using react-query
  const { data, error, isLoading } = useQuery<AnalysisData>({
    queryKey: ['analysis', applicationId],
    queryFn: () => fetchAnalysis(applicationId),
    enabled: isValidId,
    retry: false,
  });

  // Updated mutation using new object syntax for updating application status
  const updateApplication = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: 'approved' | 'rejected' }) => {
      await axios.put(`/api/applications/${id}`, { status });
    },
    onSuccess: () => {
      toast.success('Application updated', { hideProgressBar: true });
      queryClient.invalidateQueries({ queryKey: ['analysis', applicationId] });
    },
    onError: () => {
      toast.error('Failed to update application', { hideProgressBar: true });
    },
  });

  // Status badge styling
  const statusStyles = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
    return <Loader />;
  }

  if (error || !isValidId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-8">
        <p className="text-lg text-red-600">
          Error: {(error as Error)?.message || 'Invalid application ID'}
        </p>
      </div>
    );
  }
  // console.log(data);

  const { 
    applicantName = 'Applicant Name',
    jobTitle = 'Job Title',
    currentStatus = 'pending',
    suggestion = 'No recommendation available',
    stats = {
      matchScore: 0,
      keySkills: [],
      experienceSummary: 'No experience summary',
    },
  } = data || {};

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto bg-white backdrop-blur-md rounded-2xl shadow-xl p-6 md:p-10">
        {/* Header Section */}
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="inline-flex items-center gap-3 text-3xl font-bold text-gray-900">
              <FaUser className="text-blue-500 w-6 h-6" />
              {applicantName}
            </h1>
            <div className="mt-2 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 text-lg text-gray-600">
                <FaBriefcase className="w-4 h-4" />
                {jobTitle}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusStyles[currentStatus]}`}>
                {currentStatus}
              </span>
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => updateApplication.mutate({ id: applicationId, status: 'approved' })}
              disabled={updateApplication.isPending || currentStatus === 'approved'}
              className="flex items-center gap-2 px-2  py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <FaCheck />
              {currentStatus === 'approved' ? 'Approved' : 'Approve'}
            </button>
            <button
              onClick={() => updateApplication.mutate({ id: applicationId, status: 'rejected' })}
              disabled={updateApplication.isPending || currentStatus === 'rejected'}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              <FaTimes />
              {currentStatus === 'rejected' ? 'Rejected' : 'Reject'}
            </button>
          </div>
        </header>

        {/* Recommendation Section */}
        <section className="mb-10">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4 text-gray-800">
            <FaCheckCircle className="text-green-600 w-5 h-5" />
            Hiring Recommendation
          </h2>
          <div className="p-5 bg-indigo-50 rounded-lg shadow-inner border border-indigo-100">
            <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
              {suggestion}
            </p>
          </div>
        </section>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Match Score Card with Pie Chart */}
          <StatsCard
            icon={<FaCode className="text-blue-600 w-5 h-5" />}
            title="Match Score"
          >
            <div className="relative  h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={prepareChartData(stats.matchScore)}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                  >
                    {prepareChartData(stats.matchScore)?.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={CHART_COLORS[index % CHART_COLORS.length]}
                      />
                    ))}
                          {/* <Legend /> */}
                    
                  </Pie>
                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="text-2xl font-bold text-blue-800"
                    >
                    {stats.matchScore}%
                  </text>
                    <Tooltip/>
                  
                </PieChart>
              </ResponsiveContainer>
            </div>
          </StatsCard>

          {/* Key Skills Card */}
          <StatsCard
            icon={<FaCheckCircle className="text-green-600 w-5 h-5" />}
            title="Key Skills"
          >
            <ul className="space-y-2">
              {stats.keySkills.length === 0 ? (
                <li className="text-gray-500">No relevant skills information provided.</li>):
                (
                  <>
              {stats?.keySkills.map((skill, index) => (
                <li key={index} className="flex items-center">
                  <span className="w-2 h-2 bg-green-600 rounded-full mr-2" />
                  {skill}
                </li>
              ))}
              </>
              )}
            </ul>
          </StatsCard>

          {/* Experience Summary Card */}
          <StatsCard
            icon={<FaTimesCircle className="text-purple-600 w-5 h-5" />}
            title="Experience Summary"
          >
            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {stats.experienceSummary}
            </p>
          </StatsCard>
        </section>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
