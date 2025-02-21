'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { FaSave } from 'react-icons/fa';
import {editJobSchema} from '@/schemas/index'; 
import { toast } from 'react-toastify';


type EditJobFormInputs = z.infer<typeof editJobSchema>;

export default function EditJobPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = Number(params.jobId);
  console.log(jobId);
  

  const {
    data: job,
    isLoading: isLoadingJob,
    isError: isErrorJob,
  } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await axios.get(`/api/jobs/${jobId}`);
      return res.data; 
    },
    enabled: !!jobId,
  });

  const { register, handleSubmit, formState: { errors }, reset } =
    useForm<EditJobFormInputs>({
      resolver: zodResolver(editJobSchema),
      defaultValues: {
        title: '',
        description: '',
        category: '',
        location: '',
        salary: 0,
      },
    });

  React.useEffect(() => {
    if (job) {
      reset({
        title: job.title,
        description: job.description,
        category: job.category,
        location: job.location,
        salary: job.salary,
      });
    }
  }, [job, reset]);

  const updateMutation = useMutation({
    mutationFn: async (data: EditJobFormInputs) => {
      const res = await axios.put(`/api/jobs/${jobId}`, data);
      return res.data;
    },
    onSuccess: () => {
      router.push(`/jobs/${jobId}/details`);
      toast.success('Job updated successfully!');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Failed to update job');
    },
  });

  const onSubmit = (data: EditJobFormInputs) => {
    updateMutation.mutate(data);
  };

  if (isLoadingJob)   {
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

  if (isErrorJob) {
    return (
      <div className="p-8 text-center text-red-600">
        Error loading job details.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-3xl mx-auto bg-white shadow-md rounded-md p-6">
        <h1 className="text-2xl font-bold mb-6 text-indigo-600 ">Edit Job</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Title
            </label>
            <input
              {...register('title')}
              className="w-full p-3 border border-gray-300 rounded text-gray-600"
              placeholder="Enter job title"
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Job Description
            </label>
            <textarea
              {...register('description')}
              className="w-full p-3 border border-gray-300 rounded text-gray-600"
              rows={4}
              placeholder="Enter job description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <input
                {...register('category')}
                className="w-full p-3 border border-gray-300 rounded text-gray-600"
                placeholder="e.g. Web Development"
              />
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                {...register('location')}
                className="w-full p-3 border border-gray-300 rounded text-gray-600"
                placeholder="e.g. Remote"
              />
              {errors.location && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.location.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Salary
            </label>
            <input
              type="number"
              {...register('salary')}
              className="w-full p-3 border border-gray-300 rounded text-gray-600 "
              placeholder="0"
            />
            {errors.salary && (
              <p className="text-red-500 text-sm mt-1">
                {errors.salary.message as string}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={updateMutation.isPending}
            className={`${updateMutation.isPending?'cursor-not-allowed':null} flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition`}
          >
            <FaSave />
            {updateMutation.isPending ? 'Updating...' : 'Update Job'}
          </button>
        </form>
      </div>
    </div>
  );
}
