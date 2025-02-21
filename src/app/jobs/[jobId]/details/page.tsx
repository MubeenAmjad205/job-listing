'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import RingLoader from 'react-spinners/RingLoader';
import { useUser } from '@/context/UserContext';
import { Job } from '@/types';
import { FaPaperPlane, FaEdit, FaTrash } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';

export default function JobDetailPage() {
  const { jobId } = useParams() as { jobId: string };
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: userLoading } = useUser();

  const { data: job, isLoading, isError } = useQuery<any, Error>({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs/${jobId}`);
      return res.data;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await axios.delete(`/api/jobs/${jobId}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Job deleted successfully!');
      queryClient.invalidateQueries({  
        queryKey: ['jobs'],  
    }); 
      router.push('/admin/dashboard');
    },
    onError: () => {
      toast.error('Failed to delete job.');
    },
  });

  const handleApply = () => {
    router.push(`/jobs/${jobId}/apply`);
  };

  const handleEdit = () => {
    router.push(`/jobs/${jobId}/edit`);
  };

  // async function handleDelete(jobId:any) {
  //   try {
  //     const response = await axios.delete(`/api/jobs/${jobId}`);
  //     if (response.status === 200) {
  //       queryClient.invalidateQueries({  
  //         queryKey: ['jobs'],  
  //     }); 
  //       toast.success('Job deleted successfully!');
  //       router.push('/jobs');
  //     }
  //   } catch (error) {
  //     if (axios.isAxiosError(error)) {
  //       toast.error(`Failed to delete job: ${error.message}`);
  //     } else {
  //       toast.error('An unexpected error occurred.', );
  //     }
  //   }
  // }


  if (isLoading || userLoading)   {
    return  (
      <div className='flex items-center justify-center h-screen w-full bg-white'>
        <svg
          width="100"
          height="100"
          viewBox="0 0 50 50"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            cx="25"
            cy="25"
            r="20"
            stroke="#00b4d8"
            // stroke="#3498db"
            strokeWidth="5"
            fill="none"
            strokeDasharray="100"
            strokeDashoffset="50"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 25 25"
              to="360 25 25"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
    );
  }

  if (isError || !job) {
    return (
      <div className="text-center text-red-500 py-8">
        Error loading job details.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-indigo-700 p-6">
          <h1 className="text-4xl font-extrabold text-white">{job.title}</h1>
        </div>
        <div className="p-8">
          <div className="mb-6">
            <p className="text-gray-800 text-lg mb-2">
              <strong>Description:</strong> {job.description}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Category:</strong> {job.category}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Location:</strong> {job.location}
            </p>
            <p className="text-gray-700 mb-1">
              <strong>Salary:</strong> ${job.salary.toLocaleString()}
            </p>
          </div>
          {job.postedBy && (
            <div className="mb-6 border-t border-gray-200 pt-4">
              <p className="text-gray-800">
                <strong>Company:</strong> {job.postedBy.name}
              </p>
              <p className="text-gray-800">
                <strong>Contact:</strong> {job.postedBy.email}
              </p>
            </div>
          )}
          <div className="flex flex-wrap gap-4">
            {user && user.role === 'user' && (
              <button
                onClick={handleApply}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded shadow transition"
              >
                <FaPaperPlane />
                Apply Now
              </button>
            )}
            {user && user.role === 'admin' && (
              <>
                <button
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded shadow transition"
                >
                  <FaEdit />
                  Edit Job
                </button>
                {/* <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded shadow transition"
                >
                  <FaTrash />
                  Delete Job
                </button> */}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
