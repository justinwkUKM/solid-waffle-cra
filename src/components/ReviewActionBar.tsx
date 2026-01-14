'use client';

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertTriangle, MessageSquare } from 'lucide-react';

interface ReviewActionBarProps {
    onApprove: () => void;
    onReject: (feedback: string) => void;
    onRequestChanges: (feedback: string) => void;
}

export function ReviewActionBar({ onApprove, onReject, onRequestChanges }: ReviewActionBarProps) {
    const [showModal, setShowModal] = useState(false);
    const [actionType, setActionType] = useState<'REJECT' | 'CHANGES_REQUESTED' | null>(null);
    const [feedback, setFeedback] = useState('');

    const handleActionClick = (type: 'REJECT' | 'CHANGES_REQUESTED') => {
        setActionType(type);
        setFeedback('');
        setShowModal(true);
    };

    const handleSubmit = () => {
        if (actionType === 'REJECT') {
            onReject(feedback);
        } else if (actionType === 'CHANGES_REQUESTED') {
            onRequestChanges(feedback);
        }
        setShowModal(false);
    };

    return (
        <>
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 shadow-lg z-50 animate-in slide-in-from-bottom-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-full">
                            <MessageSquare className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900">Assessor Review Mode</h3>
                            <p className="text-xs text-slate-500">Please review the assessment and provide a verdict.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => handleActionClick('CHANGES_REQUESTED')}
                            className="flex items-center gap-2 px-4 py-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors font-medium"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            Request Changes
                        </button>
                        <button
                            onClick={() => handleActionClick('REJECT')}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors font-medium"
                        >
                            <XCircle className="w-4 h-4" />
                            Reject
                        </button>
                        <button
                            onClick={onApprove}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold shadow-sm"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Approve
                        </button>
                    </div>
                </div>
            </div>

            {/* Feedback Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">
                                {actionType === 'CHANGES_REQUESTED' ? 'Request Changes' : 'Reject Assessment'}
                            </h3>
                            <p className="text-slate-600 mb-4 text-sm">
                                {actionType === 'CHANGES_REQUESTED'
                                    ? 'Please specify what needs to be fixed. The submitter will be notified.'
                                    : 'Please provide a reason for rejection. This action cannot be undone.'}
                            </p>
                            <textarea
                                value={feedback}
                                onChange={(e) => setFeedback(e.target.value)}
                                className="w-full h-32 p-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                                placeholder="Enter your feedback here..."
                                autoFocus
                            />
                        </div>
                        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3 border-t border-slate-100">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!feedback.trim()}
                                className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors ${!feedback.trim()
                                        ? 'bg-slate-300 cursor-not-allowed'
                                        : actionType === 'CHANGES_REQUESTED'
                                            ? 'bg-orange-600 hover:bg-orange-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                    }`}
                            >
                                {actionType === 'CHANGES_REQUESTED' ? 'Send Request' : 'Reject Assessment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
