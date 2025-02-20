'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaSignInAlt } from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser } from '@/context/UserContext';

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginFormInputs = z.infer<typeof loginSchema>;

const LoginForm = () => {
  const router = useRouter();
  const { login } = useUser();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInputs) => {
    try {
      const response = await axios.post('/api/auth/login', data);
      
      if (response.data.success) {
        login(response.data.user);
        toast.success("Logged in successfully!");
        
        if (response.data.user.role === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard/user");
        }
      } else {
        const errorMsg = response.data.error || "Login failed. Please try again.";
        toast.error(errorMsg);
      }
    } catch (error: unknown) {
      const err = error as AxiosError<{ error: string }>;
      const errorMsg = err.response?.data?.error || "Login failed. Please try again.";
      toast.error(errorMsg);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-xl shadow-lg border border-gray-200">
      <h2 className="text-3xl font-bold text-center text-indigo-600 mb-6">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            {...register("email")}
            className="mt-1 block w-full border text-gray-700 border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            id="password"
            {...register("password")}
            className="mt-1 block w-full text-gray-700 border border-gray-300 rounded-md p-3 focus:ring-indigo-500 focus:border-indigo-500"
          />
          {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full  flex items-center justify-center px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition"
        >
          <FaSignInAlt className="mr-2" />
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        Dont have an account?{' '}
        <Link href="/auth/register" className="text-indigo-600 hover:underline">
          Register
        </Link>
      </p>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
    </div>
  );
};

export default LoginForm;
