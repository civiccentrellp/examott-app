'use client';
import React, { useState } from 'react';
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';

interface StudentQuestionCardProps {
  question: any;
  index: number;
  selectedAnswer?: string | string[];
  onSelectAnswer?: (answer: string | string[]) => void;
}

const StudentQuestionCard: React.FC<StudentQuestionCardProps> = ({
  question,
  index,
  selectedAnswer,
  onSelectAnswer,
}) => {

  const [showFullDesc, setShowFullDesc] = useState(false);

  const parsed =
    typeof question.question === 'string'
      ? JSON.parse(question.question)
      : question.question;

  const handleChange = (value: string) => {
    if (question.correctType === 'SINGLE') {
      onSelectAnswer?.(value);
    } else {
      if (!Array.isArray(selectedAnswer)) return;
      const updated = selectedAnswer.includes(value)
        ? selectedAnswer.filter((v) => v !== value)
        : [...selectedAnswer, value];
      onSelectAnswer?.(updated);
    }
  };

  const isSelected = (optValue: string) => {
    return question.correctType === 'SINGLE'
      ? selectedAnswer === optValue
      : Array.isArray(selectedAnswer) && selectedAnswer.includes(optValue);
  };

  return (
    <div className="border rounded-lg h-full overflow-y-auto m-1 p-1">
      {/* Paragraph (Comprehensive) */}
      {question.parentParagraph && (
        <div className="bg-blue-50 px-4 py-3 rounded ">

          <ReadOnlyTiptapRenderer
            truncate={!showFullDesc}
            triggerKey={showFullDesc.toString()}
            className="text-sm sm:text-base leading-relaxed text-gray-800"
            jsonContent={
              typeof question.parentParagraph === 'string'
                ? JSON.parse(question.parentParagraph)
                : question.parentParagraph
            }
          />
          <button
            onClick={() => setShowFullDesc(prev => !prev)}
            className="text-blue-600 text-sm font-medium hover:underline"
          >
            {showFullDesc ? 'View Less' : 'View More'}
          </button>
        </div>
      )}
      <div className='p-4 space-y-4'>
        {/* Question */}
        <div className="flex gap-2 text-sm text-gray-800">
          <div className="font-medium text-gray-700">{index + 1}.</div>
          <ReadOnlyTiptapRenderer jsonContent={parsed} />
        </div>

        {/* Options */}
        <div className="space-y-4">
          {question.options?.map((opt: any, idx: number) => (
            <label
              key={idx}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-pointer ${isSelected(opt.value)
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300'
                }`}
            >
              <input
                type={question.correctType === 'SINGLE' ? 'radio' : 'checkbox'}
                name={`question-${question.id}`}
                checked={isSelected(opt.value)}
                onChange={() => handleChange(opt.value)}
                className="accent-blue-500"
              />
              <span className="font-medium">{opt.value}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentQuestionCard;
