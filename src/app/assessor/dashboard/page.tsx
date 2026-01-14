'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FileText, CheckCircle, Clock, AlertTriangle, XCircle, Filter, Search } from 'lucide-react';

interface Assessment {
    id: string;
    title: string;
    status: string;
    updatedAt: string;
    user: {
        name: string | null;
        email: string;
    };
}

export default function AssessorDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [assessments, setAssessments] = useState<Assessment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'PENDING' | 'ALL'>('PENDING');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            const role = session?.user?.role?.toUpperCase();
            if (role !== 'ASSESSOR' && role !== 'ADMIN') {
                router.push('/cra'); // Redirect non-assessors
                return;
            }
            fetchAssessments();
        }
    }, [status, router, session]);

    const fetchAssessments = async () => {
        try {
            // Fetch all assessments for assessors
            const res = await fetch('/api/assessments?mode=all');
            if (res.ok) {
                const data = await res.json();
                setAssessments(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredAssessments = assessments.filter(a => {
        const matchesTab = activeTab === 'PENDING' ? a.status === 'SUBMITTED' : true;
        const matchesSearch =
            a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (a.user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            a.user.email.toLowerCase().includes(searchQuery.toLowerCase());

        return matchesTab && matchesSearch;
    });

    if (status === 'loading' || isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Assessment Review</h2>
                        <p className="text-slate-600">Manage and review submitted risk assessments.</p>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search assessments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-64"
                        />
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-4 mb-6 border-b border-slate-200">
                    <button
                        onClick={() => setActiveTab('PENDING')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'PENDING'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        Pending Review
                        {assessments.filter(a => a.status === 'SUBMITTED').length > 0 && (
                            <span className="ml-2 bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full text-xs">
                                {assessments.filter(a => a.status === 'SUBMITTED').length}
                            </span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('ALL')}
                        className={`pb-3 px-1 text-sm font-medium transition-colors relative ${activeTab === 'ALL'
                            ? 'text-blue-600 border-b-2 border-blue-600'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        All Assessments
                    </button>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Assessment Title</th>
                                    <th className="px-6 py-4">Submitted By</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredAssessments.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <Filter className="w-12 h-12 text-slate-300 mb-3" />
                                                <p>No assessments found in this view.</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredAssessments.map((assessment) => (
                                        <tr key={assessment.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-900">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                        <FileText className="w-4 h-4" />
                                                    </div>
                                                    {assessment.title}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {assessment.user.name || assessment.user.email}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${assessment.status === 'COMPLETED' || assessment.status === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                                    assessment.status === 'SUBMITTED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                        assessment.status === 'CHANGES_REQUESTED' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                            assessment.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                                                'bg-slate-50 text-slate-700 border-slate-200'
                                                    }`}>
                                                    {assessment.status === 'APPROVED' && <CheckCircle className="w-3 h-3" />}
                                                    {assessment.status === 'REJECTED' && <XCircle className="w-3 h-3" />}
                                                    {assessment.status === 'CHANGES_REQUESTED' && <AlertTriangle className="w-3 h-3" />}
                                                    {assessment.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500">
                                                {new Date(assessment.updatedAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    href={`/cra?id=${assessment.id}`}
                                                    className="text-blue-600 hover:text-blue-800 font-medium hover:underline"
                                                >
                                                    Review
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
