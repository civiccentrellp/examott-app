'use client';

import React from 'react';
import { TestSection } from '@/utils/tests/test';
import { useUser } from '@/context/userContext';
import { Button } from '@/components/ui/button';
import { Check2Circle, QuestionCircleFill } from 'react-bootstrap-icons';

interface Props {
  sections: TestSection[];
  onStart: () => void;
  loading: boolean;
}
interface FlatQuestion {
  id: string;
  type: string;
  marks?: number | null;
  children?: FlatQuestion[];
  isParent?: boolean;
  [key: string]: any;
}

const SectionsOverview: React.FC<Props> = ({ sections, onStart, loading }) => {
  const { user } = useUser();

  // ✅ Total questions = length of all flat questions
 // ✅ Total questions = count only non-parent (flat) questions
const totalQuestions = sections.reduce((sum, section) => {
  const questions = section.questions as FlatQuestion[]; // ✅ type assertion
  const count = questions?.reduce((acc, q) => {
    if (q.isParent) return acc; // skip parent
    return acc + 1;
  }, 0) ?? 0;
  return sum + count;
}, 0);

// ✅ Total marks = sum of marks of non-parent questions
const totalMarks = sections.reduce((sum, section) => {
  const questions = section.questions as FlatQuestion[];
  const sectionMarks = questions?.reduce((acc, q) => {
    if (q.isParent) return acc;
    return acc + (q.marks ?? section.marksPerQn ?? 0);
  }, 0) ?? 0;
  return sum + sectionMarks;
}, 0);

// ✅ Per-section stats for display
const getSectionStats = (section: any) => {
  const questions = section.questions as FlatQuestion[];
  const questionCount = questions?.filter((q) => !q.isParent)?.length || 0;
  const marksCount = questions?.reduce((sum, q) => {
    if (q.isParent) return sum;
    return sum + (q.marks ?? section.marksPerQn ?? 0);
  }, 0) ?? 0;

  return { questionCount, marksCount };
};

  return (
    <>
      <div className="w-full relative bg-white h-full pb-24 sm:pb-6">
        {/* Header */}
        <div className="text-dark font-medium px-4 py-3 flex items-center bg-violet-50 justify-end sm:justify-center gap-4 ">
          <div className="w-10 h-10 rounded-full bg-violet-600 text-white flex items-center justify-center text-2xl font-semibold">
            {user?.name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <span className="hidden sm:block text-slate-800 leading-none truncate text-xl">
            {user?.name || 'Student'}
          </span>
        </div>

        <div className="flex items-center justify-between pt-2 pb-2 text-gray-700 text-sm gap-2 px-4">
          <div className="w-full flex flex-col items-center gap-2 border rounded p-2">
            <span>Total Questions</span>
            <span className="flex items-center gap-1 text-xs">
              <QuestionCircleFill className="text-gray-600" size={12} />
              {totalQuestions} Questions
            </span>
          </div>
          <div className="w-full flex flex-col items-center gap-2 rounded border p-2">
            <span>Total Marks</span>
            <span className="flex items-center gap-1 text-xs">
              <Check2Circle className="text-gray-600" size={12} />
              {totalMarks} Marks
            </span>
          </div>
        </div>

        <h4 className='py-2 px-3'>Test Sections :</h4>

        {/* Section breakdowns */}
        <div className="sm:h-[70%] h-[75%] overflow-y-auto">
          {sections.map((section, idx) => {
            const { questionCount, marksCount } = getSectionStats(section);
            return (
              <div
                key={section.id}
                className="flex items-center gap-4 px-3 py-3 hover:shadow-md transition"
              >
                <div className="w-8 h-12 rounded-4 flex items-center justify-center text-white font-semibold bg-violet-400">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800">{section.name}</div>
                  <div className="text-xs text-gray-600 mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <QuestionCircleFill className="text-gray-600" size={12} />
                      {questionCount} Questions
                    </span>
                    <span className="flex items-center gap-1">
                      <Check2Circle className="text-green-600" size={12} />
                      {marksCount} Marks
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="fixed bottom-4 sm:bottom-4 p-2 flex items-center justify-center w-full sm:w-1/4">
        <Button
          onClick={onStart}
          disabled={loading}
           variant="outline"
          className="w-full bg-violet-500 text-white px-4 py-6 text-center text-lg font-light cursor-pointer hover:bg-violet-800 hover:font-semibold"
        >
          {loading ? 'Starting...' : 'Attempt Test'}
        </Button>
      </div>
    </>
  );
};

export default SectionsOverview;