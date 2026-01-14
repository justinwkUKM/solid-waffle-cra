import React from 'react';
import { Search, Filter, HelpCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { FILTER_TYPES, FilterType } from '../lib/constants';
import { AssessmentResponseNormalized } from '../lib/types';

interface AssessmentHeaderProps {
    itemCount: number;
    filter: FilterType | AssessmentResponseNormalized;
    setFilter: (filter: FilterType | AssessmentResponseNormalized) => void;
    search: string;
    setSearch: (search: string) => void;
    reviewMode: boolean;
    setReviewMode: (mode: boolean) => void;
}

export function AssessmentHeader({
    itemCount,
    filter,
    setFilter,
    search,
    setSearch,
    reviewMode,
    setReviewMode
}: AssessmentHeaderProps) {
    return (
        <div className="p-4 border-b border-border flex flex-col sm:flex-row gap-4 justify-between items-center bg-secondary/30">
            <div className="flex items-center gap-3">
                <h2 className="font-bold text-foreground tracking-tight">Assessment</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white border border-border text-muted-foreground shadow-sm">
                    {itemCount} items
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                {/* Review Mode Toggle */}
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setReviewMode(!reviewMode)}
                        className={clsx(
                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                            reviewMode
                                ? "bg-rose-50 border-rose-200 text-rose-700 shadow-sm"
                                : "bg-white border-border text-muted-foreground hover:bg-slate-50"
                        )}
                    >
                        <div className={clsx(
                            "w-2 h-2 rounded-full",
                            reviewMode ? "bg-rose-500 animate-pulse" : "bg-slate-300"
                        )} />
                        Review Mode
                    </button>
                    <div className="relative group/tooltip">
                        <HelpCircle className="w-4 h-4 text-slate-400 hover:text-primary cursor-help transition-colors" />
                        <div className="absolute right-0 top-8 w-72 p-4 bg-slate-800 text-white text-xs rounded-xl shadow-xl opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-50 pointer-events-none">
                            <div className="font-bold text-sm mb-2 text-slate-200">Review Mode</div>
                            <p className="mb-2 text-slate-300 leading-relaxed">
                                Filters the view to focus on high-risk items.
                            </p>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-bold text-emerald-400 block mb-0.5">For Submitters:</span>
                                    <span className="text-slate-400">Highlights unanswered questions and missing mitigations before submission.</span>
                                </div>
                                <div>
                                    <span className="font-bold text-rose-400 block mb-0.5">For Assessors:</span>
                                    <span className="text-slate-400">Focuses on non-compliant items ("NO" responses) and AI-flagged risks.</span>
                                </div>
                            </div>
                            {/* Arrow */}
                            <div className="absolute -top-1 right-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="relative flex-1 sm:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search questions..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-border rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                    />
                </div>

                {/* Filter */}
                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-border shadow-sm">
                    <Filter className="w-3.5 h-3.5 text-muted-foreground ml-2" />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value as any)}
                        className="text-sm border-none focus:ring-0 text-foreground font-medium py-0.5 pl-1 pr-8 cursor-pointer bg-transparent"
                    >
                        <option value={FILTER_TYPES.ALL}>All Responses</option>
                        <option value={FILTER_TYPES.NEEDS_ATTENTION}>Needs Attention</option>
                        <option value={FILTER_TYPES.HIGH_RISK}>High Risk (No Mitigation)</option>
                        <option value={FILTER_TYPES.ACTION_REQUIRED}>Action Required (AI)</option>
                        <option value={FILTER_TYPES.YES}>Yes</option>
                        <option value={FILTER_TYPES.NO}>No</option>
                        <option value={FILTER_TYPES.NA}>N/A</option>
                        <option value={FILTER_TYPES.OTHER}>Other/Unanswered</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
