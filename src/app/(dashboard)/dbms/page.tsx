'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { ChevronDoubleRight, ChevronDoubleLeft } from 'react-bootstrap-icons'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const subjects: string[] = ['Subject 1', 'Subject 2', 'Subject 3', 'Subject 4', 'Subject 5']

const chaptersMap: Record<string, string[]> = {
  'Subject 1': ['Chapter 1.1', 'Chapter 1.2', 'Chapter 1.3', 'Chapter 1.4'],
  'Subject 2': ['Chapter 2.1', 'Chapter 2.2', 'Chapter 2.3', 'Chapter 2.4'],
  'Subject 3': ['Chapter 3.1', 'Chapter 3.2', 'Chapter 3.3', 'Chapter 3.4'],
  'Subject 4': ['Chapter 4.1', 'Chapter 4.2', 'Chapter 4.3', 'Chapter 4.4'],
  'Subject 5': ['Chapter 5.1', 'Chapter 5.2', 'Chapter 5.3', 'Chapter 5.4'],
}

const topicsMap: Record<string, string[]> = {
  'Chapter 1.1': ['Topic 1.1.1', 'Topic 1.1.2'],
  'Chapter 2.1': ['Topic 2.1.1', 'Topic 2.1.2'],
}

const subTopicsMap: Record<string, string[]> = {
  'Topic 1.1.1': ['Subtopic 1.1.1.1'],
}

const questionsMap: Record<string, string[]> = {
  'Subtopic 1.1.1.1': ['Which two Native American leaders led Lakota Sioux and Cheyenne warriors in the fight against Lt. Col. George Custer’s troops in the Battle of Little Bighorn?',
    'What was the name of the landmark Supreme Court case that ruled the racial segregation of schools unconstitutional?',
    'The “shot heard round the world” describes the beginning of which battles in the American Revolution?']
}
const allQuestions: { subtopic: string; question: string }[] = Object.entries(questionsMap).flatMap(
  ([subtopic, questions]) =>
    questions.map((question) => ({
      subtopic,
      question,
    }))
)

const DBMS = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);


  return (
    <div className="p-2 space-y-6 ">
      <Tabs defaultValue="objective" className="w-full">
        {/* Tabs + Create button in a row */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full mb-4 gap-2">
          <TabsList className="flex w-full sm:max-w-md gap-2 p-2">
            <TabsTrigger value="objective" className="flex-1 text-center">Objective</TabsTrigger>
            <TabsTrigger value="descriptive" className="flex-1 text-center">Descriptive</TabsTrigger>
            <TabsTrigger value="videos" className="flex-1 text-center">Videos</TabsTrigger>
          </TabsList>
          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="sm:ml-4 whitespace-nowrap bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2"
              >
                Actions
                <ChevronRight
                  className={cn(
                    'transition-transform duration-300',
                    open && 'rotate-90'
                  )}
                  size={16}
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className=" bg-gray-300 w-48 border-1 rounded-lg shadow-lg p-2 flex flex-col gap-1">
              <DropdownMenuItem className=' font-medium fs-6 ' onSelect={() => console.log('Create Question')}>
                Create Question
              </DropdownMenuItem>
              <DropdownMenuItem className=' font-medium fs-6 ' onSelect={() => console.log('Add Folder')}>
                Add Folder
              </DropdownMenuItem>
              <DropdownMenuItem className=' font-medium fs-6 ' onSelect={() => console.log('Add to Pool')}>
                Add to Pool
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Input
          placeholder="Search questions..."
          className="mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <TabsContent value="objective">
          <div className="flex h-[68vh] overflow-hidden bg-white shadow-sm border-t">

            {/* Sidebar Wrapper with Toggle */}
            <div className={`flex transition-all duration-300 ${isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-fit'}`}>
              <div className="flex">
                {/* Subjects */}
                <div className="min-w-[220px] h-full overflow-y-auto p-4 border-r border-gray-200">
                  <h4 className="font-semibold text-gray-800 mb-3">Subject wise</h4>
                  {subjects.map((subj) => (
                    <div
                      key={subj}
                      className={`cursor-pointer px-3 py-2 rounded-md transition ${selectedSubject === subj
                        ? 'bg-gray-100 text-gray-800 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      onClick={() => {
                        setSelectedSubject(subj);
                        setSelectedChapter(null);
                        setSelectedTopic(null);
                        setSelectedSubTopic(null);
                      }}
                    >
                      {subj}
                    </div>
                  ))}
                </div>

                {/* Chapters */}
                {selectedSubject && (
                  <div className="min-w-[220px] h-full overflow-y-auto p-4 border-r border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Chapter wise</h4>
                    {chaptersMap[selectedSubject]?.map((chap) => (
                      <div
                        key={chap}
                        className={`cursor-pointer px-3 py-2 rounded-md transition ${selectedChapter === chap
                          ? 'bg-gray-100 text-gray-800 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        onClick={() => {
                          setSelectedChapter(chap);
                          setSelectedTopic(null);
                          setSelectedSubTopic(null);
                        }}
                      >
                        {chap}
                      </div>
                    ))}
                  </div>
                )}

                {/* Topics */}
                {selectedChapter && (
                  <div className="min-w-[220px] h-full overflow-y-auto p-4 border-r border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Topic wise</h4>
                    {topicsMap[selectedChapter]?.map((topic) => (
                      <div
                        key={topic}
                        className={`cursor-pointer px-3 py-2 rounded-md transition ${selectedTopic === topic
                          ? 'bg-gray-100 text-gray-800 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        onClick={() => {
                          setSelectedTopic(topic);
                          setSelectedSubTopic(null);
                        }}
                      >
                        {topic}
                      </div>
                    ))}
                  </div>
                )}

                {/* Subtopics */}
                {selectedTopic && (
                  <div className="min-w-[220px] h-full overflow-y-auto p-4 border-r border-gray-200">
                    <h4 className="font-semibold text-gray-800 mb-3">Subtopic wise</h4>
                    {subTopicsMap[selectedTopic]?.map((sub) => (
                      <div
                        key={sub}
                        className={`cursor-pointer px-3 py-2 rounded-md transition ${selectedSubTopic === sub
                          ? 'bg-gray-100 text-gray-800 font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                          }`}
                        onClick={() => setSelectedSubTopic(sub)}
                      >
                        {sub}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel (Toggle + Questions) */}
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              {/* Toggle Button */}
              <div className="p-2">
                <button
                  onClick={() => setIsSidebarCollapsed((prev) => !prev)}
                  className=" px-3 py-2 border border-dark hover:bg-gray-300 flex items-center justify-center transition rounded-md"
                >
                  {isSidebarCollapsed ? <ChevronDoubleRight size={20} /> : <ChevronDoubleLeft size={20} />}
                </button>
              </div>

              {/* Questions Section */}
              <div className="flex-1 overflow-auto p-4">

                <h4 className="font-semibold text-gray-800 mb-3">Questions</h4>

                {searchTerm.trim()
                  ? allQuestions
                    .filter((q) =>
                      q.question.toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .map((q, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 mb-2 text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                      >
                        <div className="text-sm text-gray-500 mb-1">
                          <span className="font-medium">Subtopic:</span> {q.subtopic}
                        </div>
                        {q.question}
                      </div>
                    ))
                  : selectedSubTopic &&
                  questionsMap[selectedSubTopic]?.map((q, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 mb-2 text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 transition"
                    >
                      {q}
                    </div>
                  ))}
              </div>
            </div>


          </div>

        </TabsContent>


        <TabsContent value="descriptive">Descriptive content goes here.</TabsContent>
        <TabsContent value="videos">Video content goes here.</TabsContent>
      </Tabs>
    </div>
  )
}

export default DBMS
