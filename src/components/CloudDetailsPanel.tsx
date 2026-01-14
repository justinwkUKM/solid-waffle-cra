'use client';

import React, { useState, useMemo } from 'react';
import { CloudDetailField } from '@/lib/types';
import { Search, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { clsx } from 'clsx';

interface CloudDetailsPanelProps {
    filledFields: CloudDetailField[];
    missingFields?: CloudDetailField[];
    onUpdate?: (label: string, value: string) => void;
    readOnly?: boolean;
}

export function CloudDetailsPanel({ filledFields, missingFields = [], onUpdate, readOnly = false }: CloudDetailsPanelProps) {
    const [isExpanded, setIsExpanded] = useState(true);
    const [search, setSearch] = useState('');
    const [showMissing, setShowMissing] = useState(false);
    const [copiedValue, setCopiedValue] = useState<string | null>(null);

    const filteredFilled = useMemo(() => {
        if (!search) return filledFields;
        const lower = search.toLowerCase();
        return filledFields.filter(
            (f) => f.label.toLowerCase().includes(lower) || f.value.toLowerCase().includes(lower)
        );
    }, [filledFields, search]);

    const filteredMissing = useMemo(() => {
        if (!search) return missingFields;
        const lower = search.toLowerCase();
        return missingFields.filter((f) => f.label.toLowerCase().includes(lower));
    }, [missingFields, search]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedValue(text);
        setTimeout(() => setCopiedValue(null), 2000);
    };

    return (
        <div className={clsx(
            "bg-white rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden transition-all duration-300",
            isExpanded ? "h-[500px]" : "h-auto"
        )}>
            <div
                className="p-6 border-b border-border bg-gradient-to-r from-white to-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <button
                        className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsExpanded(!isExpanded);
                        }}
                    >
                        {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-500" /> : <ChevronDown className="w-5 h-5 text-slate-500" />}
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cloud Solution Details</h2>
                        <p className="text-xs text-slate-500 mt-1">Key information extracted from the assessment</p>
                    </div>
                </div>

                {isExpanded && (
                    <div className="relative w-full sm:w-64 group" onClick={(e) => e.stopPropagation()}>
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-paynet-blue transition-colors" />
                        <input
                            type="text"
                            placeholder="Search details..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-full bg-white focus:outline-none focus:ring-2 focus:ring-paynet-blue/20 focus:border-paynet-blue transition-all shadow-sm"
                        />
                    </div>
                )}
            </div>

            {isExpanded && (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/50">
                    {filteredFilled.length === 0 && filteredMissing.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-40 text-slate-400">
                            <Search className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">No details found matching your search.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredFilled.map((field, idx) => (
                            <div
                                key={`${field.label}-${idx}`}
                                className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-paynet-blue/30 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-1 h-full bg-paynet-blue/0 group-hover:bg-paynet-blue transition-all"></div>
                                <div className="flex flex-col gap-2">
                                    <div className="flex justify-between items-start">
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider truncate pr-2" title={field.label}>
                                            {field.label}
                                        </span>
                                        <button
                                            onClick={() => handleCopy(field.value)}
                                            className="opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-paynet-blue"
                                            title="Copy value"
                                        >
                                            {copiedValue === field.value ? (
                                                <Check className="w-3 h-3 text-paynet-green" />
                                            ) : (
                                                <Copy className="w-3 h-3" />
                                            )}
                                        </button>
                                    </div>
                                    {onUpdate && !readOnly ? (
                                        <textarea
                                            value={field.value}
                                            onChange={(e) => onUpdate(field.label, e.target.value)}
                                            className="text-sm text-slate-700 font-medium w-full border-none focus:ring-0 p-0 resize-none bg-transparent placeholder:text-slate-300 focus:bg-slate-50 rounded"
                                            placeholder="Click to enter value..."
                                            rows={Math.max(1, Math.ceil(field.value.length / 40))}
                                        />
                                    ) : (
                                        <span className="text-sm text-slate-700 font-medium break-words leading-relaxed">
                                            {field.value}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {missingFields.length > 0 && (
                        <div className="mt-8">
                            <button
                                onClick={() => setShowMissing(!showMissing)}
                                className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors mb-4"
                            >
                                {showMissing ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                {showMissing ? 'Hide' : 'Show'} {missingFields.length} Missing Fields
                            </button>

                            {showMissing && (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3 opacity-75">
                                    {filteredMissing.map((field, idx) => (
                                        <div key={`missing-${idx}`} className="p-3 bg-slate-100 rounded-lg border border-slate-200 border-dashed">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate" title={field.label}>{field.label}</span>
                                                <span className="text-xs text-slate-400 italic">Not provided</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
