'use client';
import React, { useEffect, useState } from 'react';
import { ChevronDoubleRight, ChevronDoubleLeft } from 'react-bootstrap-icons';
import FolderStructure from '../SideBar/FolderStructure';
import TestsPanel from '../TestsPanel';
import useFolderState from '@/utils/dbms/useFolderState';
import { useRouter } from 'next/navigation';

const TestsTab = () => {
  const folderState = useFolderState();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null);
  const [isCreatingTest, setIsCreatingTest] = useState(false);
  const [redirectToTestId, setRedirectToTestId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const shouldStart = sessionStorage.getItem('startCreateTest') === 'true';
      if (shouldStart) {
        setIsCreatingTest(true);
        sessionStorage.removeItem('startCreateTest');
      }
    }
  }, []);

  useEffect(() => {
    if (redirectToTestId) {
      router.push(`/dbms/test-form/${redirectToTestId}`);
    }
  }, [redirectToTestId, router]);

  return (
    <div className="flex flex-col md:flex-row h-[70vh] overflow-hidden bg-white shadow-sm border rounded">
        <div className={`transition-all transform ${isSidebarCollapsed ? '-translate-x-full hidden md:flex md:w-0' : 'translate-x-0 flex w-full md:w-fit'}`}>
          <FolderStructure
            {...folderState}
            selectedCourse={selectedCourse}
            setSelectedCourse={setSelectedCourse}
            tabType="VIDEOS"
          />
        </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-2">
          <button
            onClick={() => setIsSidebarCollapsed(prev => !prev)}
            className="px-2 py-2 border-2 border-dark hover:bg-gray-300 flex items-center justify-center rounded-md"
          >
            {isSidebarCollapsed ? <ChevronDoubleRight size={20} /> : <ChevronDoubleLeft size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-auto">
          <TestsPanel selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
        </div>
      </div>
    </div>
  );
};

export default TestsTab;
