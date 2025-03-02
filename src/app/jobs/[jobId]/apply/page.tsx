'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import axios, { AxiosError } from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter, useParams } from 'next/navigation';
import { useUser } from '@/context/UserContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface ApplicationFormInputs {
  fullName: string;
  email: string;
  coverLetter: string;
  resume: FileList;
}

 function ApplicationForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<ApplicationFormInputs>();
  const router = useRouter();
  const params = useParams();
  const { user } = useUser();
  const queryClient = useQueryClient();

  const jobId = params.jobId as string;

  // Define a mutation to submit the application using the new object syntax
  const mutation = useMutation({
    mutationFn: async (data: ApplicationFormInputs) => {
      const formData = new FormData();
      formData.append('jobId', jobId);
      formData.append('fullName', data.fullName);
      formData.append('email', data.email);
      formData.append('coverLetter', data.coverLetter);

      if (data.resume && data.resume[0]) {
        formData.append('resume', data.resume[0]);
      }

      const response = await axios.post('/api/applications', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Application submitted successfully!');
      queryClient.invalidateQueries({
        queryKey: ['applications']
      });
      router.push('/dashboard/user');
    },
    onError: (error: unknown) => {
      const err = error as AxiosError<{ error: string }>;
      const errorMsg = err.response?.data?.error || 'Failed to submit application.';
      toast.error('Failed to submit application.');
    },
  });

  const onSubmit = (data: ApplicationFormInputs) => {
    mutation.mutate(data);
  };

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-xl shadow-lg border border-gray-200 mt-10">
      <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">
        Apply for Job
      </h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            {...register('fullName', { required: 'Full name is required' })}
            defaultValue={user?.name}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.fullName && (
            <p className="text-red-500 text-xs mt-1">
              {errors.fullName.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...register('email', { required: 'Email is required' })}
            defaultValue={user?.email}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.email && (
            <p className="text-red-500 text-xs mt-1">
              {errors.email.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Cover Letter
          </label>
          <textarea
            {...register('coverLetter', {
              required: 'Cover letter is required',
            })}
            className="mt-1 block w-full border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.coverLetter && (
            <p className="text-red-500 text-xs mt-1">
              {errors.coverLetter.message}
            </p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Resume Upload (PDF)
          </label>
          <input
            type="file"
            {...register('resume', { required: 'Resume is required' })}
            accept=".pdf"
            className="mt-1 block w-full"
          />
          {errors.resume && (
            <p className="text-red-500 text-xs mt-1">
              {errors.resume.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          className={`${mutation.isPending?'cursor-not-allowed':null}  w-full py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition`}
          disabled={mutation.isPending}
        >
          {mutation.isPending?'Submit Application...':'Submit Application'}
        </button>
      </form>
    </div>
  );
}

export default ApplicationForm;
  