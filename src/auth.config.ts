import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const isOnCRA = nextUrl.pathname.startsWith('/cra');
            const isOnAssessor = nextUrl.pathname.startsWith('/assessor');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');

            if (isOnAdmin) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users
            }

            if (isOnAssessor) {
                const role = auth?.user?.role?.toUpperCase();
                if (isLoggedIn && role === 'ASSESSOR') return true;
                return false; // Redirect unauthorized users
            }

            if (isOnCRA) {
                if (isLoggedIn) return true;
                return false; // Redirect unauthenticated users to login page
            }
            return true;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
                session.user.role = token.role as string;
            }
            return session;
        },
        async jwt({ token, user }) {
            if (user) {
                token.sub = user.id;
                token.role = (user as any).role;
            }
            return token;
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
