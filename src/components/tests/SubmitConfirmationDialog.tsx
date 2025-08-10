'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, HelpCircle, Flag } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SubmitConfirmationDialogProps {
    open: boolean;
    stats: {
        total: number;
        answered: number;
        unanswered: number;
        marked: number;
        answeredAndMarked: number;
    } | null;
    onCancel: () => void;
    onConfirm: () => void;
}

const SubmitConfirmationDialog: React.FC<SubmitConfirmationDialogProps> = ({
    open,
    stats,
    onCancel,
    onConfirm,
}) => {
    if (!open || !stats) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg space-y-6 border border-gray-200 animate-slide-up">
                <h2 className="text-2xl font-bold text-center text-gray-800">
                    Confirm Test Submission !
                </h2>
                <p className="text-center text-gray-500 text-sm m-1">
                    Please review your progress before submitting your test.
                </p>

                <ul className="space-y-3 text-base">
                    <li className="flex items-center justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-gray-700 mx-3">
                            <HelpCircle size={18} />
                            Total Questions
                        </span>
                        <span className="font-semibold mx-3">{stats.total}</span>
                    </li>
                    <li className="flex items-center justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-green-700 mx-3">
                            <CheckCircle size={18} />
                            Answered
                        </span>
                        <span className="font-semibold mx-3">{stats.answered}</span>
                    </li>
                    <li className="flex items-center justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-red-600 mx-3">
                            <AlertCircle size={18} />
                            Unanswered
                        </span>
                        <span className="font-semibold mx-3">{stats.unanswered}</span>
                    </li>
                    <li className="flex items-center justify-between border-b pb-2">
                        <span className="flex items-center gap-2 text-yellow-600 mx-3">
                            <Flag size={18} />
                            Marked for Review
                        </span>
                        <span className="font-semibold mx-3">{stats.marked}</span>
                    </li>
                    <li className="flex items-center justify-between">
                        <span className="flex items-center gap-2 text-green-600 mx-3">
                            <span className="relative">
                                <CheckCircle size={18} className="text-green-600" />
                                <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-400 rounded-full border border-white shadow" />
                            </span>
                            Answered & Marked
                        </span>
                        <span className="font-semibold mx-3">{stats.answeredAndMarked}</span>
                    </li>
                </ul>

                <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                    <Button
                        variant="outline"
                        className="w-full sm:w-1/2"
                        onClick={onCancel}
                    >
                        Back to Test
                    </Button>
                    <Button
                        variant="outline"
                        className="w-full sm:w-1/2 bg-red-600 hover:bg-red-700 text-white"
                        onClick={onConfirm}
                    >
                        Submit Test
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SubmitConfirmationDialog;
