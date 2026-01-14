import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { FileText, Plus, Clock, CheckCircle, AlertCircle, Edit, Eye, Trash2, User, LogOut } from 'lucide-react';
import { DeleteButton } from '@/components/DeleteButton';
import { SignOutButton } from '@/components/SignOutButton';

export default async function SubmitterDashboard() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    // Ensure only submitters (or anyone really, but logically submitters) see this
    // Assessors might have their own dashboard, but could also see this if they want to submit.

    const assessments = await prisma.assessment.findMany({
        where: { userId: session.user.id },
        orderBy: { updatedAt: 'desc' },
    });

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-end">
                <Link
                    href="/cra"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Assessment
                </Link>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                                <tr>
                                    <th className="px-6 py-4">Assessment Title</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Last Updated</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {assessments.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-slate-500">
                                                <FileText className="w-12 h-12 text-slate-300 mb-3" />
                                                <p className="text-lg font-medium text-slate-900 mb-1">No assessments yet</p>
                                                <p className="mb-4">Get started by creating your first cloud risk assessment.</p>
                                                <Link
                                                    href="/cra"
                                                    className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                                                >
                                                    Create New Assessment
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    assessments.map((assessment) => {
                                        const isEditable = assessment.status === 'DRAFT' || assessment.status === 'CHANGES_REQUESTED';

                                        return (
                                            <tr key={assessment.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4 font-medium text-slate-900">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                                            <FileText className="w-4 h-4" />
                                                        </div>
                                                        {assessment.title}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${assessment.status === 'COMPLETED' || assessment.status === 'APPROVED'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : assessment.status === 'REJECTED'
                                                            ? 'bg-red-50 text-red-700 border-red-200'
                                                            : assessment.status === 'CHANGES_REQUESTED'
                                                                ? 'bg-orange-50 text-orange-700 border-orange-200'
                                                                : 'bg-slate-100 text-slate-700 border-slate-200'
                                                        }`}>
                                                        {assessment.status === 'APPROVED' ? (
                                                            <CheckCircle className="w-3 h-3" />
                                                        ) : assessment.status === 'REJECTED' ? (
                                                            <AlertCircle className="w-3 h-3" />
                                                        ) : (
                                                            <Clock className="w-3 h-3" />
                                                        )}
                                                        {assessment.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-slate-500">
                                                    {new Date(assessment.updatedAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Link
                                                            href={`/cra?id=${assessment.id}`}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${isEditable
                                                                ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-blue-600'
                                                                : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                                                }`}
                                                        >
                                                            {isEditable ? (
                                                                <>
                                                                    <Edit className="w-3.5 h-3.5" />
                                                                    Edit
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Eye className="w-3.5 h-3.5" />
                                                                    View
                                                                </>
                                                            )}
                                                        </Link>
                                                        {assessment.status === 'DRAFT' && (
                                                            <DeleteButton id={assessment.id} />
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
