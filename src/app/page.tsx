'use client';

import React from 'react';
import Link from 'next/link';
import { signIn, signOut } from 'next-auth/react';
import { FaGithub, FaEnvelope } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';

const HomePage = () => {
  const { user } = useUser();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-24 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-extrabold mb-6">Welcome to Jobify</h1>
          <p className="text-xl mb-10">
            Your gateway to endless opportunities in the tech world.
          </p>
          {!user ? (
            <div className="space-x-4">
              <button
                onClick={() => signIn()}
                className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300"
              >
                Log In
              </button>
              <Link
                href="/signup"
                className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 inline-block"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-3xl font-semibold">
                Welcome back, {user.name}!
              </h2>
              <div className="mt-6 space-x-4">
                <Link
                  href="/jobs"
                  className="bg-white text-blue-600 font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition duration-300 inline-block"
                >
                  Explore Jobs
                </Link>
                <button
                  onClick={() => signOut()}
                  className="bg-red-600 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-red-700 transition duration-300"
                >
                  Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Features Section */}
      <section className="bg-gray-100 py-16 px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Features
        </h2>
        <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: 'Job Search & Filter',
              description:
                'Easily search and filter through jobs based on category, location, and salary.',
              icon: '🔍',
            },
            {
              title: 'User & Admin Roles',
              description:
                'Role-based access control ensures users and admins have appropriate permissions.',
              icon: '👥',
            },
            {
              title: 'Secure Authentication',
              description:
                'Robust authentication mechanisms keep user data safe and secure.',
              icon: '🔒',
            },
          ].map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 bg-white rounded-lg shadow-lg text-indigo-600"
            >
              <div className="text-5xl mb-4">{feature.icon}</div>
              <h3 className="text-2xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* About Section */}
      <section className="container mx-auto py-16 px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          About Jobify
        </h2>
        <p className="text-gray-600 text-lg leading-relaxed text-center max-w-3xl mx-auto">
          Jobify is a full-stack job listing application built to bridge the gap between talented professionals and forward-thinking companies. Leveraging the latest technologies, we provide a platform that's intuitive, efficient, and user-centric.
        </p>
        <div className="mt-12 flex flex-wrap justify-center">
          {/* Tech Stack Badges */}
          {[
            'Next.js',
            'TypeScript',
            'Tailwind CSS',
            'React Query',
            'Prisma ORM',
            'PostgreSQL',
            'Iron Session',
            'React Hook Form',
            'Zod',
          ].map((tech) => (
            <span
              key={tech}
              className="bg-gray-200 text-gray-800 m-2 px-5 py-2 rounded-full text-sm font-medium"
            >
              {tech}
            </span>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <footer className="bg-gray-50 py-12">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">
            Get in Touch
          </h3>
          <p className="text-gray-600 mb-8">
            We'd love to hear from you! Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
          </p>
          <div className="flex justify-center space-x-8">
           <Link
              href="mailto:mianmubeen205@gmail.com"
              className="text-gray-600 hover:text-gray-800 transition duration-300"
              aria-label="Email"
            >
              <FaEnvelope size={36} />
           </Link>
           <Link
              href="https://github.com/MubeenAmajad205"
              className="text-gray-600 hover:text-gray-800 transition duration-300"
              aria-label="GitHub"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaGithub size={36} />
           </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
