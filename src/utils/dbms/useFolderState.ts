'use client'

import { useState } from 'react'

const useFolderState = () => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [selectedSubTopic, setSelectedSubTopic] = useState<string | null>(null)

  return {
    selectedSubject,
    setSelectedSubject,
    selectedChapter,
    setSelectedChapter,
    selectedTopic,
    setSelectedTopic,
    selectedSubTopic,
    setSelectedSubTopic,
  }
}

export default useFolderState
