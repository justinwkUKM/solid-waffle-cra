import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const json = await request.json();
        const { id, title, data, status } = json;

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If ID is provided, update existing
        if (id) {
            // Check if assessment exists and user has permission
            const existing = await prisma.assessment.findUnique({
                where: { id },
            });

            if (!existing) {
                return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
            }

            // Permission check:
            // Submitter can update if they own it.
            // Assessor can update status (and maybe data if we allow annotation).
            // For now, let's allow update if owner OR assessor.
            const isOwner = existing.userId === user.id;
            const isAssessor = user.role === 'ASSESSOR' || user.role === 'ADMIN';

            if (!isOwner && !isAssessor) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            // Status check for Submitters:
            // Can only update if DRAFT or CHANGES_REQUESTED
            if (isOwner && !isAssessor) {
                if (existing.status !== 'DRAFT' && existing.status !== 'CHANGES_REQUESTED') {
                    // Unless they are just saving without status change? 
                    // But usually saving implies editing.
                    // Let's restrict editing to DRAFT and CHANGES_REQUESTED.
                    // Exception: If they are submitting (status change to SUBMITTED), that's allowed from DRAFT/CHANGES_REQUESTED.
                    // If status is APPROVED/REJECTED/SUBMITTED, they shouldn't edit.
                    // But wait, if status is SUBMITTED, they shouldn't edit.
                    // So check existing status.
                    if (existing.status === 'SUBMITTED' || existing.status === 'APPROVED' || existing.status === 'REJECTED') {
                        return NextResponse.json({ error: 'Cannot edit submitted or finalized assessment' }, { status: 403 });
                    }
                }
            }



            const updated = await prisma.assessment.update({
                where: { id },
                data: {
                    title,
                    data: JSON.stringify(data),
                    status: status || existing.status,
                    reviewerFeedback: json.feedback, // Update feedback
                },
            });

            // Notification Logic
            if (status && status !== existing.status) {
                const link = `/cra?id=${updated.id}`;

                if (status === 'SUBMITTED') {
                    // Notify all Assessors
                    const assessors = await prisma.user.findMany({
                        where: { role: { in: ['ASSESSOR', 'ADMIN'] } }
                    });

                    if (assessors.length > 0) {
                        await prisma.notification.createMany({
                            data: assessors.map(assessor => ({
                                userId: assessor.id,
                                title: 'New Assessment Submitted',
                                message: `${user.name || user.email} has submitted "${updated.title}" for review.`,
                                type: 'INFO',
                                link: link
                            }))
                        });
                    }
                } else if (['APPROVED', 'REJECTED', 'CHANGES_REQUESTED'].includes(status)) {
                    // Notify Submitter
                    let title = 'Assessment Update';
                    let message = `Your assessment "${updated.title}" has been updated to ${status}.`;
                    let type = 'INFO';

                    if (status === 'APPROVED') {
                        title = 'Assessment Approved';
                        message = `Great news! Your assessment "${updated.title}" has been approved.`;
                        type = 'SUCCESS';
                    } else if (status === 'REJECTED') {
                        title = 'Assessment Rejected';
                        message = `Your assessment "${updated.title}" was rejected. Please review the feedback.`;
                        type = 'ERROR';
                    } else if (status === 'CHANGES_REQUESTED') {
                        title = 'Changes Requested';
                        message = `Action required: Changes have been requested for "${updated.title}".`;
                        type = 'WARNING';
                    }

                    await prisma.notification.create({
                        data: {
                            userId: existing.userId,
                            title,
                            message,
                            type,
                            link
                        }
                    });
                }
            }
            return NextResponse.json(updated);
        } else {
            // Create new
            // Check for duplicate title
            const existingTitle = await prisma.assessment.findFirst({
                where: {
                    userId: user.id,
                    title: title,
                },
            });

            if (existingTitle) {
                return NextResponse.json({ error: 'An assessment with this title already exists.' }, { status: 409 });
            }

            const assessment = await prisma.assessment.create({
                data: {
                    title,
                    data: JSON.stringify(data),
                    status: status || 'DRAFT',
                    userId: user.id,
                },
            });
            return NextResponse.json(assessment);
        }

    } catch (error: any) {
        console.error('Failed to save assessment:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const isAssessor = user.role === 'ASSESSOR' || user.role === 'ADMIN';

        if (id) {
            // Fetch single assessment
            const assessment = await prisma.assessment.findUnique({
                where: { id },
            });

            if (!assessment) {
                return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
            }

            // Access control
            if (!isAssessor && assessment.userId !== user.id) {
                return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
            }

            return NextResponse.json(assessment);
        } else {
            // Fetch list
            let whereClause: any = {};

            if (!isAssessor) {
                // Submitters only see their own
                whereClause.userId = user.id;
            }
            // Assessors see ALL (no filter)

            const assessments = await prisma.assessment.findMany({
                where: whereClause,
                orderBy: { updatedAt: 'desc' },
                include: {
                    user: {
                        select: { name: true, email: true } // Include submitter info for assessors
                    }
                }
            });

            return NextResponse.json(assessments);
        }
    } catch (error) {
        console.error('Failed to fetch assessments:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'Assessment ID required' }, { status: 400 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const assessment = await prisma.assessment.findUnique({
            where: { id },
        });

        if (!assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        // Permission check:
        // Only owner can delete.
        if (assessment.userId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Status check:
        // Only DRAFT can be deleted.
        if (assessment.status !== 'DRAFT') {
            return NextResponse.json({ error: 'Only DRAFT assessments can be deleted' }, { status: 400 });
        }

        await prisma.assessment.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Failed to delete assessment:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
