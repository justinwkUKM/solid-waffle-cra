import React, { useMemo } from 'react';
import { AssessmentRow, AssessmentResponseNormalized } from '../lib/types';
import { Activity } from 'lucide-react';
import { clsx } from 'clsx';

interface AssessmentHealthWidgetProps {
    rows: AssessmentRow[];
    onFilterChange: (filter: 'ALL' | AssessmentResponseNormalized | 'NEEDS_ATTENTION' | 'HIGH_RISK' | 'ACTION_REQUIRED') => void;
}

export function AssessmentHealthWidget({ rows, onFilterChange }: AssessmentHealthWidgetProps) {
    const stats = useMemo(() => {
        const total = rows.length;
        if (total === 0) return { completion: 0, health: 100, counts: { answered: 0, unanswered: 0, highRisk: 0, needsAttention: 0 } };

        let answered = 0;
        let highRisk = 0;
        let needsAttention = 0;
        let healthDeduction = 0;

        rows.forEach(row => {
            if (row.isAnswered) answered++;
            if (row.needsAttention) needsAttention++;
            
            // High Risk: NO response with no mitigation
            if (row.responseNormalized === 'NO' && (!row.mitigationRemarks || row.mitigationRemarks.trim().length === 0)) {
                highRisk++;
                healthDeduction += 5; // Deduct 5 points for unmitigated risk
            } else if (row.responseNormalized === 'NO') {
                healthDeduction += 1; // Deduct 1 point for mitigated risk (still a risk)
            }
        });

        const completion = Math.round((answered / total) * 100);
        const health = Math.max(0, 100 - healthDeduction);

        return {
            completion,
            health,
            counts: {
                answered,
                unanswered: total - answered,
                highRisk,
                needsAttention
            }
        };
    }, [rows]);

    const getHealthColor = (score: number) => {
        if (score >= 90) return 'text-emerald-500';
        if (score >= 70) return 'text-amber-500';
        return 'text-rose-500';
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-border p-4 mb-6 flex flex-col md:flex-row gap-6 items-center justify-between sticky top-4 z-20 backdrop-blur-xl bg-white/90">
            
            {/* Health Score */}
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-16 h-16 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-100" />
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" 
                            strokeDasharray={175.9} 
                            strokeDashoffset={175.9 - (175.9 * stats.health) / 100} 
                            className={clsx("transition-all duration-1000 ease-out", getHealthColor(stats.health))} 
                        />
                    </svg>
                    <Activity className={clsx("absolute w-6 h-6", getHealthColor(stats.health))} />
                </div>
                <div>
                    <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Assessment Health</div>
                    <div className={clsx("text-2xl font-black tracking-tight", getHealthColor(stats.health))}>
                        {stats.health}%
                    </div>
                    <div className="text-xs text-slate-400">
                        {stats.health >= 90 ? 'Excellent' : stats.health >= 70 ? 'Needs Improvement' : 'Critical Risks Found'}
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="flex-1 w-full md:w-auto">
                <div className="flex justify-between text-xs mb-1.5">
                    <span className="font-medium text-slate-600">Completion Progress</span>
                    <span className="font-bold text-slate-900">{stats.completion}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                        className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${stats.completion}%` }}
                    ></div>
                </div>
                <div className="text-[10px] text-slate-400 mt-1">
                    {stats.counts.answered} of {rows.length} questions answered
                </div>
            </div>

            {/* Quick Actions / Filters */}
            <div className="flex gap-2 flex-wrap justify-end">
                <button 
                    onClick={() => onFilterChange('OTHER')}
                    className="flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 border border-border rounded-xl p-2.5 min-w-[80px] transition-all"
                >
                    <span className="text-lg font-bold text-slate-700">{stats.counts.unanswered}</span>
                    <span className="text-[10px] text-slate-500 font-medium">Unanswered</span>
                </button>

                <button 
                    onClick={() => onFilterChange('NEEDS_ATTENTION')}
                    className={clsx(
                        "flex flex-col items-center justify-center border rounded-xl p-2.5 min-w-[80px] transition-all",
                        stats.counts.needsAttention > 0 ? "bg-amber-50 border-amber-200 hover:bg-amber-100" : "bg-slate-50 border-border opacity-50"
                    )}
                >
                    <span className={clsx("text-lg font-bold", stats.counts.needsAttention > 0 ? "text-amber-600" : "text-slate-400")}>
                        {stats.counts.needsAttention}
                    </span>
                    <span className={clsx("text-[10px] font-medium", stats.counts.needsAttention > 0 ? "text-amber-600" : "text-slate-400")}>
                        Attention
                    </span>
                </button>

                <button 
                    onClick={() => onFilterChange('HIGH_RISK')}
                    className={clsx(
                        "flex flex-col items-center justify-center border rounded-xl p-2.5 min-w-[80px] transition-all",
                        stats.counts.highRisk > 0 ? "bg-rose-50 border-rose-200 hover:bg-rose-100" : "bg-slate-50 border-border opacity-50"
                    )}
                >
                    <span className={clsx("text-lg font-bold", stats.counts.highRisk > 0 ? "text-rose-600" : "text-slate-400")}>
                        {stats.counts.highRisk}
                    </span>
                    <span className={clsx("text-[10px] font-medium", stats.counts.highRisk > 0 ? "text-rose-600" : "text-slate-400")}>
                        High Risk
                    </span>
                </button>
            </div>
        </div>
    );
}
