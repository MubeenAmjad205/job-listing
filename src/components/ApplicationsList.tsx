// components/ApplicationsList.tsx
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import ApplicationItem from './ApplicationItem';
import { Application } from '@/types';

const fetchApplications = async (): Promise<Application[]> => {
  // Replace with your actual API endpoint that returns the user's applications
  const response = await axios.get('/api/user/applications');
  return response.data;
};

const ApplicationsList = () => {
  const { data, error, isLoading } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: fetchApplications,
  });

  if (isLoading) {
    return <div className="text-center text-gray-600">Loading applications...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500">Failed to load applications.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Applications</h2>
      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((app) => (
            <ApplicationItem key={app.id} application={app} />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">
          You have not applied for any jobs yet.
        </div>
      )}
    </div>
  );
};

export default ApplicationsList;
