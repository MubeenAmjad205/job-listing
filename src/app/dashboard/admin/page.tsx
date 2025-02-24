'use client';

import React, { useState, useMemo } from 'react';
import { useUser } from '@/context/UserContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
    FaUser, FaBriefcase, FaFileAlt, FaPlus, FaCheck, FaTimes,
    FaChartLine, FaMoneyCheckAlt, FaMapMarkerAlt, FaTag
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';
import { Job, Application, User as UserType } from '@/types';
import JobsByCategoryDonutChart, { CategoryData } from '@/components/JobsByCategoryDonutChart';
import ApplicationStatusChart, { StatusData } from '@/components/ApplicationStatusChart';

interface NewJobData extends Job { }

const AdminDashboard = () => {
    const { user } = useUser();
    const router = useRouter();
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState<'overview' | 'applications' | 'postJob' | 'users'>('overview');
    const [newJob, setNewJob] = useState<any>({
        title: '',
        description: '',
        category: '',
        location: '',
        salary: 0,
    });

    // Fetch applications
    const { data: applications = [], isLoading: appLoading } = useQuery<Application[], Error>({
        queryKey: ['applications'],
        queryFn: async () => {
            const { data } = await axios.get('/api/applications');
            return data.applications || [];
        },
        enabled: user?.role === 'admin',
    });

    // Fetch jobs
    const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[], Error>({
        queryKey: ['jobs'],
        queryFn: async () => {
            const { data } = await axios.get('/api/jobs');
            return data || [];
        },
        enabled: user?.role === 'admin',
    });

    // Fetch users
    const { data: users = [], isLoading: usersLoading } = useQuery<UserType[], Error>({
        queryKey: ['users'],
        queryFn: async () => {
            const { data } = await axios.get('/api/users');
            return data.users || [];
        },
        enabled: user?.role === 'admin',
    });

    // Mutations
    const { mutate: updateApplication } = useMutation({
        mutationFn: async ({ id, status }: { id: number; status: 'approved' | 'rejected' }) => {
            await axios.put(`/api/applications/${id}`, { status });
        },
        onSuccess: () => {
            toast.success('Application updated', { hideProgressBar: true });
            queryClient.invalidateQueries<any>(['applications']);
        },
        onError: () => {
            toast.error('Failed to update application', { hideProgressBar: true });
        }
    });

    const { mutate: postJob, isPending } = useMutation({
        mutationFn: async (jobData: NewJobData) => {
            await axios.post('/api/jobs', jobData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries<any>(['jobs']);
            setNewJob({ title: '', description: '', category: '', location: '', salary: 0 });
            toast.success('Job posted successfully', { hideProgressBar: true });
        },
        onError: () => {
            toast.error('Failed to post job', { hideProgressBar: true });
        }
    });

    const { mutate: deleteJob } = useMutation({
        mutationFn: async (jobId: number) => {
            await axios.delete(`/api/jobs/${jobId}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries<any>(['jobs']);
            toast.success('Job deleted successfully!', { hideProgressBar: true });
        },
        onError: () => {
            toast.error('Failed to delete job.', { hideProgressBar: true });
        }
    });

    const { mutate: updateUserRole } = useMutation({
        mutationFn: async ({ id, role }: { id: number; role: string }) => {
            await axios.put(`/api/users/${id}`, { role });
        },
        onSuccess: () => {
            queryClient.invalidateQueries<any>(['users']);
            toast.success('User role updated', { hideProgressBar: true });
        },
        onError: () => {
            toast.error('Failed to update user role', { hideProgressBar: true });
        }
    });

    const { mutate: deleteUser } = useMutation({
        mutationFn: async (id: number) => {
            await axios.delete(`/api/users/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
            toast.success('User deleted successfully', { hideProgressBar: true });
        },
        onError: () => {
            toast.error('Failed to delete user', { hideProgressBar: true });
        }
    });

    // Handlers
    const handleApplicationAction = (applicationId: number, status: 'approved' | 'rejected') => {
        updateApplication({ id: applicationId, status });
    };

    const handlePostJob = (e: React.FormEvent) => {
        e.preventDefault();
        postJob(newJob);
    };

    const handleEditJob = (jobId: number) => {
        router.push(`/admin/jobs/${jobId}/edit`);
    };

    const handleDeleteJob = (jobId: number) => {
        if (confirm('Are you sure you want to delete this job?')) {
            deleteJob(jobId);
        }
    };

    // Chart data for Application Status Distribution
    const applicationStatusData = useMemo(() => {
        if (!applications.length) return [];
        return [
            { name: 'Pending', value: applications.filter(app => app.status === 'pending').length },
            { name: 'Approved', value: applications.filter(app => app.status === 'approved').length },
            { name: 'Rejected', value: applications.filter(app => app.status === 'rejected').length },
        ];
    }, [applications]);

    // Chart data for Jobs by Category (donut chart)
    const jobsByCategoryData: CategoryData[] = useMemo(() => {
        if (!jobs.length) return [];
        const counts: Record<string, number> = {};
        jobs.forEach((job: any) => {
            counts[job.category] = (counts[job?.category] || 0) + 1;
        });
        return Object.keys(counts).map(category => ({ category, count: counts[category] }));
    }, [jobs]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 flex items-center gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
                        <FaBriefcase className="text-indigo-600" />
                        Admin Dashboard
                    </h1>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-8 bg-white rounded-lg p-2 shadow-sm">
                    {[
                        { id: 'overview', icon: FaChartLine, label: 'Overview' },
                        { id: 'applications', icon: FaFileAlt, label: 'Applications' },
                        { id: 'postJob', icon: FaPlus, label: 'Post Job' },
                        { id: 'users', icon: FaUser, label: 'Users' },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as 'overview' | 'applications' | 'postJob' | 'users')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-md transition-all ${activeTab === tab.id
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:bg-indigo-50'
                                }`}
                        >
                            <tab.icon className="text-lg" />
                            <span className="font-medium">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Tab Contents */}
                {activeTab === 'overview' && (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {/* Admin Profile Card */}
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
                            {/* Job Statistics Card */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-100">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-green-600">
                                    <FaBriefcase /> Job Statistics
                                </h2>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span>Total Jobs</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {jobs.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span>Total Applications</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {applications.length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span>approved Applications</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {applications.filter(app => app.status === 'approved').length}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                        <span>Rejected Applications</span>
                                        <span className="text-2xl font-bold text-green-600">
                                            {applications.filter(app => app.status === 'rejected').length}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            {/* (Optional) Additional Stats Card */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-indigo-600">
                                    <FaMoneyCheckAlt /> Other Metrics
                                </h2>
                                <div className="text-gray-700">
                                    <p className="text-sm">Additional stats can be added here.</p>
                                </div>
                            </div>
                        </div>
                        {/* Charts Section */}
                        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Application Status Distribution Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                                <h2 className="text-xl font-semibold mb-4 text-indigo-600">
                                    Application Status Distribution
                                </h2>
                                <div className="flex justify-center">
                                    <ApplicationStatusChart data={applicationStatusData} />
                                </div>
                            </div>
                            {/* Jobs by Category Donut Chart */}
                            <div className="bg-white p-6 rounded-xl shadow-lg border border-indigo-100">
                                <h2 className="text-xl font-semibold mb-4 text-indigo-600">
                                    Jobs by Category
                                </h2>
                                <div className="flex justify-center">
                                    <JobsByCategoryDonutChart data={jobsByCategoryData} key={2} />
                                </div>
                            </div>
                        </div>
                    </>
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
                                    {applications.map((application: any) => (
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
                                                <a
                                                    href={application.resume}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1"
                                                >
                                                    <FaFileAlt /> View
                                                </a>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full 
                          ${application.status === 'approved' ? 'bg-green-100 text-green-800' :
                                                        application.status === 'rejected' ? 'bg-red-100 px-4 text-red-800' :
                                                            'bg-yellow-100 text-yellow-800'}`}>
                                                    {application.status[0].toUpperCase() + application.status.slice(1)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="space-y-2">
                                                    {application.status === 'pending' ? (
                                                        <>
                                                            <button
                                                                onClick={() => handleApplicationAction(application.id, 'approved')}
                                                                className="text-white bg-green-600 px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                                                            >
                                                                <FaCheck /> Approve
                                                            </button>
                                                            <button
                                                                onClick={() => handleApplicationAction(application.id, 'rejected')}
                                                                className="text-white bg-red-600 px-5 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                                                            >
                                                                <FaTimes /> Reject
                                                            </button>
                                                        </>
                                                    ) : application.status !== 'approved' ? (
                                                        <button
                                                            onClick={() => handleApplicationAction(application.id, 'approved')}
                                                            className="text-white bg-green-600 px-3 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-1"
                                                        >
                                                            <FaCheck /> Approve
                                                        </button>
                                                    ) : (
                                                        <button
                                                            onClick={() => handleApplicationAction(application.id, 'rejected')}
                                                            className="text-white bg-red-600 px-5 py-2 rounded-lg hover:bg-red-700 transition flex items-center gap-1"
                                                        >
                                                            <FaTimes /> Reject
                                                        </button>
                                                    )}
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
                                className={`${isPending ? 'cursor-not-allowed' : null} w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition flex items-center justify-center gap-2 font-medium`}
                            >
                                <FaPlus /> {isPending ? 'Posting Job...' : 'Post Job'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="p-6 bg-indigo-50 border-b border-indigo-100">
                            <h2 className="text-xl font-semibold flex items-center gap-2 text-indigo-700">
                                <FaUser /> Registered Users
                            </h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        {['Name', 'Email', 'Role', 'Actions'].map((header) => (
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
                                    {users.map((userItem) => (
                                        <tr key={userItem.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {userItem.name}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {userItem.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <select
                                                    value={userItem.role}
                                                    onChange={(e) =>
                                                        updateUserRole({ id: userItem.id, role: e.target.value })
                                                    }
                                                    className="border border-gray-300 p-2 rounded"
                                                >
                                                    <option value="user">User</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => deleteUser(userItem.id)}
                                                    className="text-white bg-red-500 px-4 py-2 rounded hover:bg-red-600 transition"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        </div>
    );
};

export default AdminDashboard;
