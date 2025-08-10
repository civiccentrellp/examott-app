'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, MinusCircle, DownloadIcon } from 'lucide-react';
import { QuestionSquareFill, Download, PencilSquare, Trash, DashCircle, XSquareFill, Pencil, Paperclip } from 'react-bootstrap-icons';
import AddSectionModal from '@/components/tests/AddSectionModal';
import { getTestById, addSectionToTest, updateTest, deleteSection, updateSection, deleteQuestionFromSection, deleteTestQuestionById, updateTestQuestionMarks } from '@/utils/tests/test';
import TiptapEditor from '@/components/ui/TiptapEditor';
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';
import type { JSONContent } from '@tiptap/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDBMSTabStore } from '@/store/dbmsStore';
import AddTestModal from '@/components/tests/AddTestModal';
import Swal from 'sweetalert2';
import IconButtonWithTooltip from '@/components/ui/IconButtonWithTooltip';
import QuestionCard from '../QuestionCard';
import CreateQuestionForm from './CreateQuestionForm';
import { Question } from '@/utils/dbms/question';

export default function CreateTestForm() {
  const searchParams = useSearchParams();
  const folderId = searchParams.get('FolderId');
  const courseId = searchParams.get('courseId');
  const router = useRouter();
  const testId = searchParams.get('id');
  const [test, setTest] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { activeTab, setActiveTab } = useDBMSTabStore();
  const [editingInstructions, setEditingInstructions] = useState(false);
  const [editedInstructions, setEditedInstructions] = useState<JSONContent | null>(null);
  const [showEditTestModal, setShowEditTestModal] = useState(false);
  const [sectionToEdit, setSectionToEdit] = useState<any>(null);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);
  const [showQuestionTypeModal, setShowQuestionTypeModal] = useState(false);
  const [questionTargetSectionId, setQuestionTargetSectionId] = useState<string | null>(null);
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<any | null>(null);
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);
  const [childQuestionsMap, setChildQuestionsMap] = useState<Record<string, Question[]>>({});
  const [showFullDesc, setShowFullDesc] = useState(false);




  useEffect(() => {
    if (testId) {
      getTestById(testId)
        .then(setTest)
        .catch(() => console.error('Test not found'));
    }
  }, [testId]);

  useEffect(() => {
    if (testId) {
      getTestById(testId)
        .then((fetchedTest) => {
          setTest(fetchedTest);
        })
        .catch(() => console.error('Test not found'));
    }
  }, [testId]);



  const handleInstructionUpdate = async (value: JSONContent) => {
    if (!testId) return;
    try {
      await updateTest(testId, { instructions: value });
      setTest((prev: any) => ({ ...prev, instructions: value }));
    } catch (err) {
      console.error('Failed to update instructions:', err);
    }
  };

  const handleAddSection = async (sectionData: any) => {
    if (!testId) return;
    try {
      const newSection = await addSectionToTest(testId, sectionData);
      setTest((prev: any) => ({
        ...prev,
        sections: [...(prev.sections || []), newSection],
      }));
    } catch (error) {
      console.error('Failed to add section:', error);
    }
  };

  const handleEditSection = (section: any) => {
    setSectionToEdit(section);
    setIsModalOpen(true);
  };

  const handleDeleteSection = async (sectionId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This section will be permanently deleted.',
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Type DELETE to confirm',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      preConfirm: (inputValue) => {
        if (inputValue !== 'DELETE') {
          Swal.showValidationMessage('You must type DELETE to confirm.');
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed && result.value === 'DELETE') {
      try {
        await deleteSection(sectionId);
        setTest((prev: any) => ({
          ...prev,
          sections: prev.sections.filter((s: any) => s.id !== sectionId),
        }));
        Swal.fire('Deleted!', 'The section has been deleted.', 'success');
      } catch (err) {
        console.error('Failed to delete section:', err);
        Swal.fire('Error', 'Failed to delete the section.', 'error');
      }
    }
  };
  if (!test) return <div className="p-6 text-gray-500 italic">Loading Test...</div>;

  const handleDeleteQuestion = async (testQuestionId: string, sectionId: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This question will be permanently deleted.',
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Type DELETE to confirm',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      preConfirm: (inputValue) => {
        if (inputValue !== 'DELETE') {
          Swal.showValidationMessage('You must type DELETE to confirm.');
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (result.isConfirmed && result.value === 'DELETE') {
      try {
        await deleteTestQuestionById(testQuestionId);
        setTest((prev: any) => ({
          ...prev,
          sections: prev.sections.map((section: any) =>
            section.id === sectionId
              ? { ...section, questions: section.questions.filter((q: any) => q.testQuestionId !== testQuestionId) }
              : section
          ),
        }));
        Swal.fire('Deleted!', 'The question has been deleted.', 'success');
      } catch (err) {
        console.error('Failed to delete question:', err);
        Swal.fire('Error', 'Failed to delete the question.', 'error');
      }
    }
  };


  const durationHr = Math.floor(test.durationMin / 60);
  const durationMin = test.durationMin % 60;
  // const handleClose = () => {
  //   const courseId = searchParams.get("courseId");
  //   const folderId = searchParams.get("folderId");

  //   if (folderId && courseId) {
  //     router.replace(`/courses/${courseId}`);
  //   } else {
  //     setActiveTab("TESTS");
  //     router.push("/dbms");
  //   }
  // };

  const handleClose = () => {
  const courseId = searchParams.get("courseId");
  const folderId = searchParams.get("folderId");
  const fromFreeMaterial = searchParams.get("from") === "free-material";

  if (fromFreeMaterial) {
    router.push("/freematerials");
    return;
  }

  if (folderId && courseId) {
    router.replace(`/courses/${courseId}`);
  } else {
    // Default fallback
    setActiveTab("TESTS");
    router.push("/dbms");
  }
};

  const refreshTest = async () => {
    if (testId) {
      const updated = await getTestById(testId);
      setTest(updated);
    }
  };

  return (
    <div className="relative p-6 w-full h-full rounded-4 overflow-y-auto">
      <Button
        variant="outline"
        size="icon"
        onClick={handleClose}
        className="absolute top-4 right-4 bg-gray-300 p-1 rounded hover:bg-gray-400"
      >
        <XSquareFill size={14} />
      </Button>

      {/* <div className="bg-white rounded-2xl shadow p-6 mb-6"> */}
      <div className=" py-6 mb-6">
        <div className="flex flex-col gap-2">
          <div className="text-xl font text-gray-900 flex items-center gap-2">{test.name}
            <button
              onClick={() => setShowEditTestModal(true)}
              className="text-gray-600 hover:text-blue-600"
              title="Edit Test"
            >
              <Edit size={18} />
            </button>
          </div>

          <div className='flex justify-between items-center'>
            <div className="text-sm text-gray-600">
              Duration: <span className="font-semibold">{durationHr} hr</span> <span className="font-semibold">{durationMin} min</span>
            </div>
            {test.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-1">
                <span className="text-sm font-medium text-gray-600">Tags:</span>
                {test.tags.map((tag: any) => (
                  <span
                    key={tag.id}
                    className="inline-flex items-center rounded-2 bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 border border-black"
                  >
                    {tag.name}
                  </span>
                ))}
              </div>
            )}

          </div>

        </div>

        <div className="mt-3">

          <div className="border rounded-xl py-3 px-4 bg-gray-100 shadow-inner">

            <div>
              <ReadOnlyTiptapRenderer jsonContent={test.instructions} key={JSON.stringify(test.instructions)}  truncate={!showFullDesc}
                    triggerKey={showFullDesc.toString()}
                    className="text-sm sm:text-base leading-relaxed text-gray-800" />
                    <button
                    onClick={() => setShowFullDesc(prev => !prev)}
                    className="text-dark text-sm font-medium transition duration-100 ease-in-out hover:scale-105"
                  >
                    {showFullDesc ? 'View Less' : 'View More'}
                  </button>
            </div>

          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium text-gray-900">Sections</h2>
        <Button
          variant="outline"
          onClick={() => setIsModalOpen(true)}
          className="sm:ml-4 bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2"
        >
          <PlusCircle className="mr-2" size={18} /> Add Section
        </Button>
      </div>

      <div className="grid gap-3 mt-4  pr-2 scroll-sections overscroll-contain">
        {test.sections?.map((section: any) => (
          <div
            key={section.id}
            className="border rounded-2 p-6 bg-white shadow-md hover:shadow-lg transition flex flex-col sm:flex-col justify-between items-start sm:items-center gap-4"

          >
            <div className='w-full flex items-center justify-between'
              onClick={() =>
                setExpandedSectionId(expandedSectionId === section.id ? null : section.id)
              }>
              <div className='flex items-center gap-4' >
                <div className="text font-medium text-gray-800">{section.name}</div>
                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1.5 rounded-2">
                    <PlusCircle className="w-3 h-3" />
                    {section.marksPerQn}
                  </span>

                  {test.allowNegative && section.negativeMarks !== undefined && (
                    <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-medium px-2.5 py-1.5 rounded-2">
                      <MinusCircle className="w-3 h-3" />
                      {section.negativeMarks}
                    </span>
                  )}
                </div>

              </div>

              <div className="flex gap-3">
                <IconButtonWithTooltip
                  label="Create Questions"
                  icon={<QuestionSquareFill size={20} />}
                  onClick={() => {
                    setQuestionTargetSectionId(section.id);
                    setShowQuestionTypeModal(true);
                  }}
                />
                <IconButtonWithTooltip
                  label="Import Questions"
                  icon={<DownloadIcon size={20} />}
                  onClick={() => router.push(`/dbms/pool?sectionId=${section.id}&mode=import&testId=${testId}`)}
                />
                <IconButtonWithTooltip
                  label="Edit Section"
                  icon={<PencilSquare size={20} />}
                  onClick={() => handleEditSection(section)}
                />
                <IconButtonWithTooltip
                  label="Delete Section"
                  icon={<Trash2 size={20} />}
                  onClick={() => handleDeleteSection(section.id)}
                  className="text-red-600"
                />
              </div>

            </div>

            {expandedSectionId === section.id && (
              <div className=" border-t pt-4 space-y-6 w-full">
                {(section.questions ?? [])
                  .filter((q: any) => !q.parentId)
                  .map((q: any, index: number) => {
                    const children = q.children || [];

                    return (
                      <QuestionCard
                        key={q.id}
                        question={q}
                        index={index}
                        isExpanded={expandedQuestionId === q.id}
                        onToggleExpand={() => {
                          setExpandedQuestionId(prev => (prev === q.id ? null : q.id));
                          if (!childQuestionsMap[q.id] && q.children?.length) {
                            setChildQuestionsMap(prev => ({ ...prev, [q.id]: q.children! }));
                          }
                        }}
                        onEdit={() => {
                          const editUrl = q.type === 'COMPREHENSIVE'
                            ? `/dbms/question-form?type=${q.type}&questionId=${q.id}&editMode=paragraph`
                            : `/dbms/question-form?type=${q.type}&questionId=${q.id}`;
                          router.push(editUrl);
                        }}

                        onDelete={() => handleDeleteQuestion(q.testQuestionId, section.id)}
                        showChildren={q.type === 'COMPREHENSIVE'}
                        childrenQuestions={children}
                        onChildEdit={(child) => router.push(`/dbms/question-form?type=${child.type}&questionId=${child.id}`)}
                        onChildDelete={async (childId) => {
                          await handleDeleteQuestion(childId, section.id);
                        }}
                        onAddChild={(parent) => {
                          router.push(`/dbms/question-form?type=COMPREHENSIVE&parentId=${parent.id}`);
                        }}
                        allowNegative={test.allowNegative}
                        showMarks={true}
                      />
                    );
                  })}

              </div>
            )}


          </div>
        ))}
        <div style={{ paddingBottom: '50px' }}></div>

      </div>


      {isModalOpen && (
        <AddSectionModal
          onClose={() => {
            setIsModalOpen(false);
            setSectionToEdit(null);
          }}
          onAdd={async (data) => {
            if (sectionToEdit) {
              const updated = await updateSection(sectionToEdit.id, data);
              setTest((prev: any) => ({
                ...prev,
                sections: prev.sections.map((s: any) =>
                  s.id === sectionToEdit.id ? updated : s
                ),
              }));
            } else {
              await handleAddSection(data);
            }
            setIsModalOpen(false);
            setSectionToEdit(null);

          }}
          sectionData={sectionToEdit}
          allowNegative={test.allowNegative}
        />

      )}

      {showEditTestModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm overflow-y-auto flex justify-center items-center m-0">
          <AddTestModal
            onClose={() => setShowEditTestModal(false)}
            onTestCreated={(updated) => {
              setTest(updated);
              setShowEditTestModal(false);
              router.refresh();
            }}
            testData={test}
          />
        </div>
      )}
      {showQuestionTypeModal && questionTargetSectionId && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
            <h2 className="text-lg font-semibold mb-4">Choose Question Type</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  router.push(`/dbms/question-form?sectionId=${questionTargetSectionId}&type=OBJECTIVE`);
                  setShowQuestionTypeModal(false);
                  setQuestionTargetSectionId(null);
                }}
              >
                Objective
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  router.push(`/dbms/question-form?sectionId=${questionTargetSectionId}&type=DESCRIPTIVE`);
                  setShowQuestionTypeModal(false);
                  setQuestionTargetSectionId(null);
                }}
              >
                Descriptive
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  router.push(`/dbms/question-form?sectionId=${questionTargetSectionId}&type=COMPREHENSIVE`);
                  setShowQuestionTypeModal(false);
                  setQuestionTargetSectionId(null);
                }}
              >
                Comprehensive
              </Button>
            </div>
            <div className="mt-4 text-right">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowQuestionTypeModal(false);
                  setQuestionTargetSectionId(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      {showAddChildModal && selectedParent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center">
          <CreateQuestionForm
            questionType="COMPREHENSIVE" // child mode
            onClose={() => {
              setShowAddChildModal(false);
              setSelectedParent(null);
              refreshTest(); // or refetch test
            }}
            parentId={selectedParent.id} // 🔗 link child to this
            sectionId={
              test.sections.find((s: any) =>
                s.questions.some((q: any) => q.id === selectedParent.id)
              )?.id
            }
          />
        </div>
      )}

    </div>
  );
}
