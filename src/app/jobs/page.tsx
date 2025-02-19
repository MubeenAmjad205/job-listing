// src/pages/jobs/index.tsx

'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Job } from '@/types';
import { FiChevronRight } from 'react-icons/fi';

const fetchJobs = async (): Promise<Job[]> => {
  const { data } = await axios.get<Job[]>('/api/jobs');
  return data;
};

const JobListingPage: React.FC = () => {
  const { data: jobs, isLoading, isError } = useQuery<Job[]>({
    queryKey: ['jobs'],
    queryFn: fetchJobs,
  });

  if (isLoading) {
    return <div className="text-center py-8">Loading jobs...</div>;
  }

  if (isError) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading jobs.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-indigo-100 to-pink-100">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-12 text-gray-800">
          Explore Opportunities
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {jobs?.map((job) => (
            <div
              key={job.id}
              className="p-6 bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="flex flex-col h-full">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {job.title}
                </h2>
                <p className="text-gray-600 mb-4">{job.company}</p>
                <p className="text-gray-500 mb-6">{job.location}</p>
                <div className="mt-auto">
                  <Link href={`/jobs/${job.id}`}>
                    <p className="text-indigo-600 hover:text-indigo-800 flex items-center">
                      View Details <FiChevronRight className="ml-1" />
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobListingPage;
