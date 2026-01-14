import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (currentUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json(users);
    } catch (error) {
        console.error('Failed to fetch users:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(request: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email },
    });

    if (currentUser?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    try {
        const json = await request.json();
        const { userId, role } = json;

        if (!userId || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate role
        const validRoles = ['SUBMITTER', 'ASSESSOR', 'ADMIN'];
        if (!validRoles.includes(role)) {
            return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: { role },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            }
        });

        return NextResponse.json(updatedUser);

    } catch (error) {
        console.error('Failed to update user role:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
