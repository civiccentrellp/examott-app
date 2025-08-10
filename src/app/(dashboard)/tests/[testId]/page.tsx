'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import TestsPage from '@/components/tests/TestAttempt/TestsPage';

const Page = () => {
  const params = useParams();
  const testId = params?.testId as string;

  if (!testId) return <div className="text-center text-red-500">Invalid Test ID</div>;

  return <TestsPage testId={testId} />;
};

export default Page;
