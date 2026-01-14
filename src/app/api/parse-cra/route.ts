import { NextRequest, NextResponse } from 'next/server';
import { parseCRA } from '@/lib/craParser';

// Simple in-memory rate limiter
// Map<IP, { count: number, resetTime: number }>
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 10; // 10 requests per minute

function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const record = rateLimitMap.get(ip);

    if (!record) {
        rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return false;
    }

    if (now > record.resetTime) {
        record.count = 1;
        record.resetTime = now + RATE_LIMIT_WINDOW;
        return false;
    }

    if (record.count >= MAX_REQUESTS) {
        return true;
    }

    record.count++;
    return false;
}

export async function POST(req: NextRequest) {
    // Rate Limiting
    const ip = req.headers.get('x-forwarded-for') || 'unknown';
    if (isRateLimited(ip)) {
        return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
        );
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validation
        // 1. Size <= 10MB
        const MAX_SIZE = 10 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            return NextResponse.json(
                { error: 'File size exceeds 10MB limit.' },
                { status: 400 }
            );
        }

        // 2. Extension .xlsx
        if (!file.name.endsWith('.xlsx')) {
            return NextResponse.json(
                { error: 'Invalid file type. Only .xlsx files are accepted.' },
                { status: 400 }
            );
        }

        // Convert to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Parse
        const result = await parseCRA(buffer, file.name);

        return NextResponse.json(result);
    } catch (error) {
        console.error('Parsing error:', error);
        return NextResponse.json(
            { error: 'Failed to parse the uploaded file. Please ensure it is a valid CRA Excel file.' },
            { status: 500 }
        );
    }
}
