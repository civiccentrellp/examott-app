'use client';
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createTest, updateTest } from '@/utils/tests/test';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { X } from 'lucide-react';
import type { JSONContent } from '@tiptap/react';
import TiptapEditor from '@/components/ui/TiptapEditor';
import { Course, getCourses } from '@/utils/courses/getCourses';

const AddTestModal = ({
  onClose,
  onTestCreated,
  testData,
  CourseId,
}: {
  onClose: () => void;
  onTestCreated: (test: any) => void;
  testData?: any;
  CourseId?: string;
}) => {

  const [name, setName] = useState('');
  const [durationHr, setDurationHr] = useState('0');
  const [durationMin, setDurationMin] = useState('0');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [allowNegative, setAllowNegative] = useState(false);
  const [instructions, setInstructions] = useState<JSONContent | undefined>(undefined);
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>(CourseId || '');

  useEffect(() => {
    if (testData) {
      setName(testData.name || '');
      setDurationHr(Math.floor(testData.durationMin / 60).toString());
      setDurationMin((testData.durationMin % 60).toString());
      setTagList(testData.tags?.map((t: any) => t.name) || []);
      setAllowNegative(testData.allowNegative || false);
      setInstructions(testData.instructions || null);
      setSelectedCourseId(testData.courseId || CourseId || '');
    }
  }, [testData, CourseId]);


  useEffect(() => {
    getCourses().then(setCourses);
  }, []);

  const handleCreate = async () => {
    try {
      const payload = {
        name,
        durationMin: +durationHr * 60 + +durationMin,
        courseId: selectedCourseId,
        type: 'SINGLE',
        allowNegative,
        isMultiSection: false,
        tags: tagList,
        instructions,
      };

      const test = testData
        ? await updateTest(testData.id, payload)
        : await createTest({
          ...payload,
          durationHr: +durationHr,
          durationMin: +durationMin,
          sections: [
            {
              name: 'Section 1',
              marksPerQn: 1,
              negativeMarks: allowNegative ? 0.25 : 0,
            },
          ],
        });


      toast.success(`Test ${testData ? 'updated' : 'created'}`);
      onTestCreated(test);
    } catch (err) {
      toast.error(`Failed to ${testData ? 'update' : 'create'} test`);
    }
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tagList.includes(tagInput.trim())) {
        setTagList([...tagList, tagInput.trim()]);
        setTagInput('');
      }
    }
  };

  const removeTag = (tag: string) => {
    setTagList(prev => prev.filter(t => t !== tag));
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl z-50 p-8 space-y-6 border border-gray-200 max-h-[98vh] overflow-y-auto">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Create New Test</h2>

      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="border rounded px-3 py-2 w-full"
        >
          <option value="">Select Course</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>


      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">Test Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter test name"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">Duration</label>
        <div className="flex gap-2 w-full">
          <select
            value={durationHr}
            onChange={(e) => setDurationHr(e.target.value)}
            className="border rounded px-3 py-2 w-1/2"
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <option key={i} value={i}>{i} hr</option>
            ))}
          </select>
          <select
            value={durationMin}
            onChange={(e) => setDurationMin(e.target.value)}
            className="border rounded px-3 py-2 w-1/2"
          >
            {Array.from({ length: 60 }).map((_, i) => (
              <option key={i} value={i}>{i} min</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">Tags</label>
        <Input
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={handleTagKeyDown}
          placeholder="Press Enter to add"
        />
      </div>

      {tagList.length > 0 && (
        <div className="flex flex-wrap gap-2 ml-44 mt-2">
          {tagList.map((tag) => (
            <div
              key={tag}
              className="flex items-center justify-between gap-1 px-2 py-1 text-sm bg-gray-200 rounded-2 border border-black"
            >
              {tag}
              <X
                size={16}
                className="cursor-pointer text-gray-600"
                onClick={() => removeTag(tag)}
              />
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Instructions
        </label>
        <div className="border rounded-md p-2 bg-white shadow-sm">
          <TiptapEditor content={instructions} onUpdate={(val) => setInstructions(val)} />
        </div>
      </div>


      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-gray-700 dark:text-gray-300">
          Allow Negative Marking
        </label>
        <Switch
          checked={allowNegative}
          onCheckedChange={setAllowNegative}
        />
      </div>

      <div className="flex justify-between pt-6 m-0">
        <Button variant="outline" className="sm:ml-4 flex items-center gap-2 w-50" onClick={onClose}>Cancel</Button>
        <Button variant="outline" className="sm:ml-4 bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2 w-50" onClick={handleCreate}>Save</Button>
      </div>
    </div>
  );
};

export default AddTestModal;
