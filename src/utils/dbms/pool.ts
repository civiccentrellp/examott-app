import { JSONContent } from '@tiptap/react'
import { apiFetch } from "../fetchApi";

export type Option = {
  id: string
  value: string
  correct: boolean
}

export type Attachment = {
  id: string
  url: string
  type: 'IMAGE' | 'VIDEO' | 'PDF'
}

export type Tag = {
  id: string
  name: string
}

export type Question = {
  id: string
  question: JSONContent
  questionId: string
  explanation?: JSONContent
  options: Option[]
  attachments?: Attachment[]
  tags?: Tag[]
  [key: string]: any
}

export type Pool = {
  id: string
  name: string
  createdAt: string
  questions: Question[]
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export const addPool = async ({ name }: { name: string }) => {
  const res = await apiFetch(`${apiBaseUrl}/api/pools`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });

  if (!res.ok) throw new Error('Failed to create pool');
  return res.json();
};

export const addQuestionToPool = async (poolId: string, questionId: string) => {
  const res = await apiFetch(`${apiBaseUrl}/api/pools/${poolId}/questions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ questionId })
  });

  if (!res.ok) throw new Error('Failed to add question to pool');
  return res.json();
};

export const getPools = async () => {
  const res = await apiFetch(`${apiBaseUrl}/api/pools`, {
    cache: 'no-store', // <--- this ensures fresh data
  });

  if (!res.ok) throw new Error('Failed to fetch pools');
  return res.json();
};

export const deletePool = async (id: string) => {
  const res = await apiFetch(`${apiBaseUrl}/api/pools/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete pool');
  return res.json();
};

export const removeQuestionFromPool = async (poolId: string, questionId: string) => {
  const res = await apiFetch(`${apiBaseUrl}/api/pools/${poolId}/questions/${questionId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' }
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to remove question from pool: ${errorText}`);
  }

  return res.json();
};
