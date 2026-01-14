import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/auth';

export async function GET(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.user.id,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: 20, // Limit to last 20 notifications
        });

        return NextResponse.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    const session = await auth();

    if (!session || !session.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id, read } = await req.json();

        if (id) {
            // Mark single notification as read
            const notification = await prisma.notification.update({
                where: {
                    id,
                    userId: session.user.id, // Ensure ownership
                },
                data: {
                    read: true,
                },
            });
            return NextResponse.json(notification);
        } else if (read === true) {
            // Mark all as read
            await prisma.notification.updateMany({
                where: {
                    userId: session.user.id,
                    read: false,
                },
                data: {
                    read: true,
                },
            });
            return NextResponse.json({ message: 'All marked as read' });
        }

        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    } catch (error) {
        console.error('Error updating notification:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
