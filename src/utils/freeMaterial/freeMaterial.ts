import { apiFetch } from "../fetchApi";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.examottcc.in";

export type FreeMaterialContentType = 'VIDEO' | 'DOCUMENT' | 'TEST';

export type FreeMaterialContent = {
  id: string;
  title: string;
  type: FreeMaterialContentType;
  folderId: string;
  videoId?: string;
  documentUrl?: string;
  testId?: string;
  createdAt?: string;
};

export type FreeMaterialFolder = {
  id: string;
  name: string;
  parentId?: string | null;
  children?: FreeMaterialFolder[];
  contents?: FreeMaterialContent[];
  createdAt?: string;
};

export type FlatFreeMaterial = {
  id: string;
  title: string;
  description?: string;
  type: FreeMaterialContentType;
  videoId?: string;
  documentUrl?: string;
  testId?: string;
  createdAt?: string;
};

export function getPreviewUrl(content: FreeMaterialContent): string {
  if (content.type === 'DOCUMENT') return content.documentUrl || '';
  if (content.type === 'VIDEO') return content.videoId || '';
  return '';
}

// ------------------ FOLDER APIs ------------------

export async function getAllFreeMaterialFolders(type?: FreeMaterialContentType): Promise<FreeMaterialFolder[]> {
  try {
    const url = `${apiBaseUrl}/api/free-material/folders${type ? `?type=${type}` : ''}`;
    const res = await apiFetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to apiFetch folders');
    return await res.json();
  } catch (error) {
    console.error('❌ Error apiFetching folders:', error);
    return [];
  }
}

export async function createFreeMaterialFolder(data: {
  name: string;
  parentId?: string;
  type: FreeMaterialContentType;
}): Promise<FreeMaterialFolder> {
  const res = await apiFetch(`${apiBaseUrl}/api/free-material/folders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to create folder');
  return await res.json();
}

export async function updateFreeMaterialFolder(id: string, name: string, type: FreeMaterialContentType): Promise<FreeMaterialFolder> {
  const res = await apiFetch(`${apiBaseUrl}/api/free-material/folder/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, type }),
  });

  if (!res.ok) throw new Error('Failed to update folder');
  return await res.json();
}

export async function deleteFreeMaterialFolder(id: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/free-material/folder/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete folder');
}

// ------------------ CONTENT APIs ------------------

export async function createFreeMaterialContent(data: {
  title: string;
  type: FreeMaterialContentType;
  folderId: string;
  videoId?: string;
  documentUrl?: string;
  testId?: string;
}): Promise<FreeMaterialContent> {
  const res = await apiFetch(`${apiBaseUrl}/api/free-material/content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to create content');
  return await res.json();
}


export async function updateFreeMaterialContent(
  id: string,
  title: string,
  type: FreeMaterialContentType,
  videoId?: string,
  documentUrl?: string,
  testId?: string
): Promise<FreeMaterialContent> {
  const res = await apiFetch(`${apiBaseUrl}/api/free-material/content/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, type, videoId, documentUrl, testId }),
  });

  if (!res.ok) throw new Error('Failed to update content');
  return await res.json();
}


export async function deleteFreeMaterialContent(id: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/free-material/content/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete content');
}

// ------------------ FLAT MATERIAL APIs ------------------

export async function getAllFreeMaterials(): Promise<FlatFreeMaterial[]> {
  try {
    const res = await apiFetch(`${apiBaseUrl}/api/free-material`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to apiFetch free materials');
    return await res.json();
  } catch (err) {
    console.error('❌ Error apiFetching free materials:', err);
    return [];
  }
}

export async function createFreeMaterial(data: {
  title: string;
  description?: string;
  type: FreeMaterialContentType;
  videoId?: string;
  documentUrl?: string;
  testId?: string;
}): Promise<FlatFreeMaterial> {
  const res = await apiFetch(`${apiBaseUrl}/api/free-material`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error('Failed to create flat free material');
  return await res.json();
}

export async function deleteFreeMaterial(id: string) {
  const res = await apiFetch(`${apiBaseUrl}/api/free-material/${id}`, {
    method: 'DELETE',
  });

  if (!res.ok) throw new Error('Failed to delete free material');
}
