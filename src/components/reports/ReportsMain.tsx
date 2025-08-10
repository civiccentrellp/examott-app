"use client";
import React, { useState, useMemo } from "react";
import ReportsList from "./ReportsList";
import { useAllTests } from "@/hooks/tests/tests";
import type { ReportStatus } from "@/utils/tests/reports/reports";
import { hasRole } from "@/utils/auth/rbac";
import { useUser } from "@/context/userContext";

const ReportsMain: React.FC = () => {
    const { user, loading } = useUser();
    const [statusFilter, setStatusFilter] = useState<ReportStatus>("OPEN");
    const [selectedTest, setSelectedTest] = useState<string | null>(null);
    const { data: tests, isLoading } = useAllTests();

    return (
        <div className="h-screen ">
            <div className="flex flex-col sm:flex-row justify-between items-center px-2">
                <h1 className="text-xl sm:text-2xl font-medium mb-3 sm:mb-6 text-violet-900">Flagged Questions</h1>

                {/* Filters */}
                <div className="flex gap-2 mb-6 items-center">
                    {/* Status Toggle */}
                    <div className="w-60 flex items-center gap-2 bg-violet-100 rounded-full p-1">
                        <button
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition 
            ${statusFilter === "OPEN" ? "bg-violet-600 text-white shadow" : "text-violet-700 hover:bg-violet-200"}`}
                            onClick={() => setStatusFilter("OPEN")}
                        >
                            Reported
                        </button>
                        <button
                            className={`px-4 py-2 rounded-full text-sm font-semibold transition 
            ${statusFilter === "RESOLVED" ? "bg-violet-600 text-white shadow" : "text-violet-700 hover:bg-violet-200"}`}
                            onClick={() => setStatusFilter("RESOLVED")}
                        >
                            Resolved
                        </button>
                    </div>

                    {/* Test Dropdown */}
                    <select
                        value={selectedTest ?? ""}
                        onChange={(e) => setSelectedTest(e.target.value || null)}
                        disabled={isLoading}
                        className="px-4 py-1.5 rounded-lg border border-violet-300 text-violet-700 focus:outline-none focus:ring-2 
                        focus:ring-violet-400 bg-white shadow-sm text-sm w-40"
                    >
                        <option value="">All Tests</option>
                        {tests?.map((test) => (
                            <option key={test.id} value={test.id}>
                                {test.name}
                            </option>
                        ))}
                    </select>
                </div>

            </div>
            {/* Reports List */}
            <ReportsList statusFilter={statusFilter} testId={selectedTest} />
        </div>
    );
};

export default ReportsMain;
