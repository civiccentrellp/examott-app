'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';
import { Course, deleteCourse, getCourseById } from '@/utils/courses/getCourses';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { useUser } from '@/context/userContext';
import VisibilityCheck from '@/components/VisibilityCheck';
import CreateCourseModal from '../CourseCreation/CreateCourseModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronRight } from 'lucide-react';
import { cn } from '@/utils/cn';

const CourseOverviewTab = () => {
  const { user } = useUser();
  const router = useRouter();
  const params = useParams();
  const courseId = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [newThumbnailPreview, setNewThumbnailPreview] = useState<string | null>(null);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [open, setOpen] = useState(false);


  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      try {
        setLoading(true);
        const courseData = await getCourseById(courseId);
        setCourse(courseData);
      } catch (error) {
        console.error('Failed to fetch course', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleDeleteCourse = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'This course will be permanently deleted.',
      icon: 'warning',
      input: 'text',
      inputPlaceholder: 'Type DELETE to confirm',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      preConfirm: (val) => val !== 'DELETE' && Swal.showValidationMessage('Type DELETE to confirm'),
    });
    if (result.isConfirmed && result.value === 'DELETE') {
      try {
        await deleteCourse(courseId);
        Swal.fire('Deleted!', 'Course deleted successfully', 'success');
        router.push('/courses');
      } catch (err) {
        Swal.fire('Error', 'Could not delete course', 'error');
      }
    }
  };

  const getEmbeddedUrl = (url?: string) => {
    if (!url) return '';
    const match = url.match(/(?:youtube\.com\/(?:.*v=|embed\/)|youtu\.be\/)([^"&?/\s]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  const formatDateToDDMMYY = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${String(date.getDate()).padStart(2, '0')}/${String(
      date.getMonth() + 1
    ).padStart(2, '0')}/${String(date.getFullYear()).slice(-2)}`;
  };

  // --- Price & Expiry helpers ---
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

  const getExpiryInfo = (course: Course) => {
    const pricing = course.pricingOptions?.[0];
    if (course.accessType === 'SINGLE' && pricing?.durationInDays) {
      const years = (pricing.durationInDays / 365).toFixed(1).replace(/\.0$/, '');
      return `${years} year${Number(years) > 1 ? 's' : ''}`;
    }
    if (course.accessType === 'MULTIPLE') {
      const months = pricing?.durationInDays
        ? Math.round(pricing.durationInDays / 30)
        : null;
      return months ? `${months} month${months > 1 ? 's' : ''}` : 'Multiple validity options';
    }
    if (course.accessType === 'EXPIRY_DATE' && pricing?.expiryDate)
      return `${formatDateToDDMMYY(pricing.expiryDate)}`;
    if (course.accessType === 'LIFETIME') return 'Unlimited';
    return '';
  };

  const statusBadge = (status: string) => {
    const color =
      status === 'PUBLISH_PUBLIC'
        ? 'bg-green-100 text-green-700'
        : status === 'PUBLISH_PRIVATE'
          ? 'bg-blue-100 text-blue-700'
          : status === 'UNPUBLISHED'
            ? 'bg-gray-200 text-gray-700'
            : 'bg-red-100 text-red-600';
    return <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>{status}</span>;
  };

  if (loading) return <p className="p-4 text-gray-500">Loading...</p>;
  if (!course) return <p className="p-4 text-red-500">Course not found</p>;

  const pricing = getCoursePrice(course);
  const expiry = getExpiryInfo(course);

  return (
    <div>
      <VisibilityCheck user={user} check="student" checkType="role" invert>
        <div className="">
          {/* Floating Actions Button */}
          <div className="relative w-full flex justify-end">
            <DropdownMenu open={open} onOpenChange={setOpen}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="sm:ml-4 bg-gray-900 hover:bg-gray-700 text-white flex items-center gap-2"
                >
                  Actions
                  <ChevronRight
                    className={cn("transition-transform duration-300", open && "rotate-90")}
                    size={16}
                  />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-gray-300 w-48 border rounded-lg shadow-lg p-2 flex flex-col gap-1"
              >
                <DropdownMenuItem
                  onSelect={() => {
                    setIsEditModalOpen(true);
                  }}
                >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    handleDeleteCourse();
                  }}
                  className="text-red-600 focus:text-red-700"
                >
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Content */}
          <div className="w-full flex justify-between items-start">
            {/* Left Section */}
            <div className="w-90 flex flex-col gap-4">
              <h2 className="text-2xl font-semibold text-gray-900">{course.name}</h2>
              <div>
                <p className="text-lg font-semibold text-gray-800 mb-1">Description</p>
                <ReadOnlyTiptapRenderer jsonContent={course.description} />
              </div>

              {/* Fields Grid */}
              <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                <div className="flex items-center gap-4 p-3">
                  <span className="text-gray-900 font-semibold">Price :</span>
                  <span className="text-lg  text-gray-900">₹{pricing?.price ?? 0}</span>
                </div>
                <div className="flex items-center gap-4  p-3 ">
                  <span className="text-gray-900 font-semibold">Discounted :</span>
                  <span className="text-lg font-semibold text-green-600">
                    ₹{pricing?.effectivePrice ?? 0}
                  </span>
                </div>
                <div className="flex items-center gap-4  p-3 ">
                  <span className="text-gray-900 font-semibold">Expiry  :</span>
                  <span className="font-semibold">{expiry}</span>
                </div>
                <div className="flex items-center gap-4  p-3 ">
                  <span className="text-gray-900 font-semibold">Status  :</span>
                  {statusBadge(course.status)}
                </div>
              </div>
            </div>

            {/* Right Section (Media) */}
            <div className="w-1/3 flex flex-col gap-6">
              <div>
                <p className="font-semibold text-gray-700 mb-2">Course Thumbnail</p>
                <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-gray-100 shadow-md">
                  <img
                    src={newThumbnailPreview || course.thumbnail}
                    alt={course.name}
                    className="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              </div>
              <div>
                <p className="font-semibold text-gray-700 mb-2">Demo Video</p>
                <div className="relative w-full pt-[56.25%] rounded-xl overflow-hidden bg-gray-100 shadow-md">
                  <iframe
                    src={getEmbeddedUrl(newVideoUrl || course.videoUrl)}
                    className="absolute top-0 left-0 w-full h-full rounded-xl"
                    allowFullScreen
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </VisibilityCheck>

      {/* Edit Modal */}
      <CreateCourseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updatedCourse) => setCourse(updatedCourse)}
        course={course}
      />
    </div>
  );
};

export default CourseOverviewTab;
