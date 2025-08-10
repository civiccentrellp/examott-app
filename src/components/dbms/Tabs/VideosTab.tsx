'use client'

import React, { useEffect, useState } from 'react'
import FolderStructure from '../SideBar/FolderStructure'
import QuestionsPanel from '../QuestionsPanel'
import useFolderState from '@/utils/dbms/useFolderState'
import { ChevronDoubleRight, ChevronDoubleLeft } from 'react-bootstrap-icons'
import VideosPanel from '../VideosPanel'

const VideosTab = () => {
  const folderState = useFolderState()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [selectedCourse, setSelectedCourse] = useState<string | null>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  return (
    <div className="flex flex-col md:flex-row h-[70vh] overflow-hidden bg-white shadow-sm border rounded">

      {/* Sidebar */}
      <div className={`transition-all duration-1000 ease-in-out transform 
        ${isSidebarCollapsed ? '-translate-x-full hidden md:flex md:w-0' : 'translate-x-0 flex w-full md:w-fit'} flex`}>
        <FolderStructure
          {...folderState}
          selectedCourse={selectedCourse}
          setSelectedCourse={setSelectedCourse}
          tabType="VIDEOS"
        />
      </div>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="p-2">
          <button
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            className="px-2 py-2 border-2 border-dark hover:bg-gray-300 flex items-center justify-center transition rounded-md"
          >
            {isSidebarCollapsed ? <ChevronDoubleRight size={20} /> : <ChevronDoubleLeft size={20} />}
          </button>
        </div>

        <div className="flex-1 overflow-auto">
        <VideosPanel selectedCourse={selectedCourse} setSelectedCourse={setSelectedCourse} />
        </div>
      </div>
    </div>
  )
}

export default VideosTab
