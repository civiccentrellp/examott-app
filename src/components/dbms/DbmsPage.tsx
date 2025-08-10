'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { ChevronRight, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import ObjectiveTab from './Tabs/ObjectiveTab'
import DescriptiveTab from './Tabs/DescriptiveTab'
import VideosTab from './Tabs/VideosTab'
import { Course, getCourses } from '@/utils/courses/getCourses'
import { getSubjects, addSubject, Subject } from '@/utils/dbms/subject'
import { addChapter, Chapter, getChapters } from '@/utils/dbms/chapter'
import { addTopic, getTopics, Topic } from '@/utils/dbms/topic'
import { getSubTopics, addSubTopic, SubTopic } from '@/utils/dbms/subTopic'
import CreateQuestionForm from './Forms/CreateQuestionForm'
import { Modal } from 'react-bootstrap';

import { toast } from "sonner"
import { addPool, addQuestionToPool } from '@/utils/dbms/pool'
import { addVideoFolder } from '@/utils/dbms/videoFolder'
import TestsTab from './Tabs/TestsTab'
import AddTestModal from '../tests/AddTestModal'
import { useDBMSTabStore } from '@/store/dbmsStore'
import ComprehensiveTab from './Tabs/ComprehensiveTab'

const DBMSPage = () => {
  const router = useRouter();
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [courses, setCourses] = useState<Course[]>([])
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subTopics, setSubTopics] = useState<SubTopic[]>([])

  const [folderType, setFolderType] = useState('subject')
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null)
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]);
  const [explanation, setExplanation] = useState("");
  const [subTopicId, setSubTopicId] = useState("");
  const { activeTab, setActiveTab } = useDBMSTabStore();

  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [isPoolMode, setIsPoolMode] = useState(false)

  const [folderName, setFolderName] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isCreatePoolModalOpen, setIsCreatePoolModalOpen] = useState(false);
  const [poolName, setPoolName] = useState('');

  const [isVideoFolderModalOpen, setIsVideoFolderModalOpen] = useState(false);
  const [videoFolderName, setVideoFolderName] = useState('');
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isUploadVideoModalOpen, setIsUploadVideoModalOpen] = useState(false);
  const [videoUrlInput, setVideoUrlInput] = useState('');
  const [videoTitle, setVideoTitle] = useState('')
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [selectedCourseForVideoFolder, setSelectedCourseForVideoFolder] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const courseData = await getCourses()
        setCourses(courseData)
      } catch {
        toast.error("Failed to fetch courses.")
      }
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const data = await getSubjects()
        setSubjects(data)
      } catch {
        toast.error("Failed to fetch subjects.")
      }
    }
    fetchSubjects()
  }, [])

  useEffect(() => {
    const fetchChapters = async () => {
      if (selectedSubject) {
        const data = await getChapters(selectedSubject)
        setChapters(data)
      } else {
        setChapters([])
      }
    }
    fetchChapters()
  }, [selectedSubject])

  useEffect(() => {
    const fetchTopics = async () => {
      if (selectedChapter) {
        const data = await getTopics(selectedChapter)
        setTopics(data)
      } else {
        setTopics([])
      }
    }
    fetchTopics()
  }, [selectedChapter])

  useEffect(() => {
    const fetchSubTopics = async () => {
      if (selectedTopic) {
        const data = await getSubTopics(selectedTopic)
        setSubTopics(data)
        console.log(subTopics)
      } else {
        setSubTopics([])
      }
    }
    fetchSubTopics()
  }, [selectedTopic])

  const handleAddFolder = () => {
    setIsModalOpen(true)
  }

  const handleCreateQuestion = () => {
    router.push(`/dbms/question-form?type=${activeTab}`);

  }
  const handleCreateTest = () => {
    setIsCreateModalOpen(true);
  }


  const handleFolderSubmit = async () => {
    if (!folderName.trim()) return toast.error("Enter folder name.")

    try {
      switch (folderType) {
        case "subject":
          if (!selectedCourse) return toast.error("Select course for subject.")
          await addSubject({ name: folderName, courseId: selectedCourse })
          toast.success("Subject added.")
          break

        case "chapter":
          if (!selectedSubject) return toast.error("Select subject for chapter.")
          await addChapter({ name: folderName, subjectId: selectedSubject })
          toast.success(`Chapter created under subject ${selectedSubject}`)
          break

        case "topic":
          if (!selectedChapter) return toast.error("Select chapter for topic.")
          await addTopic({ name: folderName, chapterId: selectedChapter })
          toast.success(`Topic created under chapter ${selectedChapter}`)
          break

        case "subtopic":
          if (!selectedTopic) return toast.error("Select topic for subtopic.")
          await addSubTopic({ name: folderName, topicId: selectedTopic })
          toast.success(`Subtopic created under topic ${selectedTopic}`)
          break
      }

      // Reset state
      setIsModalOpen(false)
      setFolderName('')
      setFolderType('subject')
      setSelectedCourse(null)
      setSelectedSubject(null)
      setSelectedChapter(null)
      setSelectedTopic(null)
    } catch {
      toast.error("Failed to create folder.")
    }
  }

  const handleAddToPool = () => {
    setIsPoolMode(true) // Enter selection mode
  }

  const handleFinishPool = () => {
    if (selectedQuestions.length === 0) {
      toast.error("Please select at least one question to create a pool.");
      return;
    }
    toast.success(`Added ${selectedQuestions.length} questions to pool!`)
    // setIsPoolMode(false) // Exit selection mode
    setIsCreatePoolModalOpen(true);
  }

  const handleCreatePool = async () => {
    if (!poolName.trim()) {
      toast.error("Please enter a pool name.");
      return;
    }

    try {
      // Create the pool
      const newPool = await addPool({ name: poolName });

      // Associate selected questions with the new pool
      await Promise.all(selectedQuestions.map(questionId => addQuestionToPool(newPool.id, questionId)));

      toast.success("Pool created successfully.");

      // Reset state
      setIsCreatePoolModalOpen(false);
      setPoolName('');
      setSelectedQuestions([]);
      setIsPoolMode(false);
    } catch (error) {
      toast.error("Failed to create pool.");
      console.error(error);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  return (
    <div className="px-4 space-y-6 h-[100%]">
      <Tabs
        value={activeTab.toLowerCase()}
        onValueChange={(val) => setActiveTab(val.toUpperCase() as "OBJECTIVE" | "DESCRIPTIVE" | "VIDEOS" | "TESTS")}
        className="w-full h-[100%]"
      >
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full mb-4 ">
          <TabsList className="flex w-full sm:max-w-2xl px-2 py-4 gap-2 bg-white text-gray-300 rounded-xl">
            <TabsTrigger value="objective" className="flex-1 text-center">Objective</TabsTrigger>
            <TabsTrigger value="descriptive" className="flex-1 text-center">Descriptive</TabsTrigger>
            <TabsTrigger value="comprehensive" className="flex-1 text-center">Comprehensive</TabsTrigger>
            <TabsTrigger value="videos" className="flex-1 text-center">Videos</TabsTrigger>
            <TabsTrigger value="tests" className="flex-1 text-center">Tests</TabsTrigger>
          </TabsList>

          <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="sm:ml-4 bg-violet-500 hover:bg-violet-600 text-white flex items-center gap-2">
                Actions
                <ChevronRight className={cn('transition-transform duration-300', open && 'rotate-90')} size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-300 w-48 border-1 rounded-lg shadow-lg p-2 flex flex-col gap-1">
              <DropdownMenuItem
                onSelect={() => {
                  if (activeTab === "TESTS") {
                    handleCreateTest();
                  } else {
                    handleCreateQuestion();
                  }
                }}>
                {activeTab === "TESTS" ? "Create Test" : "Create Question"}
              </DropdownMenuItem>

              <DropdownMenuItem onSelect={() => {
                if (activeTab === "VIDEOS") {
                  setIsVideoFolderModalOpen(true);
                } else {
                  handleAddFolder();
                }
              }}>
                Create Folder
              </DropdownMenuItem>
              {!isPoolMode && <DropdownMenuItem onSelect={handleAddToPool}>Add to Pool</DropdownMenuItem>}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Input
          placeholder="Search questions..."
          className="mb-4"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {/* Selected Questions Counter */}
        {isPoolMode && (
          <div className="flex items-center justify-end text-gray-600 font-medium w-full gap-2">

            Selected Questions: {selectedQuestions.length}

            {isPoolMode &&
              <Button variant="outline" className="sm:ml-4 bg-gray-900 hover:bg-gray-700 text-white flex items-center justify-end" onClick={handleFinishPool}>
                Create Pool
              </Button>
            }
            {/* {selectedQuestions.length !== 1 ? 's' : ''} */}
          </div>
        )}

        <TabsContent value="objective">
          <ObjectiveTab
            searchTerm={searchTerm}
            selectedQuestions={selectedQuestions}
            setSelectedQuestions={setSelectedQuestions}
            isPoolMode={isPoolMode}
          />
        </TabsContent>

        <TabsContent value="descriptive">
          <DescriptiveTab
            searchTerm={searchTerm}
            selectedQuestions={selectedQuestions}
            setSelectedQuestions={setSelectedQuestions}
            isPoolMode={isPoolMode} />
        </TabsContent>

        <TabsContent value="comprehensive">
          <ComprehensiveTab
            searchTerm={searchTerm}
            selectedQuestions={selectedQuestions}
            setSelectedQuestions={setSelectedQuestions}
            isPoolMode={isPoolMode}
          />
        </TabsContent>


        <TabsContent value="videos">
          <VideosTab />
        </TabsContent>
        <TabsContent value="tests">
          <TestsTab />
        </TabsContent>

      </Tabs>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center m-0 w-full">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl p-6 shadow-2xl space-y-4 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Add Folder</h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Folder Name</label>
              <Input
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Folder Type</label>
              <select
                value={folderType}
                onChange={(e) => setFolderType(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:shadow-none"
              >
                <option value="subject">Subject</option>
                <option value="chapter">Chapter</option>
                <option value="topic">Topic</option>
                <option value="subtopic">Subtopic</option>
              </select>
            </div>

            {(folderType === 'subject' || folderType === 'chapter' || folderType === 'topic' || folderType === 'subtopic') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
                <select
                  value={selectedCourse || ''}
                  onChange={(e) => setSelectedCourse(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:shadow-none"
                >
                  <option value="">Select Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {folderType !== 'subject' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Subject</label>
                <select
                  value={selectedSubject || ''}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:shadow-none"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            {['topic', 'subtopic'].includes(folderType) && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Chapter</label>
                <select
                  value={selectedChapter || ''}
                  onChange={(e) => setSelectedChapter(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:shadow-none"
                >
                  <option value="">Select Chapter</option>
                  {chapters.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {folderType === 'subtopic' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Topic</label>
                <select
                  value={selectedTopic || ''}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:shadow-none"
                >
                  <option value="">Select Topic</option>
                  {topics.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-between gap-2 pt-4">
              <Button variant="outline" className="flex items-center gap-2 w-full" onClick={() => setIsModalOpen(false)}>Cancel</Button>
              <Button variant="outline" className=" bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2 w-full" onClick={handleFolderSubmit}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {isCreatePoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Create Pool</h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Pool Name</label>
              <Input
                value={poolName}
                onChange={(e) => setPoolName(e.target.value)}
                placeholder="Enter pool name"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" className="flex items-center gap-2 w-50" onClick={() => setIsCreatePoolModalOpen(false)}>Cancel</Button>
              <Button variant="outline" className="bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2 w-50" onClick={handleCreatePool}>Save</Button>
            </div>
          </div>
        </div>
      )}

      {isVideoFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex justify-center items-center m-0">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4 border border-gray-200">
            <h3 className="text-xl font-semibold">Create Video Folder</h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Course</label>
              <select
                value={selectedCourseForVideoFolder || ''}
                onChange={(e) => setSelectedCourseForVideoFolder(e.target.value)}
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 text-sm focus:outline-none focus:ring-0 focus:shadow-none"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
            </div>

            <Input
              value={videoFolderName}
              onChange={(e) => setVideoFolderName(e.target.value)}
              placeholder="Folder Name"
            />

            {/* Tags Input */}
            <div className="space-y-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const newTag = tagInput.trim();
                    if (newTag && !tags.includes(newTag)) {
                      setTags(prevTags => [...prevTags, newTag]);
                      setTagInput('');
                    }
                  }
                }}
                placeholder="Press Enter to add Tags"
                className="focus:outline-none focus:ring-0"
              />

              {/* Tags Display */}
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, idx) => (
                  <div
                    className="flex items-center justify-between gap-1 px-2 py-1 text-sm bg-gray-200 rounded-2 border border-black"
                  >
                    <span>{tag}</span>
                    <X
                      size={16}
                      className="cursor-pointer text-gray-600"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </div>

                ))}
              </div>
            </div>



            <div className="flex justify-end gap-2">
              <Button variant="outline" className="flex items-center gap-2 w-50" onClick={() => setIsVideoFolderModalOpen(false)}>Cancel</Button>
              <Button
                variant="outline" className="bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2 w-50"
                onClick={async () => {
                  if (!videoFolderName.trim()) {
                    return toast.error("Please fill all fields.");
                  }
                  if (!selectedCourseForVideoFolder) return toast.error("Please select a course.");

                  try {
                    await addVideoFolder({
                      name: videoFolderName,
                      courseId: selectedCourseForVideoFolder,
                      videoTitle,
                      videoUrl: videoUrlInput,
                      // tags: tags.split(',').map(tag => tag.trim()).filter(Boolean)
                      tags,
                    });

                    toast.success("Video folder created!");

                    setVideoFolderName('');
                    setVideoTitle('');
                    setVideoUrlInput('');
                    setTags([]);
                    setSelectedCourseForVideoFolder(null);
                    setIsVideoFolderModalOpen(false);
                  } catch (err) {
                    console.error(err);
                    toast.error("Failed to create folder and video.");
                  }
                }}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center m-0">
          <AddTestModal
            onClose={() => setIsCreateModalOpen(false)}
            onTestCreated={(test) => {
              setIsCreateModalOpen(false);
              router.push(`/dbms/test-form?id=${test.id}`);
            }}
          />
        </div>
      )}

    </div>
  )
}

export default DBMSPage
