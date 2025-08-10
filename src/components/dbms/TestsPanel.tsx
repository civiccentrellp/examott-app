// Updated TestsPanel to support course filtering and dynamic UI
'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAllTests } from '@/utils/tests/test';
import { Button } from '@/components/ui/button';
import { Clipboard2CheckFill, FilterCircle } from 'react-bootstrap-icons';

const TestsPanel = ({ selectedCourse, setSelectedCourse }: { selectedCourse: string | null, setSelectedCourse: (value: string | null) => void }) => {
  const [tests, setTests] = useState<any[]>([]);
  const [filteredTests, setFilteredTests] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    getAllTests()
      .then((data) => {
        setTests(data);
        setFilteredTests(data);
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      setFilteredTests(tests.filter(test => test.courseId === selectedCourse));
    } else {
      setFilteredTests(tests);
    }
  }, [selectedCourse, tests]);
  const handleClearFilter = () => {
    setSelectedCourse(null);
    setFilteredTests(tests);
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Tests</h2>
        {selectedCourse && (
          <Button
            variant="ghost"
            onClick={handleClearFilter}
            className="text-sm flex items-center gap-1"
          >
            <FilterCircle size={16} /> Clear
          </Button>
        )}
      </div>

      {filteredTests.length === 0 ? (
        <p className="text-gray-500">No tests available{selectedCourse ? ' for selected course' : ''}.</p>
      ) : (
        <ul className="space-y-4">
          {filteredTests.map(test => (
            <li
              key={test.id}
              className="border px-4 py-3 rounded bg-white shadow-sm hover:shadow-md cursor-pointer transition flex items-center justify-between"
              onClick={() => router.push(`/dbms/test-form?id=${test.id}`)}
            >
              <div className="font-semibold text-gray-900 flex items-center gap-4">
                <Clipboard2CheckFill size={24} />
                {test.name}
              </div>
              {test.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 items-center">
                  {test.tags.map((tag: any) => (
                    <span key={tag.id} className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded-2 border border-black">
                      {tag.name}
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TestsPanel;