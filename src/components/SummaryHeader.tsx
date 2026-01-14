import React from 'react';
import { AssessmentSummary } from '@/lib/types';
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, MinusCircle, FileQuestion } from 'lucide-react';
import { clsx } from 'clsx';

interface SummaryHeaderProps {
    summary: AssessmentSummary;
}

export function SummaryHeader({ summary }: SummaryHeaderProps) {
    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <SummaryCard
                label="Total Questions"
                value={summary.totalQuestions}
                icon={<FileQuestion className="w-5 h-5" />}
                className="bg-white border-slate-200 text-slate-600"
                iconColor="text-slate-400"
            />
            <SummaryCard
                label="Answered"
                value={summary.answeredCount}
                icon={<CheckCircle2 className="w-5 h-5" />}
                className="bg-blue-50/50 border-blue-100 text-blue-700"
                iconColor="text-blue-500"
            />
            <SummaryCard
                label="Yes"
                value={summary.yesCount}
                icon={<CheckCircle2 className="w-5 h-5" />}
                className="bg-emerald-50/50 border-emerald-100 text-emerald-700"
                iconColor="text-emerald-500"
            />
            <SummaryCard
                label="No"
                value={summary.noCount}
                icon={<XCircle className="w-5 h-5" />}
                className="bg-rose-50/50 border-rose-100 text-rose-700"
                iconColor="text-rose-500"
            />
            <SummaryCard
                label="N/A"
                value={summary.naCount}
                icon={<MinusCircle className="w-5 h-5" />}
                className="bg-slate-50/50 border-slate-100 text-slate-600"
                iconColor="text-slate-400"
            />
            <SummaryCard
                label="Needs Attention"
                value={summary.needsAttentionCount}
                icon={<AlertTriangle className="w-5 h-5" />}
                className={clsx(
                    "border-amber-200 text-amber-800",
                    summary.needsAttentionCount > 0
                        ? "bg-amber-50 shadow-sm ring-1 ring-amber-200/50"
                        : "bg-amber-50/30 opacity-70"
                )}
                iconColor="text-amber-500"
                highlight={summary.needsAttentionCount > 0}
            />
        </div>
    );
}

function SummaryCard({
    label,
    value,
    icon,
    className,
    iconColor,
    highlight,
}: {
    label: string;
    value: number;
    icon: React.ReactNode;
    className: string;
    iconColor: string;
    highlight?: boolean;
}) {
    return (
        <div
            className={clsx(
                "p-5 rounded-2xl border flex flex-col justify-between h-28 transition-all duration-300",
                "hover:shadow-md hover:-translate-y-0.5",
                className,
                highlight && "shadow-amber-100"
            )}
        >
            <div className="flex justify-between items-start">
                <span className="text-[11px] font-bold uppercase tracking-widest opacity-70">
                    {label}
                </span>
                <div className={clsx("p-1.5 rounded-lg bg-white/60 backdrop-blur-sm", iconColor)}>
                    {icon}
                </div>
            </div>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight">{value}</span>
            </div>
        </div>
    );
}
