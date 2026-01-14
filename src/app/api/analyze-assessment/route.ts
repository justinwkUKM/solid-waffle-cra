import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AssessmentRow, AiAnalysisResult } from '@/lib/types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export async function POST(req: NextRequest) {
    if (!GEMINI_API_KEY) {
        return NextResponse.json(
            { error: 'GEMINI_API_KEY is not configured in environment variables.' },
            { status: 500 }
        );
    }

    try {
        const { rows } = await req.json();

        if (!rows || !Array.isArray(rows)) {
            return NextResponse.json(
                { error: 'Invalid input: "rows" must be an array.' },
                { status: 400 }
            );
        }

        // Limit batch size to prevent timeouts or rate limits
        const rowsToAnalyze = rows.slice(0, 50); // Analyze first 50 for now, or implement pagination

        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

        const results: Record<number, AiAnalysisResult> = {};

        // We can process in parallel, but let's limit concurrency to avoid rate limits
        // For simplicity in this MVP, we'll do a Promise.all with a small batch
        // Or even better, send a single prompt with multiple items if the context window allows.
        // Given 1.5 Flash has a huge context, let's try sending a batch prompt.

        const prompt = `
        You are a Cloud Security Expert performing a pre-assessment of a Cloud Risk Assessment (CRA).
        Analyze each of the following Question and Response pairs.
        
        For each pair, determine if the Response satisfies the security control implied by the Question.
        
        Return a JSON object where the keys are the "rowIndex" and the values are objects with:
        - "opinion": "PASS" (if response is satisfactory), "FAIL" (if response is unsatisfactory or indicates a risk), or "INFO" (if response is N/A, unclear, or needs more info).
        - "reasoning": A brief (1 sentence) explanation of your opinion.
        - "confidence": A number between 0 and 1 indicating your confidence.
        - "requiredAction": If the opinion is FAIL or INFO, or if the response implies a need for evidence (e.g. "screenshot", "policy doc"), specify what action or proof is needed. If no action is needed, return null.

        Input Data:
        ${JSON.stringify(rowsToAnalyze.map(r => ({
            rowIndex: r.rowIndex,
            question: r.questionText,
            response: r.responseRaw,
            mitigation: r.mitigationRemarks
        })))}

        Output JSON only. Do not include markdown formatting.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysisData = JSON.parse(jsonStr);

        return NextResponse.json({ results: analysisData });

    } catch (error: any) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json(
            { error: `Failed to perform AI analysis: ${error.message || error}` },
            { status: 500 }
        );
    }
}
