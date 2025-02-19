// app/user/dashboard/page.tsx
'use client';

import React from 'react';
import UserInfo from '@/components/UserInfo';
import ApplicationsList from '@/components/ApplicationsList';

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-8">
      <div className="max-w-6xl mx-auto bg-white/80 backdrop-blur-md rounded-xl shadow-2xl p-8">
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Welcome to Your Dashboard
        </h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <UserInfo />
          <ApplicationsList />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
