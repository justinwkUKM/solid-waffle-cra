import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY is not configured.' },
            { status: 500 }
        );
    }

    try {
        const { question, response } = await req.json();

        if (!question || !response) {
            return NextResponse.json(
                { error: 'Missing question or response.' },
                { status: 400 }
            );
        }

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const prompt = `
        You are a Cloud Security Expert.
        The following security control was NOT met:
        
        Question: "${question}"
        User Response: "${response}"
        
        Provide a concise, professional mitigation plan or remediation step that the user can take to address this gap.
        Keep it under 3 sentences.
        Return only the text of the mitigation plan.
        `;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return NextResponse.json({ mitigation: text.trim() });

    } catch (error: any) {
        console.error('Mitigation Generation Error:', error);
        return NextResponse.json(
            { error: `Failed to generate mitigation: ${error.message || error}` },
            { status: 500 }
        );
    }
}
