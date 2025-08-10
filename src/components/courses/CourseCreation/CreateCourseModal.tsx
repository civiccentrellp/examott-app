"use client";
import React, { useEffect, useState } from "react";
import { Dialog } from "@headlessui/react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import BasicInfoTab from "./BasicInfoTab";
import AccessPricingTab from "./AccessPricingTab";
import { uploadCourseImage } from "@/utils/firebaseUpload";
import { addCourse, updateCourse, CourseStatus } from "@/utils/courses/getCourses";
import { toast } from "sonner";

export default function CreateCourseModal({
  isOpen,
  onClose,
  onSuccess,
  course, // <-- NEW
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (course: any) => void;
  course?: any; // <-- NEW
}) {
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(false);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [pricingOptionId, setPricingOptionId] = useState<string | null>(null);

  const [courseData, setCourseData] = useState<any>({
    name: "",
    description: "",
    goal: "",
    videoUrl: "",
    thumbnail: "",
    accessType: "SINGLE",
    startDate: "",
    endDate: "",
    duration: "",
    unit: "day",
    price: "",
    discount: "",
    expiryDate: "",
    pricingOptions: [],
  });

  // Prefill data when editing
  useEffect(() => {
    if (course) {
      const option = course.pricingOptions?.[0];

      const durationInDays = option?.durationInDays ?? null;
      let duration = "";
      let unit = "day";

      if (durationInDays) {
        if (durationInDays >= 365) {
          duration = (durationInDays / 365).toString();
          unit = "year";
        } else if (durationInDays >= 30) {
          duration = (durationInDays / 30).toString();
          unit = "month";
        } else {
          duration = durationInDays.toString();
        }
      }

      const price = option?.price?.toString() || "";
      const discount = option?.discount?.toString() || "";
      const expiryDate = option?.expiryDate?.slice(0, 10) || "";

      setCourseId(course.id);
      setPricingOptionId(option?.id || null);
      setCourseData({
        name: course.name || "",
        description: course.description || "",
        goal: course.goal || "",
        videoUrl: course.videoUrl || "",
        thumbnail: course.thumbnail || "",
        accessType: course.accessType || "SINGLE",
        startDate: course.startDate || "",
        endDate: course.endDate || "",
        duration,
        unit,
        price,
        discount,
        expiryDate,
        pricingOptions: course.pricingOptions || [],
        status: course.status || "UNPUBLISHED",
      });
    }
  }, [course]);


  const handleChange = (field: string, value: any) =>
    setCourseData((prev: any) => ({ ...prev, [field]: value }));

  const handleFileUpload = async (file: File) => {
    try {
      const url = await uploadCourseImage(file);
      handleChange("thumbnail", url);
    } catch (err) {
      console.error("Image upload failed:", err);
      toast.error("Image upload failed");
    }
  };

  const convertToDays = (duration: number, unit: string) => {
    if (!duration) return null;
    if (unit === "day") return duration;
    if (unit === "month") return duration * 30;
    if (unit === "year") return duration * 365;
    return duration;
  };

  const handleSaveBasicInfo = async () => {
    try {
      setLoading(true);
      const price = parseFloat(courseData.price || "0");
      const discount = parseFloat(courseData.discount || "0");
      const effectivePrice = Math.max(price - discount, 0);

      const pricingOptions =
        courseData.accessType === "MULTIPLE"
          ? courseData.pricingOptions
          : [
            {
              price,
              discount,
              effectivePrice,
              durationInDays:
                courseData.accessType === "SINGLE"
                  ? convertToDays(parseInt(courseData.duration), courseData.unit)
                  : null,
              expiryDate:
                courseData.accessType === "EXPIRY_DATE"
                  ? courseData.expiryDate
                  : null,
              promoted: true,
            },
          ];

      if (courseId) {
        // Editing existing course
        await updateCourse(courseId, {
          ...courseData,
          pricingOptions,
        });
        toast.success("Course info updated!");
      } else {
        // Creating new course
        const payload = {
          name: courseData.name,
          description: courseData.description,
          goal: courseData.goal,
          videoUrl: courseData.videoUrl,
          thumbnail: courseData.thumbnail,
          accessType: courseData.accessType,
          startDate: courseData.startDate || null,
          endDate: courseData.endDate || null,
          originalPrice: price,
          discountedPrice: effectivePrice,
          status: "UNPUBLISHED" as CourseStatus,
          pricingOptions,
        };
        const result = await addCourse(payload);
        setCourseId(result.data.id);
        setPricingOptionId(result.data.pricingOptions?.[0]?.id || null);
        toast.success("Basic info saved!");
      }

      setActiveTab("access");
    } catch (err) {
      console.error("Error saving course:", err);
      toast.error("Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFinal = async () => {
    try {
      setLoading(true);
      const price = parseFloat(courseData.price || "0");
      const discount = parseFloat(courseData.discount || "0");
      const effectivePrice = Math.max(price - discount, 0);

      const finalPricingOptions =
        courseData.accessType === "MULTIPLE"
          ? courseData.pricingOptions
          : [
            {
              price,
              discount,
              effectivePrice,
              durationInDays:
                courseData.accessType === "SINGLE"
                  ? convertToDays(parseInt(courseData.duration), courseData.unit)
                  : null,
              expiryDate:
                courseData.accessType === "EXPIRY_DATE"
                  ? courseData.expiryDate
                  : null,
              promoted: true,
            },
          ];

      await updateCourse(courseId!, {
        ...courseData,
        pricingOptions: finalPricingOptions,
      });

      toast.success("Course & Installments saved successfully");
      onSuccess({ ...courseData, id: courseId, pricingOptionId });
      onClose();
    } catch (err) {
      console.error("Error updating course:", err);
      toast.error("Failed to update course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50"
    >
      <Dialog.Panel className="relative h-[90%] w-full max-w-6xl flex flex-col overflow-hidden rounded-2xl border border-violet-200 bg-white shadow-[0_8px_40px_rgba(139,92,246,0.45)]">
        <div className="p-6 overflow-y-auto flex-1">
          <Dialog.Title className="text-2xl font-semibold mb-4 text-center">
            {course ? "Edit Course" : "Create Course"}
          </Dialog.Title>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="mb-6 flex justify-center gap-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="access">Access & Pricing</TabsTrigger>
            </TabsList>

            <TabsContent value="basic">
              <BasicInfoTab
                data={courseData}
                onChange={handleChange}
                onFileUpload={handleFileUpload}
              />
            </TabsContent>

            <TabsContent value="access">
              <AccessPricingTab
                data={{ ...courseData, courseId, pricingOptionId }}
                onChange={handleChange}
              />
            </TabsContent>
          </Tabs>
        </div>

        <div className="sticky bottom-0 p-4 flex justify-end gap-3 z-10">
          <Button className="w-full sm:w-1/2 px-4 py-2 rounded" variant="outline" onClick={onClose}>
            Cancel
          </Button>

          {activeTab === "basic" ? (
            <Button
              className="w-full sm:w-1/2 bg-violet-900 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={handleSaveBasicInfo}
              disabled={loading}
            >
              {loading ? "Saving..." : courseId ? "Update & Next" : "Save & Next"}
            </Button>
          ) : (
            <Button
              className="w-full sm:w-1/2 bg-violet-900 text-white px-4 py-2 rounded hover:bg-gray-600"
              onClick={handleSubmitFinal}
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          )}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
