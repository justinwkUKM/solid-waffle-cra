import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { LogOut, User } from 'lucide-react';
import { NotificationBell } from '@/components/NotificationBell';

export async function Header() {
    const session = await auth();

    return (
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link href="/" className="font-bold text-xl text-slate-900 flex items-center gap-2">
                        {/* Use the PayNet logo as requested */}
                        <img src="/paynet-logo/PayNet_idMP2sqDgs_0.svg" alt="PayNet Logo" className="h-8" />
                    </Link>
                    <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                        <Link href="/cra" className="hover:text-blue-600 transition-colors">Assessment</Link>
                        <Link
                            href={session?.user?.role?.toUpperCase() === 'ASSESSOR' || session?.user?.role?.toUpperCase() === 'ADMIN' ? '/assessor/dashboard' : '/submitter/dashboard'}
                            className="hover:text-blue-600 transition-colors"
                        >
                            Dashboard
                        </Link>
                        {session?.user?.role === 'ADMIN' && (
                            <Link href="/admin/users" className="hover:text-blue-600 transition-colors">
                                Admin Console
                            </Link>
                        )}
                    </nav>
                </div>

                <div className="flex items-center gap-4">
                    {session?.user ? (
                        <div className="flex items-center gap-4">
                            <NotificationBell />
                            <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
                                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                                    <User className="w-4 h-4" />
                                </div>
                                <span className="hidden sm:inline">{session.user.name || session.user.email}</span>
                            </div>
                            <form
                                action={async () => {
                                    'use server';
                                    await signOut();
                                }}
                            >
                                <button className="text-sm text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1">
                                    <LogOut className="w-4 h-4" />
                                    <span className="hidden sm:inline">Sign Out</span>
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div className="flex items-center gap-3 text-sm font-medium">
                            <Link href="/login" className="text-slate-600 hover:text-slate-900">Log in</Link>
                            <Link href="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">Sign up</Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
