import { LoginForm } from '@/components/LoginForm';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginPage() {
    const session = await auth();
    if (session?.user) {
        redirect('/login-redirect');
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Log In</h1>
                <LoginForm />
            </div>
        </main>
    );
}
