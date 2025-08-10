"use client";
import React from "react";
import {
    useAllReportedQuestions,
    useAllResolvedReports,
    useReportsByUser,
    useResolvedReportsByUser,
} from "@/hooks/tests/reports/useReports";
import ReportCard from "./ReportCard";
import type { ReportStatus, Report } from "@/utils/tests/reports/reports.ts";
import { useUser } from "@/context/userContext";  // <-- using context
import { hasRole } from "@/utils/auth/rbac";

type ReportsListProps = {
    statusFilter: ReportStatus;
    testId: string | null;
};

const ReportsList: React.FC<ReportsListProps> = ({ statusFilter, testId }) => {
    const { user } = useUser();

    const isStudent = hasRole(user, "student");
    
    // Fetch reports based on user role
    const { data: reported } = isStudent
        ? useReportsByUser()
        : useAllReportedQuestions();

    const { data: resolved } = isStudent
        ? useResolvedReportsByUser()
        : useAllResolvedReports();

    let data: any[] = [];

    if (statusFilter === "OPEN") {
        data = reported || [];
    } else {
        data =
            resolved?.filter((r: Report) =>
                statusFilter === "DISMISSED"
                    ? r.resolutionRemarks === "Dismissed without changes"
                    : r.resolutionRemarks !== "Dismissed without changes"
            ) || [];
    }

    const filtered =
        data?.filter((r: any) => (testId ? r.attempt?.test?.id === testId : true)) || [];

    if (!data) return <p>Loading...</p>;
    if (filtered.length === 0)
        return <p className="p-4">No reports found.</p>;

    return (
        <div className="flex flex-col gap-2 overflow-y-auto max-h-[80vh] pb-32 sm:pb-0">
            {filtered.map((report) => (
                <ReportCard key={report.id} report={report} />
            ))}
        </div>
    );
};

export default ReportsList;
