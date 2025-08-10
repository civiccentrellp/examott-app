"use client";
import { useEffect } from "react";
import ReportsMain from "@/components/reports/ReportsMain";
import { setReportsLastVisit } from "@/utils/lastVisit";

export default function Page() {
  useEffect(() => {
    setReportsLastVisit();
  }, []);
  return <ReportsMain />;
}
