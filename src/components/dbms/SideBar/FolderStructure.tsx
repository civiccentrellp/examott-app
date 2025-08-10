'use client'

import React, { useEffect, useState } from 'react'
import { getSubjects, Subject } from '@/utils/dbms/subject'
import { getChapters, Chapter } from '@/utils/dbms/chapter'
import { getTopics, Topic } from '@/utils/dbms/topic'
import { getSubTopics, SubTopic } from '@/utils/dbms/subTopic'
import { Course, getCourses } from '@/utils/courses/getCourses'
import { getVideoFolders, VideoFolder } from '@/utils/dbms/videoFolder' 

type Props = {
  selectedCourse: string | null
  setSelectedCourse: (value: string | null) => void
  selectedSubject: string | null
  selectedChapter: string | null
  selectedTopic: string | null
  selectedSubTopic: string | null
  setSelectedSubject: (value: string | null) => void
  setSelectedChapter: (value: string | null) => void
  setSelectedTopic: (value: string | null) => void
  setSelectedSubTopic: (value: string | null) => void
  tabType: 'OBJECTIVE' | 'DESCRIPTIVE' | 'VIDEOS' | 'COMPREHENSIVE'
}

const FolderStructure = ({
  selectedCourse,
  selectedSubject,
  selectedChapter,
  selectedTopic,
  selectedSubTopic,
  setSelectedCourse,
  setSelectedSubject,
  setSelectedChapter,
  setSelectedTopic,
  setSelectedSubTopic,
  tabType,
}: Props) => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [topics, setTopics] = useState<Topic[]>([])
  const [subTopics, setSubTopics] = useState<SubTopic[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [videoFolders, setVideoFolders] = useState<VideoFolder[]>([])

  useEffect(() => {
    if (tabType === 'VIDEOS') {
      getCourses().then(setCourses)
    } else {
      getSubjects().then(setSubjects)
    }
  }, [tabType])

  useEffect(() => {
    if (selectedSubject) {
      getChapters(selectedSubject).then(setChapters)
    } else {
      setChapters([])
    }
  }, [selectedSubject])

  useEffect(() => {
    if (selectedChapter) {
      getTopics(selectedChapter).then(setTopics)
    } else {
      setTopics([])
    }
  }, [selectedChapter])

  useEffect(() => {
    if (selectedTopic) {
      getSubTopics(selectedTopic).then(setSubTopics)
    } else {
      setSubTopics([])
    }
  }, [selectedTopic])

  const handleSubjectClick = (id: string) => {
    const isSelected = selectedSubject === id
    setSelectedSubject(isSelected ? null : id)
    if (!isSelected) {
      setSelectedChapter(null)
      setSelectedTopic(null)
      setSelectedSubTopic(null)
    }
  }

  const handleChapterClick = (id: string) => {
    const isSelected = selectedChapter === id
    setSelectedChapter(isSelected ? null : id)
    if (!isSelected) {
      setSelectedTopic(null)
      setSelectedSubTopic(null)
    }
  }

  const handleTopicClick = (id: string) => {
    const isSelected = selectedTopic === id
    setSelectedTopic(isSelected ? null : id)
    if (!isSelected) {
      setSelectedSubTopic(null)
    }
  }

  const handleSubTopicClick = (id: string) => {
    setSelectedSubTopic(selectedSubTopic === id ? null : id)
  }

  return (
    <div className="flex w-full overflow-x-auto">
     {tabType === 'VIDEOS' ? (
        <div className="w-full sm:w-[400px] h-full overflow-y-auto overflow-x-hidden p-4 border-r border-gray-200">
          <h4 className="font-semibold mb-3">Course wise</h4>
          {courses.map((course) => (
            <div key={course.id} className="mb-2">
              <div
                className={`cursor-pointer px-3 py-2 rounded-md ${
                  selectedCourse === course.id ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                }`}
                onClick={() =>
                  setSelectedCourse(selectedCourse === course.id ? null : course.id)
                }
              >
                {course.name}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="w-full sm:w-[220px] h-full overflow-y-auto p-4 border-r border-gray-200">
            <h4 className="font-semibold mb-3">Subject wise</h4>
            {subjects.map((subj) => (
              <div
                key={subj.id}
                className={`cursor-pointer px-3 py-2 rounded-md ${
                  selectedSubject === subj.id ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                }`}
                onClick={() => handleSubjectClick(subj.id)}
              >
                {subj.name}
              </div>
            ))}
          </div>

          {selectedSubject && (
            <div className="w-full sm:w-[220px] h-full overflow-y-auto p-4 border-r border-gray-200">
              <h4 className="font-semibold mb-3">Chapter wise</h4>
              {chapters.map((chap) => (
                <div
                  key={chap.id}
                  className={`cursor-pointer px-3 py-2 rounded-md ${
                    selectedChapter === chap.id ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleChapterClick(chap.id)}
                >
                  {chap.name}
                </div>
              ))}
            </div>
          )}

          {selectedChapter && (
            <div className="w-full sm:w-[220px] h-full overflow-y-auto p-4 border-r border-gray-200">
              <h4 className="font-semibold mb-3">Topic wise</h4>
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className={`cursor-pointer px-3 py-2 rounded-md ${
                    selectedTopic === topic.id ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleTopicClick(topic.id)}
                >
                  {topic.name}
                </div>
              ))}
            </div>
          )}

          {selectedTopic && (
            <div className="w-full sm:w-[220px] h-full overflow-y-auto p-4 border-r border-gray-200">
              <h4 className="font-semibold mb-3">Subtopic wise</h4>
              {subTopics.map((sub) => (
                <div
                  key={sub.id}
                  className={`cursor-pointer px-3 py-2 rounded-md ${
                    selectedSubTopic === sub.id ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => handleSubTopicClick(sub.id)}
                >
                  {sub.name}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default FolderStructure
