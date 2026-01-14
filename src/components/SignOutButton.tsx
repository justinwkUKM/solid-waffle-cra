'use client';

import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

export function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-slate-400 hover:text-red-600 transition-colors"
            title="Sign Out"
        >
            <LogOut className="w-4 h-4" />
        </button>
    );
}
