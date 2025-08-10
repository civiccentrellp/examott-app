'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getQuestions, Question } from '@/utils/dbms/question'
import { getChapters } from '@/utils/dbms/chapter'
import { getTopics } from '@/utils/dbms/topic'
import { getSubTopics } from '@/utils/dbms/subTopic'
import { extractTextFromTiptapJSON } from '@/utils/tiptapUtils'
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';
import { deleteQuestion } from '@/utils/dbms/question'
import { Check2, FilterCircle, Paperclip } from 'react-bootstrap-icons'
import { Button } from '../ui/button'
import { Pencil, Trash } from 'lucide-react'
import Swal from 'sweetalert2'
import QuestionCard from './QuestionCard'
import CreateQuestionForm from './Forms/CreateQuestionForm'


type QuestionsPanelProps = {
  searchTerm: string
  folderState: any
  setFolderState: (state: any) => void
  questionType: "OBJECTIVE" | "DESCRIPTIVE" | "COMPREHENSIVE"
  selectedQuestions: string[]
  setSelectedQuestions: (questions: string[]) => void
  isPoolMode: boolean
}


const QuestionsPanel = ({
  searchTerm,
  folderState,
  setFolderState,
  questionType,
  selectedQuestions,
  setSelectedQuestions,
  isPoolMode,
}: QuestionsPanelProps) => {

  const router = useRouter();

  const { selectedSubject, selectedChapter, selectedTopic, selectedSubTopic } = folderState
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  const [childQuestionsMap, setChildQuestionsMap] = useState<Record<string, Question[]>>({});
  const [childLoadingMap, setChildLoadingMap] = useState<Record<string, boolean>>({});
  const [showAddChildModal, setShowAddChildModal] = useState(false);
  const [selectedParent, setSelectedParent] = useState<Question | null>(null);


  const loadChildQuestions = async (parentId: string) => {
    if (!childQuestionsMap[parentId]) {
      setChildLoadingMap(prev => ({ ...prev, [parentId]: true }));
      const all = await getQuestions([]); // ⬅ no type filter
      const filtered = all.filter(child => child.parentId === parentId);
      setChildQuestionsMap(prev => ({ ...prev, [parentId]: filtered }));
      setChildLoadingMap(prev => ({ ...prev, [parentId]: false }));
    }
  };


  const handleSelectQuestion = (id: string) => {
    if (selectedQuestions.includes(id)) {
      setSelectedQuestions(selectedQuestions.filter(q => q !== id))
    } else {
      setSelectedQuestions([...selectedQuestions, id])
    }
  }

  function safeJsonParse(str: string) {
    try {
      return JSON.parse(str);
    } catch (e) {
      console.error("Invalid JSON in question:", str);
      return {
        type: "doc",
        content: [
          { type: "paragraph", content: [{ type: "text", text: "⚠️ Broken question content" }] },
        ],
      };
    }
  }

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      let subTopicIds: string[] = [];
      const collectSubTopicIds = async () => {
        if (selectedSubTopic) {
          subTopicIds = [selectedSubTopic];
        } else if (selectedTopic) {
          const subTopics = await getSubTopics(selectedTopic);
          subTopicIds = subTopics.map(st => st.id);
        } else if (selectedChapter) {
          const topics = await getTopics(selectedChapter);
          for (const topic of topics) {
            const subTopics = await getSubTopics(topic.id);
            subTopicIds.push(...subTopics.map(st => st.id));
          }
        } else if (selectedSubject) {
          const chapters = await getChapters(selectedSubject);
          for (const chapter of chapters) {
            const topics = await getTopics(chapter.id);
            for (const topic of topics) {
              const subTopics = await getSubTopics(topic.id);
              subTopicIds.push(...subTopics.map(st => st.id));
            }
          }
        }
      };
      await collectSubTopicIds();
      const data = subTopicIds.length > 0
        ? await getQuestions(subTopicIds, questionType)
        : await getQuestions([] as string[], questionType);
      setQuestions(data);
      setLoading(false);
    };
    fetchQuestions();
  }, [selectedSubject, selectedChapter, selectedTopic, selectedSubTopic]);

  const filteredQuestions = searchTerm.trim()
    ? questions.filter((q) => {
      const plainText = extractTextFromTiptapJSON(q.question)
      return plainText.toLowerCase().includes(searchTerm.toLowerCase())
    })
    : questions

  const handleDelete = async (id: string) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Type DELETE to confirm',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      preConfirm: (inputValue) => {
        if (inputValue !== 'DELETE') {
          Swal.showValidationMessage('You must type DELETE to confirm.')
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    })

    if (result.isConfirmed && result.value === 'DELETE') {
      try {
        await deleteQuestion(id)
        setQuestions((prev) => prev.filter((q) => q.id !== id))
        Swal.fire('Deleted!', 'The question has been deleted.', 'success')
      } catch (err) {
        console.error(err)
        Swal.fire('Error', 'Failed to delete question.', 'error')
      }
    }
  }

  return (
    <div className="flex-1 overflow-auto p-4">
      <div className='flex items-center justify-between mb-3'>
        <h4 className="font-semibold">{isPoolMode ? 'Select Questions' : 'Questions'}</h4>
        {(selectedSubject || selectedChapter || selectedTopic || selectedSubTopic) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFolderState({})}
            className="text-sm flex items-center gap-1"
          >
            <FilterCircle size={16} /> Clear
          </Button>
        )}
      </div>


      {loading && <div className="text-gray-500">Loading...</div>}
      {!loading && filteredQuestions.length === 0 && (
        <div className="text-gray-500">No questions found</div>
      )}
      
      {!loading &&
        filteredQuestions.map((q, index) => (
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
            showCheckbox={isPoolMode}
            checked={selectedQuestions.includes(q.id)}
            onCheckChange={() => handleSelectQuestion(q.id)}
            onEdit={() => {
              const url = q.type === "COMPREHENSIVE" && q.children?.length
                ? `/dbms/question-form?type=COMPREHENSIVE&questionId=${q.id}&editMode=paragraph`
                : `/dbms/question-form?type=${q.type}&questionId=${q.id}`;
              router.push(url);
            }}
            onDelete={() => handleDelete(q.id)}
            showChildren={true}
            childrenQuestions={childQuestionsMap[q.id] || []}
            onChildEdit={(child) => {
              router.push(`/dbms/question-form?questionId=${child.id}&type=COMPREHENSIVE`);
            }}
            onChildDelete={(childId) => {
              handleDelete(childId);
            }}
            onAddChild={(parent) => {
              router.push(`/dbms/question-form?type=COMPREHENSIVE&parentId=${parent.id}`);
            }}

          />
        ))}
      {showAddChildModal && selectedParent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center">
          <CreateQuestionForm
            questionType="COMPREHENSIVE" 
            onClose={() => {
              setShowAddChildModal(false);
              setSelectedParent(null);
            }}
            parentId={selectedParent.id}
            sectionId={null}
          />
        </div>
      )}

    </div>
  )
}

export default QuestionsPanel  