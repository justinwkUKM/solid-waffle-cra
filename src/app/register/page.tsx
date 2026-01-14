import { RegisterForm } from '@/components/RegisterForm';

export default function RegisterPage() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
            <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">Create Account</h1>
                <RegisterForm />
            </div>
        </main>
    );
}
