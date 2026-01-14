'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Shield, User, Users, Search, CheckCircle, XCircle } from 'lucide-react';
import { SignOutButton } from '@/components/SignOutButton';

interface UserData {
    id: string;
    name: string | null;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminUsersPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<UserData[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            // Ideally check role here or let API handle 403
            fetchUsers();
        }
    }, [status, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            if (res.ok) {
                const data = await res.json();
                setUsers(data);
            } else {
                if (res.status === 403) {
                    setError('Access Denied. You must be an Admin to view this page.');
                } else {
                    setError('Failed to fetch users.');
                }
            }
        } catch (e) {
            setError('An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            });

            if (res.ok) {
                // Optimistic update
                setUsers(prev => prev.map(u =>
                    u.id === userId ? { ...u, role: newRole } : u
                ));
            } else {
                alert('Failed to update role');
            }
        } catch (e) {
            alert('Error updating role');
        }
    };

    const filteredUsers = users.filter(user =>
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (status === 'loading' || isLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <div className="text-red-500 font-medium text-lg">{error}</div>
                <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Go Home</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">


            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">User Management</h2>
                            <p className="text-sm text-slate-500">Manage user access and roles</p>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-64"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                                <tr>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Joined</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                                    <User className="w-4 h-4" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-900">{user.name || 'No Name'}</div>
                                                    <div className="text-slate-500 text-xs">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                                user.role === 'ASSESSOR' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                                    'bg-blue-50 text-blue-700 border-blue-200'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-500">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="text-xs border border-slate-200 rounded-lg px-2 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                disabled={user.email === session?.user?.email} // Prevent changing own role to lock yourself out
                                            >
                                                <option value="SUBMITTER">Submitter</option>
                                                <option value="ASSESSOR">Assessor</option>
                                                <option value="ADMIN">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
}
