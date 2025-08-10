'use client';
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FreeDocumentsPanel from './documents/FreeDocumentsPanel';
import FreeVideosPanel from './videos/FreeVideosPanel';
import FreeTestsPanel from './tests/FreeTestsPanel';

const FreeMaterialTabs = () => {
  return (
    <div className="sm:p-4 space-y-6 h-[85%] overflow-y-auto">
      <h1 className="sm:text-2xl text-lg font-semibold text-gray-800">Free Materials</h1>

      <Tabs defaultValue="documents" className="w-full">
        <TabsList className="flex w-full sm:max-w-2xl px-2 py-4 m:gap-2 bg-white text-gray-300 rounded-xl">
          <TabsTrigger value="documents" className="flex-1 text-center p-2 rounded-xl ">Free Documents</TabsTrigger>
          <TabsTrigger value="videos" className="flex-1 text-center p-2 rounded-xl">Free Videos</TabsTrigger>
          <TabsTrigger value="tests" className="flex-1 text-center p-2 rounded-xl">Free Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="documents">
          <FreeDocumentsPanel />
        </TabsContent>
        <TabsContent value="videos">
          <FreeVideosPanel />

        </TabsContent>
        <TabsContent value="tests">
          <FreeTestsPanel />

        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FreeMaterialTabs;
