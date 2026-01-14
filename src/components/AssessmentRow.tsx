import React from 'react';
import { AssessmentRow as AssessmentRowType, AssessmentResponseNormalized } from '../lib/types';
import { RESPONSE_TYPES, AI_OPINIONS } from '../lib/constants';
import { AlertCircle, CheckCircle, XCircle, HelpCircle, Sparkles, Paperclip, Upload } from 'lucide-react';
import { clsx } from 'clsx';

interface AssessmentRowProps {
    row: AssessmentRowType;
    onUpdateRow: (rowIndex: number, field: 'response' | 'mitigation' | 'assessorComment', value: string) => void;
    onGenerateMitigation: (rowIndex: number) => Promise<void>;
    onAttachFile: (rowIndex: number, file: File) => Promise<void>;
    readOnly?: boolean;
    isAssessor?: boolean;
}

export function AssessmentRow({ row, onUpdateRow, onGenerateMitigation, onAttachFile, readOnly = false, isAssessor = false }: AssessmentRowProps) {
    const getStatusIcon = (response: AssessmentResponseNormalized) => {
        switch (response) {
            case RESPONSE_TYPES.YES: return <CheckCircle className="w-4 h-4 text-emerald-500" />;
            case RESPONSE_TYPES.NO: return <XCircle className="w-4 h-4 text-rose-500" />;
            case RESPONSE_TYPES.NA: return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
            default: return null;
        }
    };

    const handleAttachClick = () => {
        const input = document.getElementById(`file-input-${row.rowIndex}`) as HTMLInputElement;
        if (input) input.click();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            await onAttachFile(row.rowIndex, e.target.files[0]);
        }
    };

    return (
        <tr
            className={clsx(
                "group transition-all duration-200",
                row.needsAttention
                    ? "bg-amber-50/30 hover:bg-amber-50/60"
                    : "hover:bg-secondary/40"
            )}
        >
            <td className="p-4 text-xs font-medium text-slate-600 align-top pt-5">
                {row.extra?.['Risk Area'] || '-'}
            </td>
            <td className="p-4 text-xs text-muted-foreground text-center font-mono align-top pt-5">
                {row.questionId}
            </td>
            <td className="p-4 text-sm text-foreground align-top">
                <div className="flex items-start gap-2">
                    <div className="prose prose-sm max-w-none text-foreground/90 leading-relaxed">
                        {row.questionText}
                    </div>
                    {/* Contextual Tooltip */}
                    {(row.rationale || row.example) && (
                        <div className="relative group/tooltip shrink-0 mt-0.5">
                            <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-paynet-blue cursor-help transition-colors" />
                            <div className="absolute left-0 top-6 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none">
                                {row.rationale && (
                                    <div className="mb-2">
                                        <span className="font-bold text-slate-300 block mb-0.5">Rationale:</span>
                                        {row.rationale}
                                    </div>
                                )}
                                {row.example && (
                                    <div>
                                        <span className="font-bold text-slate-300 block mb-0.5">Example:</span>
                                        <span className="text-emerald-300">{row.example}</span>
                                    </div>
                                )}
                                {/* Arrow */}
                                <div className="absolute -top-1 left-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Extra columns display */}
                {row.extra && Object.keys(row.extra).filter(k => k !== 'Risk Area').length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {Object.entries(row.extra)
                            .filter(([k]) => k !== 'Risk Area')
                            .map(([k, v]) => (
                                <div key={k} className="text-[10px] bg-secondary px-2 py-1 rounded-md border border-border text-muted-foreground font-medium">
                                    <span className="text-foreground/70">{k}:</span> {v}
                                </div>
                            ))}
                    </div>
                )}
            </td>
            <td className="p-4 align-top">
                <div className="flex flex-col gap-2">
                    <div className="relative">
                        <select
                            value={row.responseNormalized === RESPONSE_TYPES.OTHER || row.responseNormalized === RESPONSE_TYPES.UNANSWERED ? RESPONSE_TYPES.OTHER : row.responseNormalized}
                            onChange={(e) => onUpdateRow(row.rowIndex, 'response', e.target.value)}
                            className={clsx(
                                "w-full text-sm border rounded-lg px-3 py-2 pr-8 appearance-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-medium shadow-sm",
                                row.needsAttention
                                    ? "border-amber-300 bg-amber-50 text-amber-900 focus:ring-amber-500/20 focus:border-amber-500"
                                    : "border-border bg-white text-foreground hover:border-primary/30"
                            )}
                        >
                            <option value={RESPONSE_TYPES.YES}>Yes</option>
                            <option value={RESPONSE_TYPES.NO}>No</option>
                            <option value={RESPONSE_TYPES.NA}>N/A</option>
                            <option value={RESPONSE_TYPES.OTHER}>Other / Unanswered</option>
                        </select>
                        {readOnly && <div className="absolute inset-0 bg-transparent cursor-not-allowed" title="Read-only" />}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            {getStatusIcon(row.responseNormalized)}
                        </div>
                    </div>

                    {/* Show raw value if it doesn't match the normalized one perfectly */}
                    {row.responseRaw && !['Yes', 'No', 'N/A', 'NA'].includes(row.responseRaw) && (
                        <div className="text-[10px] text-muted-foreground px-1 font-mono bg-secondary/50 rounded px-1.5 py-0.5 w-fit max-w-full truncate" title={row.responseRaw}>
                            Raw: "{row.responseRaw}"
                        </div>
                    )}
                </div>
            </td>
            <td className="p-4 align-top">
                {row.aiAnalysis ? (
                    <div className="flex flex-col gap-2">
                        <span className={clsx(
                            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border w-fit",
                            row.aiAnalysis.opinion === AI_OPINIONS.PASS && "bg-emerald-50 text-emerald-700 border-emerald-200",
                            row.aiAnalysis.opinion === AI_OPINIONS.FAIL && "bg-rose-50 text-rose-700 border-rose-200",
                            row.aiAnalysis.opinion === AI_OPINIONS.INFO && "bg-blue-50 text-blue-700 border-blue-200"
                        )}>
                            {row.aiAnalysis.opinion === AI_OPINIONS.PASS && <CheckCircle className="w-3 h-3" />}
                            {row.aiAnalysis.opinion === AI_OPINIONS.FAIL && <XCircle className="w-3 h-3" />}
                            {row.aiAnalysis.opinion === AI_OPINIONS.INFO && <HelpCircle className="w-3 h-3" />}
                            {row.aiAnalysis.opinion}
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                            {row.aiAnalysis.reasoning}
                        </p>
                        {row.aiAnalysis.requiredAction && (
                            <div className="mt-2">
                                <div className="text-[11px] font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100 flex items-start gap-1.5 mb-2">
                                    <AlertCircle className="w-3 h-3 shrink-0 mt-0.5" />
                                    <span>Action: {row.aiAnalysis.requiredAction}</span>
                                </div>

                                {/* Attachments */}
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {row.attachments?.map((att, i) => (
                                        <div key={i} className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[10px] px-2 py-1 rounded-full border border-slate-200">
                                            <Paperclip className="w-3 h-3" />
                                            <span className="max-w-[100px] truncate" title={att.name}>{att.name}</span>
                                        </div>
                                    ))}
                                </div>

                                <input
                                    type="file"
                                    id={`file-input-${row.rowIndex}`}
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                <button
                                    onClick={handleAttachClick}
                                    disabled={readOnly}
                                    className={clsx(
                                        "text-[10px] flex items-center gap-1 font-medium border px-2 py-1 rounded transition-colors",
                                        readOnly
                                            ? "text-slate-400 border-slate-200 cursor-not-allowed bg-slate-50"
                                            : "text-primary hover:text-primary/80 border-primary/20 hover:bg-primary/5"
                                    )}
                                >
                                    <Upload className="w-3 h-3" />
                                    Attach Proof
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-xs text-muted-foreground/50 italic">Not analyzed</span>
                )}
            </td>
            <td className="p-4 align-top">
                <div className={clsx(
                    "relative flex flex-col rounded-xl border transition-all duration-200 bg-white group/input overflow-hidden",
                    row.needsAttention
                        ? "border-amber-300 shadow-sm ring-1 ring-amber-100"
                        : "border-slate-200 hover:border-slate-300 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/5"
                )}>
                    <textarea
                        value={row.mitigationRemarks || ''}
                        onChange={(e) => onUpdateRow(row.rowIndex, 'mitigation', e.target.value)}
                        placeholder={row.example ? `e.g., ${row.example}` : "Add mitigation or remarks..."}
                        className="w-full text-sm border-none focus:ring-0 bg-transparent px-3 py-3 min-h-[80px] resize-y placeholder:text-slate-400"
                    />

                    {/* Bottom Actions Bar */}
                    {!readOnly && (
                        <div className="px-2 pb-2 flex justify-between items-center min-h-[28px]">
                            {row.needsAttention && (!row.mitigationRemarks || row.mitigationRemarks.length < 20) ? (
                                <button
                                    onClick={() => onGenerateMitigation(row.rowIndex)}
                                    className="flex items-center gap-1.5 text-[10px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded-md transition-colors"
                                    title="Generate mitigation suggestion using AI"
                                >
                                    <Sparkles className="w-3 h-3" />
                                    AI Suggestion
                                </button>
                            ) : <div></div>}
                        </div>
                    )}

                    {readOnly && <div className="absolute inset-0 bg-slate-50/50 cursor-not-allowed" title="Read-only" />}

                    {/* Alert Icon for Needs Attention */}
                    {row.needsAttention && (
                        <div className="absolute right-2 top-2 pointer-events-none">
                            <div className="bg-amber-100 text-amber-600 rounded-full p-0.5" title="Needs Attention">
                                <AlertCircle className="w-3 h-3" />
                            </div>
                        </div>
                    )}
                </div>
            </td>
            <td className="p-4 align-top">
                {isAssessor ? (
                    <textarea
                        value={row.assessorComment || ''}
                        onChange={(e) => onUpdateRow(row.rowIndex, 'assessorComment', e.target.value)}
                        placeholder="Add assessor remarks..."
                        className="w-full text-sm border border-border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-h-[80px] resize-y bg-white shadow-sm placeholder:text-muted-foreground/50"
                    />
                ) : (
                    <div className="text-sm text-slate-600 min-h-[20px] whitespace-pre-wrap">
                        {row.assessorComment || <span className="text-slate-400 italic">No remarks</span>}
                    </div>
                )}
            </td>
        </tr>
    );
}
