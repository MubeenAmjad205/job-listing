'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUserPlus } from 'react-icons/fa';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {z} from 'zod'
import {registerSchema} from '@/schemas/index';



type RegisterFormInputs = z.infer<typeof registerSchema>;

const registerUser = async (data: RegisterFormInputs) => {
  const response = await axios.post('/api/auth/register', data);
  return response.data;
};

const RegisterForm = () => {
  const  router  = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success("User registered successfully! ;;;;;");
      reset();
      router.push("/auth/login");
    },
    onError: (error: AxiosError<{ error: string }>) => {
      const errorMsg =
        error.response?.data?.error || "Registration failed. Please try again.";
      toast.error(errorMsg);
    },
  });

  const onSubmit = (data: RegisterFormInputs) => {
    mutation.mutate(data);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 p-6 bg-white shadow-md rounded-lg max-w-md mx-auto"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            {...register("name")}
            className="mt-1 block text-gray-700 w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
          />
          {errors.name && (
            <p className="text-red-500 text-sm">{errors.name.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            {...register("email")}
            className="mt-1 text-gray-700 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
          />
          {errors.email && (
            <p className="text-red-500 text-sm">{errors.email.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            {...register("password")}
            className="mt-1 text-gray-700 block w-full border border-gray-300 rounded-md p-2 focus:ring focus:ring-blue-200"
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        <button
          type="submit"
          disabled={mutation.isPending}
          className={`${mutation.isPending?'cursor-not-allowed ':null }flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors w-full`}
        >
          <FaUserPlus className="mr-2" />
          {mutation.isPending ? "Registering..." : "Register"}
        </button>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/auth/login">
            <span className="text-indigo-600 hover:underline">login</span>
          </Link>
        </p>
      </form>
    </>
  );
};

export default RegisterForm;
