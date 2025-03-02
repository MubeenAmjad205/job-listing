'use client';

import { FaUserCircle } from 'react-icons/fa';
import { useUser } from '@/context/UserContext';

const UserInfo = () => {
  const { user, isLoading } = useUser();



  if (isLoading) {
    return <div className="text-center text-gray-600">Loading user info...</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
      <div className="flex items-center mb-4">
        <FaUserCircle className="text-6xl text-indigo-500 mr-4" />
        <h2 className="text-2xl font-bold text-gray-800">Public Profile</h2>
      </div>
      <div className="space-y-3">
        <p>
          <span className="font-bold text-indigo-600">Name:</span>{' '}
          <span className="text-gray-700">{user?.name}</span>
        </p>
        <p>
          <span className="font-bold text-indigo-600">Email:</span>{' '}
          <span className="text-gray-700">{user?.email}</span>
        </p>
        <p>
          <span className="font-bold text-indigo-600">Role:</span>{' '}
          <span className="text-gray-700">{user?.role}</span>
        </p>
      </div>
    </div>
  );
};

export default UserInfo;
