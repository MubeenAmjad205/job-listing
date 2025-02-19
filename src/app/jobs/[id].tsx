// components/JobDetailPage.tsx

'use client';

import React from 'react';
import { useRouter } from 'next/router';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import Link from 'next/link';
import { Job } from '@/types';
import { FiBookmark, FiShare2 } from 'react-icons/fi';

const fetchJob = async (id: string): Promise<Job> => {
  const response = await axios.get(`/api/jobs/${id}`);
  return response.data;
};

const JobDetailPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const { data: job, isLoading, isError } = useQuery<Job>(
    ['job', id],
    () => fetchJob(id as string),
    { enabled: !!id }
  );

  if (isLoading) {
    return <div className="text-center py-8">Loading job details...</div>;
  }

  if (isError || !job) {
    return (
      <div className="text-center py-8 text-red-500">
        Error loading job details.
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8 bg-your-scheme-background">
      <div className="max-w-4xl mx-auto bg-your-scheme-card rounded-xl shadow-md p-6 text-your-scheme-text">
        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
        <p className="text-lg mb-6">{job.description}</p>
        <div className="flex space-x-4">
          <Link href={`/jobs/${job.id}/apply`}>
            <button className="px-6 py-2 rounded bg-your-scheme-button text-white hover:bg-opacity-80 transition">
              Apply Now
            </button>
          </Link>
          <button className="flex items-center px-4 py-2 rounded border border-your-scheme-border hover:bg-your-scheme-hover transition">
            <FiBookmark className="mr-2" /> Save Job
          </button>
          <button className="flex items-center px-4 py-2 rounded border border-your-scheme-border hover:bg-your-scheme-hover transition">
            <FiShare2 className="mr-2" /> Share Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
