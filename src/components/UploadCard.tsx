'use client';

import React, { useCallback, useState } from 'react';
import { Upload, FileSpreadsheet, Loader2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface UploadCardProps {
    onUpload: (file: File) => void;
    onStartManual?: () => void;
    isUploading: boolean;
    error?: string | null;
}

export function UploadCard({ onUpload, onStartManual, isUploading, error }: UploadCardProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const file = e.dataTransfer.files[0];
            if (file) onUpload(file);
        },
        [onUpload]
    );

    const handleFileChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) onUpload(file);
        },
        [onUpload]
    );

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={clsx(
                    'relative border-2 border-dashed rounded-2xl p-16 transition-all duration-300 ease-out text-center cursor-pointer group overflow-hidden',
                    isDragging
                        ? 'border-primary bg-primary/5 scale-[1.02] shadow-xl shadow-primary/10'
                        : 'border-border hover:border-primary/50 hover:bg-slate-50/50 hover:shadow-lg hover:shadow-slate-200/50',
                    isUploading && 'opacity-50 pointer-events-none grayscale'
                )}
            >
                <input
                    type="file"
                    accept=".xlsx"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    disabled={isUploading}
                />

                {/* Decorative background elements */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="relative z-0 flex flex-col items-center gap-6">
                    <div className={clsx(
                        "p-5 rounded-2xl shadow-sm ring-1 ring-inset transition-all duration-300",
                        isDragging ? "bg-primary text-white ring-primary shadow-primary/30 scale-110" : "bg-white text-slate-400 ring-slate-100 group-hover:text-primary group-hover:ring-primary/20 group-hover:shadow-md group-hover:scale-105"
                    )}>
                        {isUploading ? (
                            <Loader2 className="w-10 h-10 animate-spin" />
                        ) : (
                            <Upload className="w-10 h-10" />
                        )}
                    </div>

                    <div className="space-y-2">
                        <h3 className="text-xl font-bold text-foreground tracking-tight">
                            {isUploading ? 'Parsing Workbook...' : 'Upload CRA Workbook'}
                        </h3>
                        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                            Drag and drop your Excel file here, or click to browse.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground bg-secondary/50 px-4 py-1.5 rounded-full border border-border/50 backdrop-blur-sm">
                        <FileSpreadsheet className="w-3.5 h-3.5" />
                        <span>Accepts .xlsx only (Max 10MB)</span>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-100 rounded-xl flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2 shadow-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="mt-8 flex items-center justify-center gap-4">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Or</span>
                <div className="h-px bg-border flex-1"></div>
            </div>

            <div className="mt-6 flex justify-center">
                <button
                    onClick={onStartManual}
                    disabled={isUploading}
                    className="group relative inline-flex items-center justify-center gap-2 px-6 py-3 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-paynet-blue hover:border-paynet-blue/30 transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <FileSpreadsheet className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    Start Manual Assessment
                </button>
            </div>
        </div>
    );
}
