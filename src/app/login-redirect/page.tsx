import { auth } from '@/auth';
import { redirect } from 'next/navigation';

export default async function LoginRedirectPage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    if (session.user.role?.toUpperCase() === 'ASSESSOR') {
        redirect('/assessor/dashboard');
    } else {
        redirect('/submitter/dashboard');
    }
}
