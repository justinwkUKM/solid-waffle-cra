'use client';

import { useActionState } from 'react';
import { authenticate } from '@/lib/actions';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

export function LoginForm() {
    const [errorMessage, dispatch, isPending] = useActionState(
        authenticate,
        undefined,
    );

    return (
        <form action={dispatch} className="space-y-4 w-full max-w-sm">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                    Email
                </label>
                <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="email"
                    type="email"
                    name="email"
                    placeholder="user@example.com"
                    required
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                    Password
                </label>
                <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="password"
                    type="password"
                    name="password"
                    placeholder="••••••"
                    required
                    minLength={6}
                />
            </div>
            <div className="flex items-end space-x-1" aria-live="polite" aria-atomic="true">
                {errorMessage && (
                    <>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    </>
                )}
            </div>
            <button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                aria-disabled={isPending}
                disabled={isPending}
            >
                {isPending ? 'Logging in...' : 'Log in'}
            </button>
            <div className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{' '}
                <Link href="/register" className="text-blue-600 hover:underline">
                    Sign up
                </Link>
            </div>
        </form>
    );
}
