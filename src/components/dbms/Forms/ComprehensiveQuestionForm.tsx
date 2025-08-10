'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import TiptapEditor from '@/components/ui/TiptapEditor';
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';
import { addQuestion } from '@/utils/dbms/question';
import { addOptions } from '@/utils/dbms/options';
import { toast } from 'sonner';
import type { JSONContent } from '@tiptap/react';

const ComprehensiveQuestionForm = ({ onFinish }: { onFinish: () => void }) => {
  const [step, setStep] = useState<'paragraph' | 'questions'>('paragraph');
  const [paragraph, setParagraph] = useState<JSONContent | null>(null);
  const [childQuestions, setChildQuestions] = useState<any[]>([]);
  const [newChildQuestion, setNewChildQuestion] = useState<JSONContent | null>(null);
  const [questionType, setQuestionType] = useState<'OBJECTIVE' | 'DESCRIPTIVE'>('OBJECTIVE');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswers, setCorrectAnswers] = useState([false, false, false, false]);
  const [isLoading, setIsLoading] = useState(false);
  const [parentId, setParentId] = useState<string | null>(null);

  const handleParagraphSave = async () => {
    if (!paragraph || !paragraph.content?.length) {
      return toast.error('Paragraph cannot be empty.');
    }
    try {
      const res = await addQuestion({
        type: 'COMPREHENSIVE',
        correctType: 'SINGLE',
        question: { type: 'doc', content: [] },
        paragraph,
      });
      toast.success('Paragraph saved. Now add child questions.');
      setParagraph({ ...paragraph });
      setStep('questions');
      setParentId(res.id);
    } catch (err) {
      toast.error('Failed to save paragraph.');
    }
  };

  const handleAddChild = async () => {
    if (!newChildQuestion || !newChildQuestion.content?.length) return toast.error('Child question is empty.');
    if (questionType === 'OBJECTIVE' && options.filter((o) => o.trim()).length < 2) return toast.error('At least 2 options.');
    try {
      const payload: any = {
        question: newChildQuestion,
        type: questionType,
        correctType: 'SINGLE',
        parentId,
      };
      const res = await addQuestion(payload);
      if (questionType === 'OBJECTIVE') {
        const validOptions = options.map((o, i) => ({ value: o, correct: correctAnswers[i] }));
        await addOptions(res.id, validOptions);
      }
      setChildQuestions([...childQuestions, { ...payload, id: res.id }]);
      setNewChildQuestion(null);
      setOptions(['', '', '', '']);
      setCorrectAnswers([false, false, false, false]);
      toast.success('Child question added.');
    } catch (err) {
      toast.error('Error saving question.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <Tabs value={step} onValueChange={(val) => setStep(val as any)}>
        <TabsList>
          <TabsTrigger value="paragraph">Paragraph</TabsTrigger>
          <TabsTrigger value="questions" disabled={!paragraph}>Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="paragraph">
          <h3 className="text-lg font-semibold mb-2"> Comprehensive Paragraph</h3>
          <TiptapEditor content={paragraph || { type: 'doc', content: [] }} onUpdate={setParagraph} />
          <div className="mt-4 flex justify-end">
            <Button variant="outline" className="bg-gray-900 text-white hover:bg-gray-800" onClick={handleParagraphSave} disabled={isLoading}>Save Paragraph</Button>
          </div>
        </TabsContent>

        <TabsContent value="questions">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Child Questions</h3>
            <Button variant="destructive" onClick={onFinish}>Finish</Button>
          </div>

          <div className="mb-4">
            <TiptapEditor content={newChildQuestion || { type: 'doc', content: [] }} onUpdate={setNewChildQuestion} />
            {questionType === 'OBJECTIVE' && (
              <div className="mt-2 space-y-2">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correctOption"
                      checked={correctAnswers[idx]}
                      onChange={() => {
                        const newCorrect = [false, false, false, false];
                        newCorrect[idx] = true;
                        setCorrectAnswers(newCorrect);
                      }}
                    />
                    <Input
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Option ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2 flex gap-4">
              <Button onClick={handleAddChild}>Add Question</Button>
              <select onChange={(e) => setQuestionType(e.target.value as any)} value={questionType} className="border px-2 py-1 rounded">
                <option value="OBJECTIVE">Objective</option>
                <option value="DESCRIPTIVE">Descriptive</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {childQuestions.map((q, idx) => (
              <div key={q.id} className="border p-3 rounded bg-white shadow">
                <div className="font-medium mb-1">Question {idx + 1}</div>
                <ReadOnlyTiptapRenderer jsonContent={q.question} />
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensiveQuestionForm;
