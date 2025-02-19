// components/ApplicationItem.tsx
'use client';

import React from 'react';
import { Application } from '@/types';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

interface ApplicationItemProps {
  application: Application;
}

const ApplicationItem: React.FC<ApplicationItemProps> = ({ application }) => {
  let statusIcon;
  let statusText;
  let bgColor;

  switch (application.status) {
    case 'pending':
      statusIcon = <FaHourglassHalf className="inline-block mr-2" />;
      statusText = 'Pending';
      bgColor = 'bg-yellow-100';
      break;
    case 'accepted':
      statusIcon = <FaCheckCircle className="inline-block mr-2" />;
      statusText = 'Accepted';
      bgColor = 'bg-green-100';
      break;
    case 'rejected':
      statusIcon = <FaTimesCircle className="inline-block mr-2" />;
      statusText = 'Rejected';
      bgColor = 'bg-red-100';
      break;
    default:
      statusIcon = null;
      statusText = '';
      bgColor = 'bg-gray-100';
  }

  return (
    <div className={`flex items-center p-4 ${bgColor} rounded-lg border border-gray-200 shadow-md hover:shadow-xl transition-shadow duration-300`}>
      <div className="text-3xl text-gray-700">
        {statusIcon}
      </div>
      <div className="ml-4">
        <h3 className="text-xl font-bold text-gray-800">{application.jobTitle}</h3>
        <p className="text-md font-semibold text-gray-700">{statusText}</p>
      </div>
    </div>
  );
};

export default ApplicationItem;
