'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ParsedCRAResult, AssessmentResponseNormalized } from '@/lib/types';
import { UploadCard } from '@/components/UploadCard';
import { SummaryHeader } from '@/components/SummaryHeader';
import { CloudDetailsPanel } from '@/components/CloudDetailsPanel';
import { AssessmentTable } from '@/components/AssessmentTable';
import { AssessmentHealthWidget } from '@/components/AssessmentHealthWidget';
import { Download, FileJson, RefreshCw, AlertCircle, Sparkles, FileSpreadsheet, Save, FolderOpen, X, Send, CheckCircle, XCircle, RotateCcw, MoreHorizontal, User, LogOut, HelpCircle, Loader2, AlertTriangle, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';
import { generateExcel } from '@/lib/excelGenerator';

import { DashboardCharts } from '@/components/DashboardCharts';
import { useSession, signOut } from 'next-auth/react';
import { ReviewActionBar } from '@/components/ReviewActionBar';

function CRAPageContent() {
    const { data: session } = useSession();
    const searchParams = useSearchParams();
    const router = useRouter();
    const assessmentId = searchParams.get('id');
    const mode = searchParams.get('mode'); // 'review' or undefined

    const [isUploading, setIsUploading] = useState(false);
    const [parsedResult, setParsedResult] = useState<ParsedCRAResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [currentStatus, setCurrentStatus] = useState<string>('DRAFT');
    const [assessmentTitle, setAssessmentTitle] = useState<string>('');
    const [tableFilter, setTableFilter] = useState<'ALL' | AssessmentResponseNormalized | 'NEEDS_ATTENTION' | 'HIGH_RISK' | 'ACTION_REQUIRED'>('ALL');

    // Load from DB if ID is present
    useEffect(() => {
        if (assessmentId) {
            fetchAssessment(assessmentId);
        }
    }, [assessmentId]);

    const fetchAssessment = async (id: string) => {
        setIsUploading(true);
        try {
            const res = await fetch(`/api/assessments?id=${id}`);
            if (!res.ok) throw new Error('Failed to load assessment');
            const data = await res.json();

            // If fetching a specific ID, the API returns an array with one item or the item itself depending on implementation.
            // Let's assume our API returns the item if ID is passed, or we filter.
            // Actually our previous API implementation for GET returns all user assessments. 
            // We should probably update the API to handle single ID fetch or just filter here for now if the list is small.
            // BUT, for security, we should really fetch just one. 
            // Let's assume we update the API or use the existing list for now.
            // Wait, the previous API implementation:
            // GET /api/assessments -> returns prisma.assessment.findMany(...)
            // It doesn't support ?id=... yet. I need to update the API too.
            // For now, let's fetch all and find. (Not efficient but works for MVP)

            const found = Array.isArray(data) ? data.find((a: any) => a.id === id) : data;

            if (found) {
                const parsed = JSON.parse(found.data);
                // Ensure the parsed result has the correct title from DB
                if (parsed.meta) {
                    parsed.meta.fileName = found.title;
                }
                // Inject reviewer feedback if present
                if (found.reviewerFeedback) {
                    parsed.assessment.reviewerFeedback = found.reviewerFeedback;
                }
                setParsedResult(parsed);
                setCurrentStatus(found.status);
                setAssessmentTitle(found.title);
            } else {
                setError('Assessment not found');
            }
        } catch (e) {
            console.error(e);
            setError('Failed to load assessment');
        } finally {
            setIsUploading(false);
        }
    };



    const handleUpload = async (file: File) => {
        setIsUploading(true);
        setError(null);
        setParsedResult(null);
        localStorage.removeItem('cra_parsed_result'); // Clear previous data on new upload

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/parse-cra', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to parse file');
            }

            setParsedResult(data as ParsedCRAResult);
            setCurrentStatus('DRAFT');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unexpected error occurred');
        } finally {
            setIsUploading(false);
        }
    };

    const handleStartManual = () => {
        setIsUploading(true);
        setError(null);
        setParsedResult(null);
        localStorage.removeItem('cra_parsed_result');

        // Simulate a short delay for better UX
        setTimeout(() => {
            Promise.all([
                import('@/lib/defaultQuestions'),
                import('@/lib/defaultCloudDetails')
            ]).then(([questionsModule, detailsModule]) => {
                const questions = questionsModule.DEFAULT_CRA_QUESTIONS;
                const defaultDetails = detailsModule.DEFAULT_CLOUD_DETAILS;

                const rows = questions.map((q, index) => ({
                    rowIndex: index + 2,
                    questionId: q.id,
                    sheetName: 'Manual Assessment',
                    questionText: q.question,
                    responseRaw: '',
                    responseNormalized: 'UNANSWERED' as const,
                    mitigationRemarks: '',
                    needsAttention: false,
                    isAnswered: false,
                    hasMitigation: false,
                    extra: {
                        'Risk Area': q.section
                    },
                    rationale: q.rationale,
                    example: q.example
                }));

                // Initialize cloud details as "filled" but with empty values so they show up
                const initialCloudDetails = defaultDetails.map(label => ({
                    section: 'Cloud Solution Details' as const,
                    label,
                    value: '', // Empty initially, user will fill
                    rowIndex: -1,
                    sheetName: 'Manual Assessment'
                }));

                const result: ParsedCRAResult = {
                    meta: {
                        fileName: 'Manual Assessment',
                        parsedAtISO: new Date().toISOString(),
                        sheetNames: ['Manual Assessment']
                    },
                    cloudSolutionDetails: {
                        allFields: initialCloudDetails,
                        filledFields: initialCloudDetails,
                        missingFields: []
                    },
                    assessment: {
                        allRows: rows,
                        summary: {
                            totalQuestions: rows.length,
                            answeredCount: 0,
                            yesCount: 0,
                            noCount: 0,
                            naCount: 0,
                            otherCount: 0,
                            unansweredCount: rows.length,
                            needsAttentionCount: 0
                        },
                        needsAttentionRows: [],
                        answeredRows: []
                    }
                };

                setParsedResult(result);
                setCurrentStatus('DRAFT');
                setAssessmentTitle('Manual Assessment'); // Initialize title state
                setIsUploading(false);
            });
        }, 600);
    };

    const handleDownloadJSON = () => {
        if (!parsedResult) return;
        const blob = new Blob([JSON.stringify(parsedResult, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `parsed-cra-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleReset = () => {
        setParsedResult(null);
        setError(null);
        localStorage.removeItem('cra_parsed_result');
        router.push('/cra'); // Clear query params
    };

    const handleRowUpdate = (rowIndex: number, field: 'response' | 'mitigation' | 'assessorComment', value: string) => {
        // Allow Assessor to update comments even if readOnly is true (which it is for assessors)
        if (!parsedResult) return;
        if (isReadOnly && field !== 'assessorComment') return;
        if (field === 'assessorComment' && !isAssessor) return; // Only assessor can update this

        setParsedResult((prev) => {
            if (!prev) return null;

            // Deep copy the rows to avoid mutating state directly
            // We need to be careful with deep cloning if the object is complex, 
            // but here we just need to clone the array and the specific row object we are modifying.
            const newRows = prev.assessment.allRows.map(r => ({ ...r }));
            const row = newRows.find((r) => r.rowIndex === rowIndex);

            if (row) {
                if (field === 'response') {
                    // Update response
                    row.responseRaw = value;

                    // Normalize
                    const upper = value.toUpperCase();
                    if (!value || value.trim() === '') {
                        row.responseNormalized = 'UNANSWERED';
                        row.isAnswered = false;
                    } else {
                        if (upper === 'YES') row.responseNormalized = 'YES';
                        else if (upper === 'NO') row.responseNormalized = 'NO';
                        else if (upper === 'NA' || upper === 'N/A') row.responseNormalized = 'NA';
                        else row.responseNormalized = 'OTHER';

                        row.isAnswered = true;
                    }
                } else if (field === 'mitigation') {
                    // Update mitigation
                    row.mitigationRemarks = value;
                } else if (field === 'assessorComment') {
                    // Update assessor comment
                    row.assessorComment = value;
                }

                // Re-calculate needsAttention
                // Needs attention if NO and no mitigation
                const isNo = row.responseNormalized === 'NO';
                const hasMitigation = !!row.mitigationRemarks && row.mitigationRemarks.trim().length > 0;
                row.needsAttention = isNo && !hasMitigation;
            }

            // Re-calculate summary
            const summary = {
                totalQuestions: newRows.length,
                answeredCount: newRows.filter((r) => r.responseNormalized !== 'UNANSWERED').length,
                yesCount: newRows.filter((r) => r.responseNormalized === 'YES').length,
                noCount: newRows.filter((r) => r.responseNormalized === 'NO').length,
                naCount: newRows.filter((r) => r.responseNormalized === 'NA').length,
                otherCount: newRows.filter((r) => r.responseNormalized === 'OTHER').length,
                unansweredCount: newRows.filter((r) => r.responseNormalized === 'UNANSWERED').length,
                needsAttentionCount: newRows.filter((r) => r.needsAttention).length,
            };

            return {
                ...prev,
                assessment: {
                    ...prev.assessment,
                    allRows: newRows,
                    summary,
                }
            };
        });
    };

    const [isAnalyzing, setIsAnalyzing] = useState(false);

    const handleAnalyze = async () => {
        if (!parsedResult) return;

        setIsAnalyzing(true);
        try {
            // Filter for rows that have a response but haven't been analyzed yet? 
            // For now, let's just analyze all answered rows to keep it simple.
            const allRowsToAnalyze = parsedResult.assessment.allRows.filter(r => r.responseNormalized !== 'UNANSWERED');

            if (allRowsToAnalyze.length === 0) {
                alert('No answered rows to analyze.');
                return;
            }

            // Process in chunks of 5 to simulate streaming and avoid timeouts
            const chunkSize = 5;
            for (let i = 0; i < allRowsToAnalyze.length; i += chunkSize) {
                const chunk = allRowsToAnalyze.slice(i, i + chunkSize);

                try {
                    const response = await fetch('/api/analyze-assessment', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ rows: chunk }),
                    });

                    const data = await response.json();

                    if (!response.ok) {
                        console.error('Chunk analysis failed', data.error);
                        continue; // Skip this chunk but keep going
                    }

                    // Update state incrementally
                    setParsedResult(prev => {
                        if (!prev) return null;
                        const newRows = prev.assessment.allRows.map(row => {
                            const analysis = data.results[row.rowIndex];
                            if (analysis) {
                                return { ...row, aiAnalysis: analysis };
                            }
                            return row;
                        });

                        return {
                            ...prev,
                            assessment: {
                                ...prev.assessment,
                                allRows: newRows
                            }
                        };
                    });

                } catch (chunkError) {
                    console.error('Error analyzing chunk', chunkError);
                }
            }

        } catch (err) {
            console.error(err);
            alert('Failed to start AI analysis.');
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleExportExcel = async () => {
        if (!parsedResult) return;
        try {
            const blob = await generateExcel(parsedResult);
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `cra-assessment-${Date.now()}.xlsx`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Failed to export Excel', e);
            alert('Failed to export Excel file.');
        }
    };

    const handleGenerateMitigation = async (rowIndex: number) => {
        if (!parsedResult || isReadOnly) return;
        const row = parsedResult.assessment.allRows.find(r => r.rowIndex === rowIndex);
        if (!row) return;

        try {
            // Optimistic update or loading state could be better, but for now just wait
            const response = await fetch('/api/generate-mitigation', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    question: row.questionText,
                    response: row.responseRaw || row.responseNormalized
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to generate mitigation');
            }

            // Update the row with the new mitigation
            handleRowUpdate(rowIndex, 'mitigation', data.mitigation);

        } catch (err) {
            console.error(err);
            alert('Failed to generate mitigation. Check console.');
        }
    };

    const handleAttachFile = async (rowIndex: number, file: File) => {
        if (!parsedResult || isReadOnly) return;

        // In a real app, upload to S3/Blob storage here.
        // For now, we'll just store metadata and maybe a small preview if needed.
        // We won't store full base64 in local storage to avoid quota issues, 
        // but we can keep it in memory state.

        const attachment = {
            name: file.name,
            size: file.size,
            type: file.type,
            // data: ... (skip base64 for now to be safe with localStorage)
        };

        setParsedResult(prev => {
            if (!prev) return null;
            const newRows = prev.assessment.allRows.map(row => {
                if (row.rowIndex === rowIndex) {
                    const currentAttachments = row.attachments || [];
                    return { ...row, attachments: [...currentAttachments, attachment] };
                }
                return row;
            });

            return {
                ...prev,
                assessment: {
                    ...prev.assessment,
                    allRows: newRows
                }
            };
        });
    };

    const handleCloudDetailUpdate = (label: string, value: string) => {
        if (isReadOnly) return;
        setParsedResult((prev) => {
            if (!prev) return null;

            const newFields = prev.cloudSolutionDetails.filledFields.map((field) => {
                if (field.label === label) {
                    return { ...field, value };
                }
                return field;
            });

            // Sync filename/title if Product Name changes
            let newMeta = prev.meta;
            if (label === 'PRODUCT NAME') {
                newMeta = { ...prev.meta, fileName: value };
            }

            return {
                ...prev,
                meta: newMeta,
                cloudSolutionDetails: {
                    ...prev.cloudSolutionDetails,
                    filledFields: newFields,
                    allFields: newFields // Update allFields as well since they are the same in manual mode
                }
            };
        });
    };

    // Determine Role and Permissions
    const userRole = session?.user?.role;
    const isAssessor = userRole === 'ASSESSOR';
    const isSubmitter = userRole === 'SUBMITTER' || !userRole;

    // Read-Only Logic
    const isReadOnly = isAssessor ? true : (
        currentStatus !== 'DRAFT' && currentStatus !== 'CHANGES_REQUESTED'
    );

    const handleTitleUpdate = (newTitle: string) => {
        if (isReadOnly) return;

        setAssessmentTitle(newTitle); // Update local state immediately

        setParsedResult((prev) => {
            if (!prev) return null;

            // Update meta
            const newMeta = { ...prev.meta, fileName: newTitle };

            // Update PRODUCT NAME field
            const newFields = prev.cloudSolutionDetails.filledFields.map((field) => {
                if (field.label === 'PRODUCT NAME') {
                    return { ...field, value: newTitle };
                }
                return field;
            });

            return {
                ...prev,
                meta: newMeta,
                cloudSolutionDetails: {
                    ...prev.cloudSolutionDetails,
                    filledFields: newFields,
                    allFields: newFields
                }
            };
        });
    };

    const [isSaving, setIsSaving] = useState(false);
    const [savedAssessments, setSavedAssessments] = useState<any[]>([]);
    const [showLoadModal, setShowLoadModal] = useState(false);

    const handleSaveAssessment = async (newStatus?: string, feedback?: string) => {
        if (!parsedResult) return;

        // Validation: Title (Product Name) is required
        // Use assessmentTitle state as the source of truth
        if (!assessmentTitle || assessmentTitle.trim() === '' || assessmentTitle === 'Untitled Assessment') {
            alert('Please enter a Product Name in the Cloud Solution Details section before saving.');
            return;
        }

        setIsSaving(true);
        try {
            const statusToSave = newStatus || currentStatus;
            const response = await fetch('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: assessmentId, // Update existing if ID present
                    title: assessmentTitle,
                    data: parsedResult,
                    status: statusToSave,
                    feedback: feedback // Pass feedback to API
                }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) {
                    alert('Please log in to save your assessment.');
                    return;
                }
                if (response.status === 409) {
                    alert(errorData.error || 'An assessment with this title already exists.');
                    return;
                }
                throw new Error(errorData.error || 'Failed to save');
            }

            setCurrentStatus(statusToSave);
            alert(`Assessment ${newStatus === 'SUBMITTED' ? 'submitted' : 'saved'} successfully!`);

            if (newStatus === 'SUBMITTED') {
                router.push('/submitter/dashboard');
            } else if (newStatus === 'APPROVED' || newStatus === 'REJECTED' || newStatus === 'CHANGES_REQUESTED') {
                router.push('/assessor/dashboard');
            }

        } catch (error) {
            console.error(error);
            alert('Failed to save assessment.');
        } finally {
            setIsSaving(false);
        }
    };

    const handleLoadClick = async () => {
        try {
            const res = await fetch('/api/assessments');
            if (res.ok) {
                const data = await res.json();
                setSavedAssessments(data);
                setShowLoadModal(true);
            } else if (res.status === 401) {
                alert('Please log in to load assessments.');
            } else {
                alert('Failed to fetch assessments.');
            }
        } catch (e) {
            console.error(e);
            alert('Error loading assessments.');
        }
    };

    const loadAssessment = (assessment: any) => {
        try {
            const parsed = JSON.parse(assessment.data);
            setParsedResult(parsed);
            setCurrentStatus(assessment.status);
            setAssessmentTitle(assessment.title);
            // Inject feedback into parsed result for display
            if (assessment.reviewerFeedback) {
                parsed.assessment.reviewerFeedback = assessment.reviewerFeedback;
            }
            setShowLoadModal(false);
            // Ideally update URL to include ID, but for now just load state
        } catch (e) {
            console.error(e);
            alert('Failed to parse saved assessment.');
        }
    };



    return (
        <div className="min-h-screen bg-secondary/30 font-sans text-foreground pb-20">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-border sticky top-0 z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {isAssessor && (
                            <Link href="/assessor/dashboard" className="text-slate-500 hover:text-slate-800 transition-colors p-1 hover:bg-slate-100 rounded-full" title="Back to Dashboard">
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                        )}
                        {parsedResult && !isReadOnly ? (
                            <input
                                type="text"
                                value={assessmentTitle}
                                onChange={(e) => handleTitleUpdate(e.target.value)}
                                className="text-lg font-semibold tracking-tight text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-blue-500 focus:outline-none px-1 transition-colors min-w-[200px]"
                                placeholder="Enter Assessment Name"
                            />
                        ) : (
                            <h1 className="text-lg font-semibold tracking-tight text-slate-700">
                                {assessmentTitle || parsedResult?.meta.fileName || 'Cloud Risk Assessment'}
                            </h1>
                        )}
                        {currentStatus && (
                            <span className={`text-xs font-bold px-2 py-1 rounded-full border ${currentStatus === 'APPROVED' ? 'bg-green-50 text-green-700 border-green-200' :
                                currentStatus === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                                    currentStatus === 'CHANGES_REQUESTED' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                        'bg-slate-100 text-slate-600 border-slate-200'
                                }`}>
                                {currentStatus}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {!assessmentId && (
                            <button
                                onClick={handleLoadClick}
                                className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                            >
                                <FolderOpen className="w-4 h-4" />
                                Load
                            </button>
                        )}

                        {parsedResult && (
                            <>
                                {/* Submitter Actions */}
                                {isSubmitter && !isReadOnly && (
                                    <>
                                        <button
                                            onClick={() => handleSaveAssessment(currentStatus)}
                                            disabled={isSaving}
                                            className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium"
                                        >
                                            <Save className="w-4 h-4" />
                                            {isSaving ? 'Saving...' : 'Save Draft'}
                                        </button>
                                        <button
                                            onClick={() => handleSaveAssessment('SUBMITTED')}
                                            disabled={isSaving}
                                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm"
                                        >
                                            <Send className="w-4 h-4" />
                                            Submit for Review
                                        </button>
                                    </>
                                )}

                                {/* Assessor Actions - Removed from Header */}
                                {isAssessor && null}
                            </>
                        )}
                    </div>

                    {parsedResult && (
                        <div className="flex items-center gap-3">
                            {/* Primary Actions */}
                            <button
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="bg-paynet-blue hover:bg-sky-600 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-sm hover:shadow-md hover:shadow-sky-500/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles className="w-4 h-4" />
                                        Analyze with AI
                                    </>
                                )}
                            </button>

                            {/* More Actions Dropdown */}
                            <div className="relative group">
                                <button className="text-sm text-slate-600 hover:text-blue-600 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors font-medium border border-transparent hover:border-blue-100">
                                    <MoreHorizontal className="w-4 h-4" />
                                    More
                                </button>

                                <div className="absolute right-0 top-full pt-2 w-48 hidden group-hover:block animate-in fade-in zoom-in-95 duration-200 z-[60]">
                                    <div className="bg-white rounded-xl shadow-xl border border-slate-100 p-1.5">
                                        {!assessmentId && (
                                            <button
                                                onClick={handleReset}
                                                className="w-full text-left text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                            >
                                                <RefreshCw className="w-4 h-4 text-slate-400" />
                                                New Upload
                                            </button>
                                        )}
                                        <button
                                            onClick={() => router.push('/submitter/dashboard')}
                                            className="w-full text-left text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <FolderOpen className="w-4 h-4 text-blue-600" />
                                            My Assessments
                                        </button>
                                        <button
                                            className="w-full text-left text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <FileSpreadsheet className="w-4 h-4 text-green-600" />
                                            Export Excel
                                        </button>
                                        <button
                                            onClick={handleDownloadJSON}
                                            className="w-full text-left text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors"
                                        >
                                            <FileJson className="w-4 h-4 text-amber-600" />
                                            Export JSON
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </header>
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {!parsedResult ? (
                    <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in zoom-in-95 duration-500">
                        <div className="text-center mb-10 max-w-lg space-y-4">
                            <h2 className="text-4xl font-bold text-foreground tracking-tight">
                                Cloud Risk Assessment
                            </h2>
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                Upload your CRA Excel workbook to instantly extract solution details and assessment responses with our intelligent parser.
                            </p>
                        </div>
                        <UploadCard onUpload={handleUpload} onStartManual={handleStartManual} isUploading={isUploading} error={error} />
                    </div>
                ) : (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">



                        {isReadOnly && currentStatus !== 'CHANGES_REQUESTED' && currentStatus !== 'REJECTED' && (
                            <div className="bg-slate-100 border border-slate-200 text-slate-700 px-4 py-3 rounded-lg flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 text-slate-500" />
                                <span className="font-medium">Read-Only Mode:</span>
                                <span>
                                    {isAssessor
                                        ? "You are reviewing this assessment."
                                        : "This assessment cannot be edited in its current status."}
                                </span>
                            </div>
                        )}

                        {/* Assessor Feedback Display */}
                        {parsedResult.assessment.reviewerFeedback && (currentStatus === 'REJECTED' || currentStatus === 'CHANGES_REQUESTED') && (
                            <div className={`rounded-xl p-4 border ${currentStatus === 'REJECTED' ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}`}>
                                <div className="flex items-start gap-3">
                                    {currentStatus === 'REJECTED' ? (
                                        <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                                    ) : (
                                        <AlertTriangle className="w-5 h-5 text-orange-600 mt-0.5" />
                                    )}
                                    <div>
                                        <h3 className={`font-bold ${currentStatus === 'REJECTED' ? 'text-red-900' : 'text-orange-900'}`}>
                                            {currentStatus === 'REJECTED' ? 'Assessment Rejected' : 'Changes Requested'}
                                        </h3>
                                        <p className={`mt-1 text-sm ${currentStatus === 'REJECTED' ? 'text-red-700' : 'text-orange-700'}`}>
                                            {parsedResult.assessment.reviewerFeedback}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Health Widget */}
                        <AssessmentHealthWidget
                            rows={parsedResult.assessment.allRows}
                            onFilterChange={setTableFilter}
                        />

                        {/* Summary Section */}
                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-3">
                                <SummaryHeader summary={parsedResult.assessment.summary} />
                            </div>
                            <div className="lg:col-span-1">
                                <DashboardCharts summary={parsedResult.assessment.summary} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-8">
                            {/* Cloud Solution Details */}
                            <section className="flex flex-col">
                                <CloudDetailsPanel
                                    filledFields={parsedResult.cloudSolutionDetails.filledFields}
                                    missingFields={parsedResult.cloudSolutionDetails.missingFields}
                                    onUpdate={handleCloudDetailUpdate}
                                    readOnly={isReadOnly}
                                />
                            </section>

                            {/* Assessment Table */}
                            <section className="flex flex-col h-[800px] min-h-0">
                                <AssessmentTable
                                    rows={parsedResult.assessment.allRows}
                                    onUpdateRow={handleRowUpdate}
                                    onGenerateMitigation={handleGenerateMitigation}
                                    onAttachFile={handleAttachFile}
                                    readOnly={isReadOnly}
                                    isAssessor={isAssessor}
                                    filter={tableFilter}
                                    onFilterChange={setTableFilter}
                                />
                            </section>
                        </div>
                    </div>
                )}
                {/* End of Main Content */}
            </main>

            {/* Load Modal */}
            {
                showLoadModal && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-4 border-b border-border flex items-center justify-between bg-slate-50">
                                <h3 className="font-bold text-lg text-slate-800">Load Assessment</h3>
                                <button onClick={() => setShowLoadModal(false)} className="text-slate-400 hover:text-slate-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-0 overflow-y-auto flex-1">
                                {savedAssessments.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground">
                                        No saved assessments found.
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-100">
                                        {savedAssessments.map((item) => (
                                            <button
                                                key={item.id}
                                                onClick={() => loadAssessment(item)}
                                                className="w-full text-left p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                                            >
                                                <div>
                                                    <div className="font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                                                        {item.title}
                                                    </div>
                                                    <div className="text-xs text-slate-500 mt-1">
                                                        Last updated: {new Date(item.updatedAt).toLocaleString()}
                                                    </div>
                                                </div>
                                                <div className="text-xs font-medium px-2 py-1 rounded bg-slate-100 text-slate-600">
                                                    {item.status}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )
            }
            {/* Assessor Review Action Bar */}
            {
                isAssessor && currentStatus === 'SUBMITTED' && (
                    <ReviewActionBar
                        onApprove={() => handleSaveAssessment('APPROVED')}
                        onReject={(feedback) => handleSaveAssessment('REJECTED', feedback)}
                        onRequestChanges={(feedback) => handleSaveAssessment('CHANGES_REQUESTED', feedback)}
                    />
                )
            }
        </div >
    );
}

export default function CRAPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <CRAPageContent />
        </Suspense>
    );
}
