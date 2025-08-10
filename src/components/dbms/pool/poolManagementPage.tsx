'use client';

import React, { useEffect, useState } from 'react';
import { getPools, deletePool } from '@/utils/dbms/pool';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { MoreVertical, UploadIcon } from 'lucide-react';
import { BoxArrowInRight } from 'react-bootstrap-icons';
import PoolDetailsPage from './[poolId]/page';
import type { Pool } from '@/utils/dbms/pool';
import { addQuestionsToSection } from '@/utils/tests/test';
import { useSearchParams, useRouter } from 'next/navigation';
import IconButtonWithTooltip from '@/components/ui/IconButtonWithTooltip';

const PoolManagementPage = () => {
  const searchParams = useSearchParams();
  const importMode = searchParams.get('mode') === 'import';
  const importSectionId = searchParams.get('sectionId');
  const [pools, setPools] = useState<Pool[]>([]);
  const [hovered, setHovered] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);
  const [selectedPoolId, setSelectedPoolId] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchPools();
  }, []);

  useEffect(() => {
    if (importMode && pools.length > 0 && !selectedPoolId) {
      setSelectedPoolId(pools[0].id);
    }
  }, [pools, importMode]);

  const fetchPools = async () => {
    try {
      const data = await getPools();
      setPools(data);
    } catch {
      toast.error('Failed to load pools');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePool(id);
      toast.success('Pool deleted');
      fetchPools();
      if (selectedPoolId === id) setSelectedPoolId(null);
    } catch {
      toast.error('Error deleting pool');
    }
  };

  const handleImportQuestions = async (poolId: string) => {
    if (!importMode || !importSectionId) return;

    const selectedPool = pools.find(p => p.id === poolId);
    if (!selectedPool || selectedPool.questions.length === 0) {
      toast.error('No questions in pool');
      return;
    }

    try {
      // Call backend to add new questions
      await addQuestionsToSection(importSectionId, selectedPool.questions.map(q => q.questionId));

      // ✅ Save to localStorage to transfer data to test-form
      const stored = JSON.parse(localStorage.getItem("importedQuestions") || "{}");
      stored[importSectionId] = selectedPool.questions;
      localStorage.setItem("importedQuestions", JSON.stringify(stored));

      toast.success('Questions imported successfully');
      router.push(`/dbms/test-form?id=${searchParams.get('testId')}`);
    } catch (err) {
      console.error('Import failed:', err);
      toast.error('Failed to import questions');
    }
  };

  return (
    <div className=''>
      <div className="flex h-screen">
        {/* Left Sidebar */}
        <div className="w-[20%] border rounded bg-white p-6 shadow-sm h-[88vh]">
          <div className="space-y-3 overflow-y-auto h-[80vh] pr-2">
            {pools.map(pool => (
              <div
                key={pool.id}
                onMouseEnter={() => setHovered(pool.id)}
                onMouseLeave={() => {
                  setHovered(null);
                  setDropdownOpen(null);
                }}
                className={`group relative cursor-pointer border px-4 py-3 rounded-md ${selectedPoolId === pool.id ? 'bg-gray-100 border-blue-500' : 'bg-gray-50'} hover:bg-gray-100 transition`}
              >
                <div className="flex justify-between items-center">
                  <div
                    className="flex-1 flex items-center justify-between"
                    onClick={() => setSelectedPoolId(pool.id)}
                  >
                    <span className='flex flex-col'>
                      <p className="font-medium text-gray-800 truncate max-w-[180px]">{pool.name}</p>
                      <p className="text-xs text-gray-500">{pool.questions.length} questions</p>
                    </span>

                    {importMode && (
                      <IconButtonWithTooltip
                        label="Export Questions"
                        icon={<UploadIcon size={20} />}
                        onClick={() => handleImportQuestions(pool.id)}
                      />
                    )}
                  </div>

                  {hovered === pool.id && !importMode && (
                    <div className="relative z-10 t-100 l-100" onClick={e => e.stopPropagation()}>
                      <MoreVertical
                        className="h-5 w-5 text-gray-500 hover:text-gray-700"
                        onClick={() =>
                          setDropdownOpen(dropdownOpen === pool.id ? null : pool.id)
                        }
                      />
                      {dropdownOpen === pool.id && (
                        <div className="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg">
                          <button
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                            onClick={() => {
                              toast.info('Edit coming soon');
                              setDropdownOpen(null);
                            }}
                          >
                            Edit
                          </button>
                          <button
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                            onClick={() => handleDelete(pool.id)}
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel */}
        <div className="flex-1">
          {selectedPoolId ? (
            <PoolDetailsPage />
          ) : (
            <div className="h-full flex items-center justify-center text-gray-500 text-sm">
              Select a pool to view its questions.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PoolManagementPage;
