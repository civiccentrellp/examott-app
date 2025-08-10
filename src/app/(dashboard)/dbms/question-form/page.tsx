'use client'
import { useSearchParams } from 'next/navigation';
import CreateQuestionForm from '@/components/dbms/Forms/CreateQuestionForm';

export default function CreateQuestionPage() {
  const searchParams = useSearchParams();
  const questionType = searchParams.get('type') as "OBJECTIVE" | "DESCRIPTIVE" | null;

  return (
    <div className="p-4">
      {questionType ? (
        <CreateQuestionForm questionType={questionType} onClose={() => {}} />
      ) : (
        <p>Error: Question type not specified.</p>
      )}
    </div>
  );
}
