'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';
import SectionsOverview from './SectionsOverview';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { TestSection } from '@/utils/tests/test';
import { ChevronDoubleLeft, ChevronDoubleRight } from 'react-bootstrap-icons';

interface InstructionsScreenProps {
  testName: string;
  duration: number;
  instructions?: any;
  onStart: () => void;
  loading?: boolean;
  showPanel: boolean;
  togglePanel: () => void;
  sections: TestSection[];
}

const InstructionsScreen: React.FC<InstructionsScreenProps> = ({
  testName,
  duration,
  instructions,
  onStart,
  loading = false,
  showPanel,
  togglePanel,
  sections,
}) => {
  return (
    <div className="h-full w-full">
      {/* --- Desktop View (side by side) --- */}
      <div className="hidden sm:flex h-full">
        {/* LEFT: Instructions */}
        <div className={`relative bg-white flex flex-col ${showPanel ? 'w-[75%]' : 'w-full'}`}>
          <div className="w-full bg-gray-100 font-medium py-4 px-4 text-gray-800">
            General Instructions
          </div>
          <div className="px-4 py-4 h-full overflow-y-auto">
            {instructions ? (
              <ReadOnlyTiptapRenderer
                jsonContent={instructions}
                className="text-gray-700 leading-[2.5rem]"
              />
            ) : (
              <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                Please read the instructions carefully before starting the test.
                <br />
                1. Do not refresh the page.
                <br />
                2. Each section has its own timer.
                <br />
                3. Once submitted, the test cannot be retaken.
              </div>
            )}
          </div>

          {/* Toggle Icon (attached to right edge) */}
          <div
            onClick={togglePanel}
            className="absolute top-1/2 right-0 -translate-y-1/2 z-10  text-dark w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition"
          >
            {showPanel ? <ChevronDoubleRight size={18} strokeWidth={3} /> : <ChevronDoubleLeft size={18} />}
          </div>
        </div>

        {/* RIGHT: Sections Overview */}
        {showPanel && (
          <div className="w-[25%] border-l bg-white h-full overflow-y-auto">
            <SectionsOverview sections={sections} onStart={onStart} loading={loading} />
          </div>
        )}
      </div>

      {/* --- Mobile View (toggle screen) --- */}
      <div className="sm:hidden h-full w-full">
        {showPanel ? (
          <SectionsOverview sections={sections} onStart={onStart} loading={loading} />
        ) : (
          <div className="flex flex-col h-full bg-white">
            <div className="w-full bg-gray-100 font-medium py-4 px-4 text-gray-800">
              General Instructions
            </div>
            <div className="px-4 flex-1 overflow-y-auto">
              {instructions ? (
                <ReadOnlyTiptapRenderer
                  jsonContent={instructions}
                  className="text-gray-700 leading-[2.5rem]"
                />
              ) : (
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  Please read the instructions carefully before starting the test.
                  <br />
                  1. Do not refresh the page.
                  <br />
                  2. Each section has its own timer.
                  <br />
                  3. Once submitted, the test cannot be retaken.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructionsScreen;
