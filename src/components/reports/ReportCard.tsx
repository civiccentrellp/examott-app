"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import {
    useResolveReportedQuestion,
    useDismissReportedQuestion,
} from "@/hooks/tests/reports/useReports";
import { Pencil } from "lucide-react";
import ReadOnlyTiptapRenderer from "../ui/ReadOnlyTiptapRenderer";
import VisibilityCheck from "../VisibilityCheck";
import { useUser } from "@/context/userContext";

type ReportCardProps = { report: any };

const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
    const { user, loading } = useUser();
    const router = useRouter();
    const [showFullDesc, setShowFullDesc] = useState(false);

    const resolveMutation = useResolveReportedQuestion();
    const dismissMutation = useDismissReportedQuestion();

    const handleResolve = async () => {
        const result = await Swal.fire({
            title: "Resolve Report",
            text: "Please enter resolution remarks",
            input: "text",
            inputPlaceholder: "Enter remarks...",
            showCancelButton: true,
            confirmButtonText: "Resolve",
            confirmButtonColor: "#5923c7ff",
            preConfirm: (remarks) => {
                if (!remarks) {
                    Swal.showValidationMessage("Remarks are required!");
                }
                return remarks;
            },
        });

        if (result.isConfirmed && result.value) {
            resolveMutation.mutate({ reportId: report.id, resolutionRemarks: result.value });
        }
    };

    const handleDismiss = async () => {
        const result = await Swal.fire({
            title: "Dismiss Report",
            text: "This will dismiss the report. Do you want to continue?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Dismiss",
            confirmButtonColor: "#F59E0B",
        });

        if (result.isConfirmed) {
            dismissMutation.mutate(report.id);
        }
    };

    const handleEditQuestion = () => {
        const q = report.childQuestion || report.question;
        if (!q) return;
        const editUrl =
            q.type === "COMPREHENSIVE"
                ? `/dbms/question-form?type=${q.type}&questionId=${q.id}&editMode=paragraph`
                : `/dbms/question-form?type=${q.type}&questionId=${q.id}`;
        router.push(editUrl);
    };

    const renderedQuestion = report.childQuestion || report.question;
    const options = report.childQuestion?.options?.length
        ? report.childQuestion.options
        : report.question?.options || [];

    const isResolved = !!report?.resolved || !!report?.resolutionRemarks;

    return (
        <div className="w-full bg-white border border-violet-200/50 shadow-md rounded-2xl p-6 
            flex flex-col md:flex-row gap-6 transition transform hover:shadow-lg hover:scale-[1.01]">

            {/* Left Section */}
            <div className="flex-1 space-y-4">
                <ReadOnlyTiptapRenderer
                    jsonContent={renderedQuestion?.question || {}}
                    truncate={!showFullDesc}
                    truncateChars={100}
                    triggerKey={showFullDesc.toString()}
                    className="text-gray-800 text-xs sm:text-base leading-relaxed"
                />

                {Array.isArray(options) && options.length > 0 && (
                    <div
                        className={`transition-all duration-500 ease-in-out overflow-hidden 
                        ${showFullDesc ? "max-h-[500px] opacity-100 mt-3" : "max-h-0 opacity-0"}`}
                    >
                        {options.map((option: any) => (
                            <label key={option.id} className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    checked={option.correct || option.id === renderedQuestion?.selectedOptionId}
                                    readOnly
                                    className="h-4 w-4 text-violet-600 border-gray-300 rounded"
                                />
                                <p className="text-xs sm:text-base">{option.value || option.text}</p>
                            </label>
                        ))}
                    </div>
                )}

                <button
                    onClick={() => setShowFullDesc((prev) => !prev)}
                    className="mt-2 text-violet-600 text-xs sm:text-sm font-medium hover:underline"
                >
                    {showFullDesc ? "View Less" : "View More"}
                </button>

                <div className="flex justify-between items-start border-t pt-3 text-xs sm:text-sm">
                    <p>
                        <span className="font-semibold text-violet-700">Report:</span> {report.reason}
                    </p>
                </div>

                {/* Metadata */}
                <VisibilityCheck user={user} check="student" checkType="role" invert>
                    <div className="flex justify-between items-start text-xs sm:text-sm">
                        <div>
                            <p className="font-medium truncate">{report.attempt?.test?.name || "Unknown"}</p>
                            {report.section?.name && (
                                <p className="text-sm text-gray-500">{report.section.name}</p>
                            )}
                        </div>
                        <div className="text-right">
                            <p className="font-semibold">{report.reportedByUser?.name}</p>
                            <p className="text-xs text-gray-500">{report.reportedByUser?.email}</p>
                            <p className="text-xs text-gray-500 mt-1">
                                {new Date(report.createdAt).toLocaleDateString()}{" "}
                                {new Date(report.createdAt).toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                </VisibilityCheck>

            </div>

            <div className="w-full md:w-64 flex flex-col justify-center gap-2 border-l md:pl-4">
                {isResolved ? (
                    <div className="p-3 rounded-lg bg-violet-50 text-sm">
                        <p className="font-semibold text-violet-700">Resolved Remarks:</p>
                        <p className="text-gray-700 mt-1">
                            {report.resolutionRemarks || "No remarks provided."}
                        </p>
                    </div>
                ) : (
                    <VisibilityCheck user={user} check="student" checkType="role" invert>
                        <button
                            onClick={handleEditQuestion}
                            className="px-4 py-2 text-sm rounded-full border border-violet-300 text-violet-700 hover:bg-violet-50 transition"
                        >
                            Edit Question
                        </button>
                        <button
                            onClick={handleDismiss}
                            disabled={dismissMutation.isPending}
                            className="px-4 py-2 text-sm rounded-full border border-violet-300 text-violet-700 hover:bg-violet-50 disabled:opacity-50 transition"
                        >
                            {dismissMutation.isPending ? "Dismissing..." : "Dismiss Report"}
                        </button>
                        <button
                            onClick={handleResolve}
                            disabled={resolveMutation.isPending}
                            className="px-4 py-2 text-sm rounded-full bg-gradient-to-r from-violet-500 to-violet-600 text-white shadow 
                hover:shadow-lg hover:scale-105 disabled:opacity-50 transition"
                        >
                            {resolveMutation.isPending ? "Resolving..." : "Resolve"}
                        </button>
                    </VisibilityCheck>
                )}
            </div>

        </div>
    );
};

export default ReportCard;
