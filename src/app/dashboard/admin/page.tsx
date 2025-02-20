'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { 
  FaUser, FaBriefcase, FaFileAlt, FaPlus, FaCheck, FaTimes, 
  FaChartLine, FaMoneyCheckAlt, FaMapMarkerAlt, FaTag 
} from 'react-icons/fa';
import Link from 'next/link';

interface Application {
  id: number;
  resume: string;
  status: string;
  job: {
    title: string;
  };
  user: {
    name: string;
    email: string;
  };
}

interface Job {
  title: string;
  description: string;
  category: string;
  location: string;
  salary: number;
}

const AdminDashboard = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'postJob'>('overview');
  const [newJob, setNewJob] = useState<Job>({
    title: '',
    description: '',
    category: '',
    location: '',
    salary: 0,
  });

  const { 
    data: applications, 
    error, 
    isPending 
  } = useQuery<Application[]>({
    queryKey: ['applications'],
    queryFn: async () => {
      const { data } = await axios.get('/api/applications');
      return data.applications;
    },
    enabled: user?.role === 'admin'
  });

  const { mutate: updateApplication } = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => {
      await axios.put(`/api/applications/${id}`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      toast.success('Application updated');
    },
    onError: () => {
      toast.error('Failed to update application');
    }
  });

  const { mutate: postJob } = useMutation({
    mutationFn: async (jobData: Job) => {
      await axios.post('/api/jobs', jobData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      setNewJob({
        title: '',
        description: '',
        category: '',
        location: '',
        salary: 0,
      });
      toast.success('Job posted successfully');
    },
    onError: () => {
      toast.error('Failed to post job');
    }
  });

  const handleApplicationAction = (applicationId: number, status: 'approved' | 'rejected') => {
    updateApplication({ id: applicationId, status });
  };

  const handlePostJob = (e: React.FormEvent) => {
    e.preventDefault();
    postJob(newJob);
  };

  if (isPending) {
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

  if (user?.role !== 'admin') {
    return <div className="p-8 text-center h-screen text-red-500">🔒 Unauthorized access</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error loading applications</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <FaBriefcase className="text-indigo-600" />
            Admin Dashboard
          </h1>
        </div>

        <div className="flex gap-2 mb-8 bg-white rounded-lg p-2 shadow-sm">
          {[
            { id: 'overview', icon: FaChartLine, label: 'Overview' },
            { id: 'applications', icon: FaFileAlt, label: 'Applications' },
            { id: 'postJob', icon: FaPlus, label: 'Post Job' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as  "applications" | "overview" | "postJob")}
              className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${
                activeTab === tab.id 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-600 hover:bg-indigo-50'
              }`}
            >
              <tab.icon className="text-lg" />
              <span className="font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-600">
                <FaUser /> Admin Profile
              </h2>
              <div className="space-y-3 text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Name:</span>
                  <span className="text-gray-900">{user?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Email:</span>
                  <span className="text-gray-900">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Role:</span>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full">
                    {user?.role}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
                <FaBriefcase /> Job Statistics
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span>Total Applications</span>
                  <span className="text-2xl font-bold text-green-600">
                    {applications?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-700">
                <FaFileAlt /> Job Applications
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    {['Applicant', 'Job Title', 'Resume', 'Status', 'Actions'].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {applications?.map((application) => (
                    <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <FaUser className="text-indigo-600" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {application.user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {application.user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {application.job.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={application.resume}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                        >
                          <FaFileAlt /> View
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${application.status === 'approved' ? 'bg-green-100 text-green-800' :
                            application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                          {application.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap  ">
                        <div className='space-y-2 '>

                        <button
                          onClick={() => handleApplicationAction(application.id, 'approved')}
                          className="text-white bg-green-600 px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                          >
                          <FaCheck /> Approve
                        </button>
                        <button
                          onClick={() => handleApplicationAction(application.id, 'rejected')}
                          className="text-white bg-red-600 px-5 py-2 mr-5 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                          >
                          <FaTimes /> Reject
                        </button>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {activeTab === 'postJob' && (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 bg-indigo-50 border-b border-indigo-100">
              <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-700">
                <FaPlus /> Post New Job
              </h2>
            </div>
            <form onSubmit={handlePostJob} className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-lg">
                  <FaTag className="text-indigo-600" />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={newJob.title}
                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                    className="w-full bg-transparent focus:outline-none text-gray-700"
                    required
                  />
                </div>

                <div className="flex items-start gap-3 bg-indigo-50 p-4 rounded-lg">
                  <FaFileAlt className="text-indigo-600 mt-2" />
                  <textarea
                    placeholder="Job Description"
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    className="w-full bg-transparent focus:outline-none text-gray-700"
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-lg">
                    <FaTag className="text-indigo-600" />
                    <input
                      type="text"
                      placeholder="Category"
                      value={newJob.category}
                      onChange={(e) => setNewJob({ ...newJob, category: e.target.value })}
                      className="w-full bg-transparent focus:outline-none text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-lg">
                    <FaMapMarkerAlt className="text-indigo-600" />
                    <input
                      type="text"
                      placeholder="Location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      className="w-full bg-transparent focus:outline-none text-gray-700"
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-lg">
                    <FaMoneyCheckAlt className="text-indigo-600" />
                    <input
                      type="number"
                      placeholder="Salary"
                      value={newJob.salary}
                      onChange={(e) => setNewJob({ ...newJob, salary: Number(e.target.value) })}
                      className="w-full bg-transparent focus:outline-none text-gray-700"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium"
              >
                <FaPlus /> Post Job
              </button>
            </form>
          </div>
        )}
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AdminDashboard;