'use client';

import { useParams } from 'next/navigation';
import React from 'react';
import TestResultPage from '@/components/tests/TestAttempt/TestResultPage';

const Page = () => {
  const { attemptId } = useParams();

  if (!attemptId) {
    return <div className="text-center text-red-500">Invalid Attempt ID</div>;
  }

  return <TestResultPage attemptId={attemptId as string} />;
};

export default Page;
