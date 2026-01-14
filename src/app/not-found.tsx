'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileWarning, ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
    const [incidentId, setIncidentId] = useState<string>('');

    useEffect(() => {
        setIncidentId(Math.random().toString(36).substring(7).toUpperCase());
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full text-center space-y-8 relative overflow-hidden">

                {/* Background Decoration */}
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-purple-400 to-blue-400"></div>
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-rose-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                {/* Icon Animation */}
                <div className="relative inline-block">
                    <div className="absolute inset-0 bg-rose-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative bg-white p-4 rounded-full shadow-lg border border-rose-100">
                        <ShieldAlert className="w-16 h-16 text-rose-500" />
                    </div>
                </div>

                <div className="space-y-2 relative z-10">
                    <h1 className="text-8xl font-black text-slate-900 tracking-tighter">
                        4<span className="text-rose-500">0</span>4
                    </h1>
                    <h2 className="text-2xl font-bold text-slate-900">
                        Compliance Breach Detected
                    </h2>
                    <p className="text-slate-600 font-medium max-w-sm mx-auto leading-relaxed">
                        The resource you are attempting to access has been classified as <span className="font-bold text-slate-800">non-existent</span> or <span className="font-bold text-slate-800">restricted</span>.
                    </p>
                </div>

                {/* Decorative Code Block */}
                <div className="bg-slate-900 rounded-xl p-5 text-left text-sm font-mono text-emerald-400 shadow-inner overflow-hidden relative group mx-auto max-w-sm border border-slate-800">
                    <div className="absolute top-0 right-0 p-2 opacity-50">
                        <FileWarning className="w-4 h-4" />
                    </div>
                    <div className="space-y-1.5">
                        <p><span className="text-rose-400 font-bold">Error:</span> PAGE_NOT_FOUND</p>
                        <p><span className="text-blue-400 font-bold">Status:</span> CRITICAL</p>
                        <p><span className="text-purple-400 font-bold">Action:</span> INITIATE_REDIRECT</p>
                        <p className="animate-pulse">_</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2 relative z-10">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-slate-900/20"
                    >
                        <Home className="w-4 h-4" />
                        Return to Safety
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-slate-700 font-medium border border-slate-200 hover:bg-slate-50 transition-all hover:border-slate-300"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                </div>

                {incidentId && (
                    <div className="text-xs text-slate-500 pt-4 border-t border-slate-100 mt-6 font-medium">
                        Incident ID: <span className="font-mono text-slate-700 font-bold">{incidentId}</span>
                    </div>
                )}
            </div>
        </div>
    );
}
