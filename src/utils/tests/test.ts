// File: utils/dbms/test.ts
import type { JSONContent } from '@tiptap/react';
import { apiFetch } from "../fetchApi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export type TestSection = {
  id?: string;
  name: string;
  marksPerQn: number;
  negativeMarks?: number;
  questions?: {
    marks?: number | null;
  }[];
};


export type Test = {
  id: string;
  name: string;
  durationMin: number;
  type: string;
  allowNegative: boolean;
  isMultiSection: boolean;
  instructions?: JSONContent | null;
  tags: { id: string; name: string }[];
  sections: TestSection[];
  createdAt?: string;
};

export async function createTest(data: {
  name: string;
  durationHr: number;
  durationMin: number;
  courseId: string;
  type: string;
  allowNegative: boolean;
  isMultiSection: boolean;
  instructions?: JSONContent | null;
  tags: string[];
  sections: { name: string; marksPerQn: number; negativeMarks?: number }[];
}): Promise<Test> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to create test');

    return await res.json();
  } catch (error) {
    console.error('Error creating test:', error);
    throw error;
  }
}

export async function getAllTests(): Promise<Test[]> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to apiFetch tests');
    return await res.json();
  } catch (err) {
    console.error('Error apiFetching tests:', err);
    return [];
  }
}

export async function getTestById(id: string): Promise<Test> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests/${id}`, {
      method: 'GET',
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Failed to apiFetch test');

    const data = await res.json();
    return data;
  } catch (err) {
    console.error('❌ Error apiFetching test by ID:', err);
    throw err;
  }
}

export async function updateTest(id: string, data: {
  name?: string;
  instructions?: JSONContent | null;
  tags?: string[];
  durationMin?: number;
  courseId?: string;
  type?: string;
  allowNegative?: boolean;
  isMultiSection?: boolean;
}): Promise<Test> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error('Failed to update test');
    return await res.json();
  } catch (error) {
    console.error('Error updating test:', error);
    throw error;
  }
}

export async function deleteTest(id: string) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) throw new Error('Failed to delete test');
    return await res.json();
  } catch (err) {
    console.error('Error deleting test:', err);
    throw err;
  }
}

export async function addQuestionsToSection(sectionId: string, questionIds: string[]) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests/sections/${sectionId}/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds }),
    });

    if (!res.ok) throw new Error('Failed to add questions to section');
    return await res.json();
  } catch (err) {
    console.error('Error adding questions to section:', err);
    throw err;
  }
}

export async function addSectionToTest(testId: string, sectionData: { name: string; marksPerQn: number; negativeMarks?: number }) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests/${testId}/sections`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sectionData),
    });

    if (!res.ok) throw new Error('Failed to add section to test');
    return await res.json();
  } catch (error) {
    console.error('Error adding section to test:', error);
    throw error;
  }
}

export async function updateSection(sectionId: string, data: {
  name: string;
  marksPerQn: number;
  negativeMarks?: number;
}) {
  const res = await apiFetch(`${apiBaseUrl}/api/tests/sections/${sectionId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to update section');
  return await res.json();
}

export async function deleteSection(sectionId: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/tests/sections/${sectionId}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete section');
  return await res.json();
}

export async function deleteQuestionFromSection(sectionId: string, questionId: string) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests/sections/${sectionId}/questions/${questionId}`, {
      method: 'DELETE',
    });

    if (!res.ok) throw new Error('Failed to delete question from section');
    return await res.json();
  } catch (err) {
    console.error('Error deleting question from section:', err);
    throw err;
  }
}
export async function deleteTestQuestionById(id: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/tests/test-questions/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete test question');
  return await res.json();
}

export async function updateTestQuestionMarks(id: string, data: {
  marks?: number;
  negativeMarks?: number;
}) {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests/test-question/${id}/marks`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update test question marks');
    return await res.json();
  } catch (err) {
    console.error('❌ Error updating test question marks:', err);
    throw err;
  }
}

export async function getTestsByTag(tag: string): Promise<Test[]> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/tests/by-tag?tag=${encodeURIComponent(tag)}`, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Failed to apiFetch recommended tests by tag');

    return await res.json();
  } catch (err) {
    console.error('❌ Error apiFetching tests by tag:', err);
    return [];
  }
}

export async function getTestsByTags(tags: string[]): Promise<Test[]> {
  console.log('🧪 Sending tags to API:', tags);
  const query = tags.map(encodeURIComponent).join(',');
  const res = await apiFetch(`${apiBaseUrl}/api/tests/by-tags?tags=${query}`, {
    method: 'GET',
    cache: 'no-store',
  });
  if (!res.ok) throw new Error('Failed to apiFetch tests by tags');
  return await res.json();
}
