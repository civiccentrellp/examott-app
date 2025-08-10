"use client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import TiptapEditor from "@/components/ui/TiptapEditor";
import { useState } from "react";

export default function BasicInfoTab({ data, onChange, onFileUpload }: {
    data: any;
    onChange: (field: string, value: any) => void;
    onFileUpload: (file: File) => void;
}) {

    const [courseData, setCourseData] = useState<{
        name: string;
        description: any;
        goal: string;
        videoUrl: string;
        price: string;
        originalPrice: string;
        thumbnail: string;
        startDate: string;
        endDate: string;
        duration: string;
    }>({
        name: "",
        description: "",
        goal: "",
        videoUrl: "",
        price: "",
        originalPrice: "",
        thumbnail: "",
        startDate: "",
        endDate: "",
        duration: ""
    });

    return (
        <div className="space-y-4">
            <div>
                <Label>Course Name</Label>
                <Input value={data.name} onChange={(e) => onChange("name", e.target.value)} />
            </div>
            <div>
                <label className="block mb-2 text-sm text-gray-600 font-bold">
                    Description:
                </label>

                <TiptapEditor
                    content={data.description}
                    onUpdate={(value) => onChange("description", value)}
                    className="min-h-[140px]"
                />

            </div>
            <div>
                <Label>Course Goal</Label>
                <select className="w-full border p-2 rounded" value={data.goal} onChange={(e) => onChange("goal", e.target.value)}>
                    <option value="">Select</option>
                    <option value="UPSC">UPSC</option>
                    <option value="APPSC">APPSC</option>
                    <option value="TGPSC">TGPSC</option>
                </select>
            </div>
            <div>
                <Label>Video URL</Label>
                <Input value={data.videoUrl} onChange={(e) => onChange("videoUrl", e.target.value)} />
            </div>
            <div>
                <Label>Thumbnail</Label>
                <Input type="file" onChange={(e) => e.target.files?.[0] && onFileUpload(e.target.files[0])} />
                {data.thumbnail && <img src={data.thumbnail} alt="thumbnail" className="mt-2 h-24 rounded" />}
            </div>

            <div>
                <Label>Status</Label>
                <select
                    className="w-full border p-2 rounded"
                    value={data.status || "UNPUBLISHED"}
                    onChange={(e) => onChange("status", e.target.value)}
                >
                    <option value="UNPUBLISHED">Unpublished</option>
                    <option value="PUBLISH_PUBLIC">Published [Public]</option>
                    <option value="PUBLISH_PRIVATE">Published [Private]</option>
                    <option value="EXPIRED">Expired</option>
                </select>
            </div>

        </div>
    );
}
