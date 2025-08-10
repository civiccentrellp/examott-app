'use client'
import { useSearchParams } from 'next/navigation';
import CreateTestForm from '@/components/dbms/Forms/CreateTestForm';
export default function CreateQuestionPage() {
  const searchParams = useSearchParams();
  const questionType = searchParams.get('type') as "OBJECTIVE" | "DESCRIPTIVE" | null;

  return (
    <div className="h-full">
      
        <CreateTestForm/>
     
    </div>
  );
}
