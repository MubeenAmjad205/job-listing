'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Job } from '@/types';

const fetchJobs = async (): Promise<Job[]> => {
  const response = await axios.get('/api/jobs');
  return response.data;
};

const JobListingPage = () => {
  const { data, isLoading, error } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  if (error) {
    return <div className="text-center py-8 text-red-500">Error loading jobs.</div>;
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Job Listings</h1>
        <div className="grid grid-cols-1 gap-6">
          {data?.map(job => (
            <div
              key={job.id}
              className="p-6 bg-white rounded-xl shadow-md flex justify-between items-center border border-gray-200 hover:shadow-xl transition-shadow duration-300"
            >
              <div>
                <h2 className="text-2xl font-semibold text-gray-800">{job.title}</h2>
                {job.description && (
                  <p className="text-gray-600 mt-2">{job.description}</p>
                )}
              </div>
              <Link href={`/jobs/${job.id}/apply`}>
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition">
                  Apply
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobListingPage;
