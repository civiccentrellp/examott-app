'use client';

import { useRealtimeUpdates } from "@/hooks/ReaTimeUpdates/useRealtimeUpdates";

export function RealtimeWrapper() {
  useRealtimeUpdates(); 
  return null; 
}
