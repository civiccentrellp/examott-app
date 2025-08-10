import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllFreeMaterials,
  getAllFreeMaterialFolders,
  createFreeMaterial,
  createFreeMaterialFolder,
  updateFreeMaterialFolder,
  deleteFreeMaterialFolder,
  createFreeMaterialContent,
  updateFreeMaterialContent,
  deleteFreeMaterialContent,
  deleteFreeMaterial,
  FreeMaterialFolder,
  FreeMaterialContent,
  FlatFreeMaterial,
  FreeMaterialContentType
} from '@/utils/freeMaterial/freeMaterial';

// FOLDERS

export const useFreeMaterialFolders = (type?: 'VIDEO' | 'DOCUMENT' | 'TEST') => {
  return useQuery({
    queryKey: ['freeMaterialFolders', type],
    queryFn: () => getAllFreeMaterialFolders(type),
  });
};

export const useCreateFreeMaterialFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      parentId?: string;
      type: FreeMaterialContentType; 
    }) => createFreeMaterialFolder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeMaterialFolders'] });
    },
  });
};


export const useUpdateFreeMaterialFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, name, type }: { id: string; name: string; type: FreeMaterialContentType }) =>
      updateFreeMaterialFolder(id, name, type),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeMaterialFolders'] });
    },
  });
};

export const useDeleteFreeMaterialFolder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFreeMaterialFolder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeMaterialFolders'] });
    },
  });
};

// CONTENT

export const useCreateFreeMaterialContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFreeMaterialContent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeMaterialFolders'] });
    },
  });
};

export const useUpdateFreeMaterialContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id, title, type, videoId, documentUrl, testId,
    }: {
      id: string;
      title: string;
      type: FreeMaterialContentType;
      videoId?: string;
      documentUrl?: string;
      testId?: string;
    }) => updateFreeMaterialContent(id, title, type, videoId, documentUrl, testId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeMaterialFolders'] });
    },
  });
};


export const useDeleteFreeMaterialContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFreeMaterialContent(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeMaterialFolders'] });
    },
  });
};

// FLAT MATERIALS

export const useFreeMaterials = () => {
  return useQuery<FlatFreeMaterial[]>({
    queryKey: ['freeMaterials'],
    queryFn: getAllFreeMaterials,
  });
};


export const useCreateFreeMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFreeMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeMaterials'] });
    },
  });
};

export const useDeleteFreeMaterial = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFreeMaterial(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['freeMaterials'] });
    },
  });
};
