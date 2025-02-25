'use client';

import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import {
  FaPaperPlane,
  FaEdit,
  FaTrash,
  FaInfoCircle,
} from 'react-icons/fa';
import RingLoader from 'react-spinners/RingLoader';
import { useUser } from '@/context/UserContext';
import { Job } from '@/types';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { searchSchema} from '@/schemas/index';



type SearchFormData = z.infer<typeof searchSchema>;

export default function JobListingPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  const { register, watch } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: { location: '', category: '', salary: undefined },
  });
  const filters = watch();

  const {
    data: jobs,
    isLoading: jobsLoading,
    isError,
  } = useQuery<Job[], AxiosError>({
    queryKey: ['jobs'],
    queryFn: async () => {
      const { data } = await axios.get<Job[]>('/api/jobs');
      return data;
    },
  });

  const distinctLocations = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    return Array.from(new Set(jobs?.map((job) => job.location)));
  }, [jobs]);

  const distinctCategories = React.useMemo(() => {
    if (!jobs || jobs.length === 0) return [];
    return Array.from(new Set(jobs?.map((job) => job.category)));
  }, [jobs]);

  const filteredJobs = React.useMemo(() => {
    if (!jobs) return [];
    let result = [...jobs];
    if (filters.location) {
      result = result.filter((job:Job) =>
        job?.location?.toLowerCase().includes(filters.location!.toLowerCase())
      );
    }
    if (filters.category) {
      result = result.filter((job:Job) =>
        job?.category?.toLowerCase().includes(filters.category!.toLowerCase())
      );
    }
    if (filters.salary !== undefined) {
      result = result.filter((job) => Number(job?.salary) >= filters.salary!);
    }
    return result;
  }, [jobs, filters]);

  const handleApply = (jobId: number) => {
    router.push(`/jobs/${jobId}/apply`);
  };

  const handleDetails = (jobId: number) => {
    router.push(`/jobs/${jobId}/details`);
  };

  const handleEdit = (jobId: number) => {
    router.push(`/jobs/${jobId}/edit`);
  };

  async function handleDelete(jobId: number) {
    try {
      const response = await axios.delete(`/api/jobs/${jobId}`);
      if (response.status === 200) {
        queryClient.invalidateQueries({  
          queryKey: ['jobs'],  
      }); 
        toast.success('Job deleted successfully!', {
          hideProgressBar: true,
        });
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(`Failed to delete job: ${error.message}`, {
          hideProgressBar: true,
        });
      } else {
        toast.error('An unexpected error occurred.', {
          hideProgressBar: true,
        });
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b shadow-sm p-4">
        <h1 className="text-2xl font-bold text-gray-800">Job Listings</h1>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-white rounded shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Filter Jobs
          </h2>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <select
                {...register('location')}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="">All Locations</option>
                {distinctLocations?.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                {...register('category')}
                className="border border-gray-300 p-2 rounded w-full"
              >
                <option value="">All Categories</option>
                {distinctCategories?.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Min Salary
              </label>
              <input
                type="number"
                placeholder="0"
                {...register('salary')}
                className="border border-gray-300 p-2 rounded w-full"
              />
            </div>
          </form>
        </div>

        {jobsLoading || userLoading ? (
          <div className="flex items-center justify-center min-h-[200px]">
            <RingLoader color="#4A90E2" size={60} />
          </div>
        ) : isError ? (
          <div className="text-center text-red-500 text-lg">
            Error loading jobs
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs && filteredJobs.length > 0 ? (
              filteredJobs?.map((job:any) => (
                <div
                  key={job.id}
                  className="bg-white shadow rounded-lg p-6 hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    <h2 className="text-xl font-bold text-indigo-700 mb-2">
                      {job.title}
                    </h2>
                    <p className="text-gray-600 mb-1">
                      <strong>Category:</strong> {job.category}
                    </p>
                    <p className="text-gray-600 mb-1">
                      <strong>Location:</strong> {job.location}
                    </p>
                    <p className="text-gray-600 mb-4">
                      <strong>Salary:</strong> ${job?.salary?.toLocaleString()}
                    </p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2">
                    <button
                      onClick={() => handleDetails(job?.id)}
                      className="bg-indigo-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-indigo-700 transition"
                    >
                      <FaInfoCircle />
                      Details
                    </button>
                    {user && user.role === 'user' && (
                      <button
                        onClick={() => handleApply(job?.id)}
                        className="bg-green-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-green-700 transition"
                      >
                        <FaPaperPlane />
                        Apply
                      </button>
                    )}
                    {user && user.role === 'admin' && (
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleEdit(job.id)}
                          className="bg-yellow-500 text-white w-full rounded flex items-center justify-center gap-2 hover:bg-yellow-600 transition"
                        >
                          <FaEdit />
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(job.id)}
                          className="bg-red-500 text-white w-full py-2 rounded flex items-center justify-center gap-2 hover:bg-red-600 transition"
                        >
                          <FaTrash />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full p-6 text-center text-gray-600">
                No jobs found
              </div>
            )}
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
}
