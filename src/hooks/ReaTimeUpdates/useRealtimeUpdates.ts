"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import getSocket from "@/utils/io/socket";
import { showGlobalLoader, hideGlobalLoader } from "@/context/LoaderContext";

export const useRealtimeUpdates = () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const eventMap: Record<string, string[][]> = {
      reported: [["reportedQuestions"]],
      resolved: [["reportedQuestions"], ["resolvedReports"]],
      dismissed: [["reportedQuestions"], ["resolvedReports"]],
      "test-submitted": [["testResult"], ["studentTestStatus"]],
    };

    Object.entries(eventMap).forEach(([event, queries]) => {
      socket.on(event, async () => {
        showGlobalLoader();
        // wait until all queries finish (React Query returns promises)
        await Promise.all(
          queries.map((q) => queryClient.invalidateQueries({ queryKey: q }))
        );
        hideGlobalLoader();
      });
    });

    return () => {
      Object.keys(eventMap).forEach((event) => socket.off(event));
    };
  }, [queryClient]);
};
