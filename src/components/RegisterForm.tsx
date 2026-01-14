'use client';

import { useActionState } from 'react';
import { register } from '@/lib/actions';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Link from 'next/link';

export function RegisterForm() {
    const [state, dispatch, isPending] = useActionState(register, undefined);

    return (
        <form action={dispatch} className="space-y-4 w-full max-w-sm">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
                    Name
                </label>
                <input
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    id="name"
                    type="text"
                    name="name"
                    placeholder="John Doe"
                    required
                />
            </div>
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
                {state && state !== 'User created successfully. Please log in.' && (
                    <>
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <p className="text-sm text-red-500">{state}</p>
                    </>
                )}
                {state === 'User created successfully. Please log in.' && (
                    <>
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <p className="text-sm text-green-500">{state}</p>
                    </>
                )}
            </div>
            <button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                aria-disabled={isPending}
                disabled={isPending}
            >
                {isPending ? 'Creating account...' : 'Sign Up'}
            </button>
            <div className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{' '}
                <Link href="/login" className="text-blue-600 hover:underline">
                    Log in
                </Link>
            </div>
        </form>
    );
}
