'use client';

import React from 'react';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';
import { FaStar, FaCheckCircle, FaCode, FaTimesCircle } from 'react-icons/fa';

// Helper function to parse JSON from markdown or plain text
const parseJSONContent = (content) => {
  try {
    // Attempt to parse as plain JSON
    return JSON.parse(content);
  } catch {
    // If parsing fails, try to extract JSON from markdown code fences
    const markdownRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = content.match(markdownRegex);
    if (match && match[1]) {
      return JSON.parse(match[1]);
    } else {
      throw new Error('Content is not valid JSON or markdown-wrapped JSON.');
    }
  }
};

// Fetch function using Axios
const fetchAnalysis = async (applicationId) => {
  const { data } = await axios.get(`/api/analyze/${applicationId}`);
  if (data && data.suggestion && data.suggestion.kwargs && data.suggestion.kwargs.content) {
    console.log('Analysis data:', data.suggestion.kwargs.content);
    
    return parseJSONContent(data.suggestion.kwargs.content);
  } else {
    throw new Error('Invalid API response structure.');
  }
};

const AnalysisDashboard = ({ applicationId }) => {
  const { data, error, isLoading } = useQuery({
    queryKey: ['analysis', applicationId],
    queryFn: () => fetchAnalysis(applicationId),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <p className="text-xl text-gray-700">Loading analysis...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <p className="text-xl text-red-600">Error: {error.message}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-8">
        <p className="text-xl text-gray-700">No analysis data available.</p>
      </div>
    );
  }

  const { suggestion, stats } = data;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-2xl p-8">
        <h1 className="flex items-center justify-center gap-2 text-4xl font-extrabold text-center text-gray-900 mb-8">
          <FaStar className="text-yellow-500" />
          Candidate Analysis
        </h1>
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
            <FaCheckCircle className="text-green-500" />
            Suggestion
          </h2>
          <div className="p-4 bg-blue-50 rounded-lg shadow-md">
            <p className="text-gray-800 whitespace-pre-wrap">{suggestion}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-green-50 p-6 rounded-xl shadow-lg">
            <h3 className="flex items-center gap-1 text-xl font-bold mb-2">
              <FaCode className="text-green-700" />
              Match Score
            </h3>
            <p className="text-2xl text-gray-800">{stats.matchScore}</p>
          </div>
          <div className="bg-yellow-50 p-6 rounded-xl shadow-lg">
            <h3 className="flex items-center gap-1 text-xl font-bold mb-2">
              <FaCheckCircle className="text-yellow-700" />
              Key Skills
            </h3>
            <ul className="list-disc list-inside text-gray-700">
              {stats.keySkills.map((skill, index) => (
                <li key={index}>{skill}</li>
              ))}
            </ul>
          </div>
          <div className="bg-purple-50 p-6 rounded-xl shadow-lg">
            <h3 className="flex items-center gap-1 text-xl font-bold mb-2">
              <FaTimesCircle className="text-purple-700" />
              Experience Summary
            </h3>
            <p className="text-gray-700 whitespace-pre-wrap">
              {stats.experienceSummary}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalysisDashboard;
