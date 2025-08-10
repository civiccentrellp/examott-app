'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { YouTubePlayer } from '@/components/ui/YouTubePlayer';
import PDFViewer from '@/components/ui/PDFViewer';
import CourseContents from '../Tabs/CourseContentsTab';
import { Course } from '@/utils/courses/getCourses';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import CourseFaqsTab from '../Tabs/CourseFaqsTab';
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';
import { Breadcrumb } from 'react-bootstrap';
import { useCourseContentProgress, useCourseProgressSummary, useLastOpenedContent, useSaveCourseContentProgress, useSaveLastOpenedContent } from '@/hooks/courses/useCourseContentProgress';
import { TrophyFill } from 'react-bootstrap-icons';
import { useQueryClient } from '@tanstack/react-query';
import { PlayCircle, Lock } from 'lucide-react';
import { useUserEnrolledCourses, useUserEnrollments } from '@/hooks/courses/useCourseEnrollments';
import { useUser } from '@/context/userContext';
import { toast } from 'sonner';

interface StudentCoursePageProps {
  course: Course;
}

export default function StudentCoursePage({ course }: StudentCoursePageProps) {
  const { user, loading } = useUser();
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const isEnrolled = searchParams.get('enrolled') === 'true';
  const router = useRouter();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'contents' | 'faq' | 'notes'>('overview');
  const [activeContentId, setActiveContentId] = useState<string | undefined>();
  const [isFullscreenMode, setIsFullscreenMode] = useState(false);
  const [showPlaceholder, setShowPlaceholder] = useState(false);
  const [enrolledCourses, setEnrolledCourses] = useState<string[]>([]);
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);
  const { data: enrolledCoursesFull } = useUserEnrolledCourses(user?.id || "", !!user?.id);
  const { data: enrollments } = useUserEnrollments(user?.id || "", !!user?.id);

  // Hooks for progress
  const { data: progress } = useCourseContentProgress(course.id);
  const { data: progressSummary, refetch: refetchProgressSummary } = useCourseProgressSummary(course.id);
  const { data: lastOpenedContent } = useLastOpenedContent(course.id);

  const saveProgressMutation = useSaveCourseContentProgress(course.id);
  const saveLastOpenedMutation = useSaveLastOpenedContent(course.id);

  const [activeContent, setActiveContent] = useState<{
    id: string;
    folderId: string;   // <-- required now
    type: 'VIDEO' | 'DOCUMENT' | 'IMAGE';
    url: string;
    title: string;
  } | null>(null);

  const [hasLoadedLastViewed, setHasLoadedLastViewed] = useState(false);

  useEffect(() => {
    if (
      isEnrolled &&
      lastOpenedContent?.content &&
      !activeContent &&
      !hasLoadedLastViewed
    ) {
      setActiveContent({
        id: lastOpenedContent.content.id,
        folderId: lastOpenedContent.folderId,
        type: lastOpenedContent.content.type,
        url: lastOpenedContent.content.url,
        title: lastOpenedContent.content.name,
      });
      setHasLoadedLastViewed(true); // only load once
    }
  }, [isEnrolled, lastOpenedContent, activeContent, hasLoadedLastViewed]);

  const handleContentSelect = (content: any) => {
    if (!isEnrolled) return;
    setActiveContent(content);
    setActiveContentId(content.id);


    saveProgressMutation.mutate(
      { contentId: content.id, isCompleted: true },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: ['courseProgressSummary', course.id],
          });

          saveLastOpenedMutation.mutate({ contentId: content.id, folderId: content.folderId });
        }
      }
    );
  };
  const completion = progressSummary?.percentage ?? 0;
  const watchedContents = progress
    ?.filter((p: { isCompleted: boolean; contentId: string }) => p.isCompleted)
    .map((p: { contentId: string }) => p.contentId) || [];

  const offset = completion === 0
    ? 8                  // move right by 8px at start
    : completion >= 98
      ? -28              // shift left so it doesn't overflow at end
      : -8;


  const extractYouTubeIdFromUrl = (url: string): string => {
    try {
      const parsedUrl = new URL(url);
      const vParam = parsedUrl.searchParams.get('v');
      if (vParam) return vParam;
      const shortMatch = url.match(/youtu\.be\/([\w-]+)/);
      if (shortMatch?.[1]) return shortMatch[1];
      const embedMatch = url.match(/youtube\.com\/embed\/([\w-]+)/);
      if (embedMatch?.[1]) return embedMatch[1];
      const liveMatch = url.match(/youtube\.com\/live\/([\w-]+)/);
      if (liveMatch?.[1]) return liveMatch[1];
      return '';
    } catch {
      return '';
    }
  };

  const getEmbeddedUrl = (url?: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([^"&?/\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const getCoursePrice = (course: Course) => {
    if (!course.pricingOptions || course.pricingOptions.length === 0) return null;
    const plan = course.pricingOptions.find((p) => p.promoted) || course.pricingOptions[0];
    return {
      price: plan.price,
      discount: plan.discount,
      effectivePrice: plan.effectivePrice ?? plan.price - (plan.discount || 0),
      pricingOptionId: plan.id,
    };
  };
  const pricing = getCoursePrice(course);

  return (
    <div className="w-full h-screen flex flex-col ">
      <div className="w-full flex items-center gap-12  border-b mb- mt-2 px-2">
        <button
          onClick={() => {
            router.push('/courses');
          }}
          className="inline-flex items-center text-sm sm:text-base text-violet-700 hover:underline"
        >
          <svg
            className="w-4 h-4 mr-1"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center gap-2 text-sm text-gray-500">

          <button
            onClick={() => router.push('/courses')}
            className="hover:text-purple-600 transition"
          >
            Courses
          </button>
          <span>/</span>
          <span className="text-gray-900 font-semibold">{course.name}</span>
        </div>
      </div>

      <div className="md:hidden flex flex-col flex-1 overflow-y-auto">

        <div
          className={`transition-all duration-300 ${isFullscreenMode
            ? 'fixed inset-0 z-50 bg-black flex items-center justify-center'
            : 'w-full'
            }`}
          style={
            isFullscreenMode
              ? {
                width: `${window.innerHeight}px`,
                height: `${window.innerWidth}px`,
                transform: 'rotate(90deg) translateY(-100%)',
                transformOrigin: 'top left',
                transition: 'transform 0.2s ease-in-out, width 0.2s ease-in-out, height 0.2s ease-in-out'
              }
              : {
                minHeight: '30vh',
                transition: 'transform 0.2s ease-in-out, width 0.2s ease-in-out, height 0.2s ease-in-out'
              }
          }
        >

          {isEnrolled ? (
            activeContent ? (
              activeContent.type === 'VIDEO' ? (
                <YouTubePlayer
                  videoId={extractYouTubeIdFromUrl(activeContent.url)}
                  onClose={() => {
                    setActiveContent(null);
                    setIsFullscreenMode(false);
                    if (window.screen.orientation) window.screen.orientation.unlock();
                  }}

                  isFullscreen={isFullscreenMode}
                  setIsFullscreen={(val) => {
                    setIsFullscreenMode(val);
                    if (val && window.screen.orientation) {
                      window.screen.orientation.lock('landscape').catch(() => { });
                    } else if (window.screen.orientation) {
                      window.screen.orientation.unlock();
                    }
                  }}
                />
              ) : activeContent.type === 'DOCUMENT' ? (
                <PDFViewer url={activeContent.url} />
              ) : (
                <img
                  src={activeContent.url}
                  className="h-full w-full object-contain"
                  onContextMenu={(e) => e.preventDefault()}
                />
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500">
                <PlayCircle className="w-12 h-12 mb-2 text-violet-500" />
                <p className="font-medium">Choose a lesson to start</p>
              </div>
            )
          ) : (
            <YouTubePlayer
              videoId={extractYouTubeIdFromUrl(course.videoUrl)}
              onClose={() => {
                setShowPlaceholder(true);
                setIsFullscreenMode(false);
                if (window.screen.orientation) window.screen.orientation.unlock();
              }}
              isFullscreen={isFullscreenMode}
              setIsFullscreen={(val) => {
                setIsFullscreenMode(val);
                if (val && window.screen.orientation) {
                  window.screen.orientation.lock('landscape').catch(() => { });
                } else if (window.screen.orientation) {
                  window.screen.orientation.unlock();
                }
              }}
            />
          )}
        </div>

        {/* Tabs (hide when fullscreen) */}
        {!isFullscreenMode && (
          <div className="bg-purple-50 rounded-t-lg flex flex-col h-full">
            <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500">
              {[
                { key: 'overview', label: 'Overview' },
                { key: 'contents', label: 'Contents' },
                { key: 'faq', label: 'FAQ' },
                { key: 'notes', label: 'Notes' }
              ].map((tab) => (
                <li
                  key={tab.key}
                  className={`me-2 rounded-t-2xl transition-colors duration-200 ${activeTab === tab.key ? 'bg-white' : 'bg-purple-50 rounded-b-[1rem]'
                    }`}
                >
                  <button
                    onClick={() => setActiveTab(tab.key as 'overview' | 'contents' | 'faq' | 'notes')}
                    className={`inline-block p-2 rounded-xl m-2 transition-colors duration-200 
                ${activeTab === tab.key
                        ? 'text-dark bg-violet-300 dark:bg-gray-800 dark:text-blue-500'
                        : 'hover:text-gray-900 hover:bg-white'
                      }`}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>

            {/* Scrollable tab content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white rounded-b-lg">
              {activeTab === 'overview' && (
                <>
                  <h1 className="text-xl font-extrabold text-gray-900">{course.name}</h1>
                  <div>
                    <ReadOnlyTiptapRenderer
                      jsonContent={course.description}
                      truncate={!showFullDesc}
                      truncateChars={100}
                      triggerKey={showFullDesc.toString()}
                      className="text-sm sm:text-base leading-relaxed text-gray-700"
                    />
                    <button
                      onClick={() => setShowFullDesc((prev) => !prev)}
                      className="text-purple-600 font-semibold hover:underline transition"
                    >
                      {showFullDesc ? 'View Less' : 'View More'}
                    </button>
                  </div>
                </>
              )}
              {activeTab === 'contents' && (
                <CourseContents
                  courseId={course.id}
                  isEnrolled={isEnrolled}
                  onContentSelect={handleContentSelect}
                  activeContentId={activeContentId}
                  watchedContents={watchedContents}
                  openVideoInModal={false}
                />
              )}
              {activeTab === 'faq' && <CourseFaqsTab courseId={course.id} />}
              {activeTab === 'notes' && <div>Notes content here</div>}
            </div>
          </div>
        )}
      </div>

      <div className="hidden md:flex flex-1 overflow-hidden">

        {/* === LEFT SIDE === */}
        <div className="w-[70%] overflow-y-auto ">
          {/* === Viewer Section === */}
          <div className={`${isFullscreenMode ? 'h-full' : 'h-[580px]'} transition-all`}>
            {isEnrolled ? (
              activeContent ? (
                activeContent.type === 'VIDEO' ? (
                  <YouTubePlayer
                    videoId={extractYouTubeIdFromUrl(activeContent.url)}
                    // onClose={() => setActiveContent(null)}
                    onClose={() => {
                      setActiveContent(null);
                      setIsFullscreenMode(false); // Reset fullscreen when closing
                    }}
                    isFullscreen={isFullscreenMode}
                    setIsFullscreen={setIsFullscreenMode}
                  />
                ) : activeContent.type === 'DOCUMENT' ? (
                  <PDFViewer url={activeContent.url} />
                ) : (
                  <img
                    src={activeContent.url}
                    className="h-full w-full object-contain rounded-lg shadow-lg"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                )
              ) : (
                <div className="h-full w-full flex flex-col items-center justify-center py-20 text-gray-500">
                  <PlayCircle className="w-12 h-12 mb-4 text-violet-500" />
                  <p className="font-medium">
                    Choose a lesson on the Content Panel to get started
                  </p>
                </div>
              )
            ) : showPlaceholder ? (
              <div className="h-full w-full flex flex-col items-center justify-center py-20 text-gray-500">
                <Lock className="w-10 h-10 mb-4 text-violet-500" />
                <p className="text-lg font-medium">
                  Unlock the course to access content
                </p>
              </div>
            ) : (
              <YouTubePlayer
                videoId={extractYouTubeIdFromUrl(course.videoUrl)}
                onClose={() => {
                  setShowPlaceholder(true);
                  setIsFullscreenMode(false);
                }}
                isFullscreen={isFullscreenMode}
                setIsFullscreen={setIsFullscreenMode}
              />
            )}
          </div>

          {/* === Tabs Section === */}
          {!isFullscreenMode && (
            <div className="bg-purple-50 rounded-t-lg flex flex-col h-full">
              <ul className="flex flex-wrap text-sm font-medium text-center text-gray-500">
                {[
                  { key: 'overview', label: 'Overview' },
                  { key: 'faq', label: 'FAQ' },
                  // { key: 'notes', label: 'Notes' }
                ].map((tab) => (
                  <li
                    key={tab.key}
                    className={`me-2 rounded-t-2xl transition-colors duration-200 ${activeTab === tab.key ? 'bg-white' : 'bg-purple-50 rounded-b-[1rem]'
                      }`}
                  >
                    <button
                      onClick={() => setActiveTab(tab.key as 'overview' | 'faq' | 'notes')}
                      className={`inline-block px-4 py-2 rounded-xl m-2 transition-colors duration-200 
              ${activeTab === tab.key
                          ? 'text-dark bg-violet-300 dark:bg-gray-800 dark:text-blue-500'
                          : 'hover:text-gray-900 hover:bg-white'
                        }`}
                    >
                      {tab.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="flex-1 overflow-y-auto px-4 py-2 space-y-4 bg-white rounded-b-lg">
                {activeTab === 'overview' && (
                  <>
                    <h1 className="text-xl text-gray-900">{course.name}</h1>
                    <div>
                      <ReadOnlyTiptapRenderer
                        jsonContent={course.description}
                        truncate={!showFullDesc}
                        truncateChars={100}
                        triggerKey={showFullDesc.toString()}
                        className="text-sm sm:text-base leading-relaxed text-gray-700"
                      />
                      <button
                        onClick={() => setShowFullDesc((prev) => !prev)}
                        className="text-purple-600 text-xs font-semibold hover:underline transition"
                      >
                        {showFullDesc ? 'View Less' : 'View More'}
                      </button>
                    </div>
                  </>
                )}

                {activeTab === 'faq' && <CourseFaqsTab courseId={course.id} />}
                {/* {activeTab === 'notes' && <div>Notes content here</div>} */}
              </div>
            </div>
          )}

        </div>

        {/* === RIGHT SIDE === */}
        <div className={`w-[30%] p-2 bg-white rounded-lg flex flex-col gap-4`}>
          {/* === BUY NOW CARD === */}
          {!isEnrolled && (
            <div className="w-full">

              <div className="relative w-full my-2">
                <div className="relative flex items-center justify-center py-2
                    rounded-2xl bg-white/10 backdrop-blur-xl border border-violet-500/30
                    shadow-[0_0_20px_rgba(139,92,246,0.5)] 
                    overflow-hidden">

                  {/* Animated gradient line */}
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-fuchsia-400 to-violet-500 opacity-80 slow-pulse" />

                  {/* Text */}
                  <h4 className="text-2xl font-medium text-white tracking-widest drop-shadow-lg z-10">
                    Unlock the Course
                  </h4>

                  {/* Futuristic accents */}
                  <span className="absolute -left-3 top-1/2 -translate-y-1/2 w-3 h-12 bg-violet-500 rounded-full blur-md" />
                  <span className="absolute -right-3 top-1/2 -translate-y-1/2 w-3 h-12 bg-fuchsia-400 rounded-full blur-md" />
                </div>
              </div>

              <div className="p-3 rounded-2xl border-1 border-violet-300">

                {/* Thumbnail */}
                <div className="overflow-hidden rounded-xl mb-4 relative">
                  <img
                    src={course.thumbnail || '/placeholder.jpg'}
                    alt={course.name}
                    className="w-full h-44 object-cover transition-transform duration-500 hover:scale-110"
                  />
                  <span className="absolute top-2 right-2 bg-white/90 text-violet-600 text-xs font-semibold px-2 py-1 rounded-full shadow">
                    Bestseller
                  </span>
                </div>

                {/* Title */}
                <h5 className="text-xl text-center font-semibold text-gray-800 mb-2 leading-snug">
                  {course.name}
                </h5>

                {/* Pricing */}
                {pricing ? (
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <span className="text-lg font-semibold">
                      ₹{pricing.effectivePrice}
                    </span>
                    {pricing.discount > 0 && (
                      <span className="line-through text-gray-400 text-sm">
                        ₹{pricing.price}
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-gray-500 mb-6 block text-center">No Pricing</span>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!user?.id) {
                      toast.error("Please login to continue");
                      return;
                    }
                    router.push(`/payments?courseId=${course.id}`);
                  }}
                  className="w-full text-center text-violet-500 font-medium bg-violet-50 rounded-lg border-1 border-violet-500 shadow-md px-3 lg:py-2 hover:bg-violet-300 transition-all duration-200 slow-pulse"
                >
                  Buy Now
                </button>

              </div>
            </div>
          )}


          {isEnrolled && (
            <div className="px-2 pt-4">
              <p className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                <span>Course Progress</span>
                <TrophyFill className="text-gray-900" />
              </p>

              {/* Progress Bar */}
              <div className="relative w-full h-2 bg-gradient-to-r from-gray-100 to-white rounded-full overflow-hidden shadow-inner">
                <div
                  className={`absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-violet-300 transition-all duration-700 ease-out shadow-md`}
                  style={{ width: `${completion}%` }}
                />
              </div>

              {/* Percentage Label Below the Bar */}
              <span
                className="absolute text-xs font-bold text-gray-600 transition-all duration-300"
                style={{
                  left: `calc(${completion}% + ${offset}px)`,
                  marginTop: '4px',

                  position: 'relative',
                  display: 'inline-block'
                }}
              >
                {`${completion}%`}
              </span>
            </div>
          )}

          <div className='p-2 overflow-y-auto'>
            <h6 className='text-lg font-semibold'>Course Contents</h6>
            <CourseContents courseId={course.id} isEnrolled={isEnrolled} onContentSelect={handleContentSelect} activeContentId={activeContentId} watchedContents={watchedContents} openVideoInModal={false} />
          </div>

        </div>

      </div>

    </div>
  );
}
