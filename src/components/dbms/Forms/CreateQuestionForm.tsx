import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, XSquare, XSquareFill } from 'react-bootstrap-icons';
import { Select, SelectItem, SelectTrigger, SelectValue, SelectContent } from '@/components/ui/select';
import { getCourses } from '@/utils/courses/getCourses';
import { getSubjects, Subject } from '@/utils/dbms/subject';
import { getChapters, Chapter } from '@/utils/dbms/chapter';
import { getTopics, Topic } from '@/utils/dbms/topic';
import { getSubTopics, SubTopic } from '@/utils/dbms/subTopic';
import { addQuestion, getQuestionById, updateQuestion } from '@/utils/dbms/question';
import { toast } from 'sonner';
import { uploadFileToFirebase } from '@/utils/firebaseUpload';
import { addAttachments } from '@/utils/dbms/attachments';
import { addOptions } from '@/utils/dbms/options';
import TiptapEditor from '@/components/ui/TiptapEditor';
import type { JSONContent } from '@tiptap/react';
import { useSearchParams } from 'next/navigation';
import { addQuestionsToSection } from '@/utils/tests/test';
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';
import { useUser } from '@/context/userContext';

const CreateQuestionForm = ({
    questionType,
    onClose,
    parentId
}: {
    questionType: "OBJECTIVE" | "DESCRIPTIVE" | "COMPREHENSIVE";
    onClose: () => void;
    parentId?: string | null;
    sectionId?: string | null;
}) => {

    const { user } = useUser();
    const searchParams = useSearchParams();
    const questionId = searchParams.get('questionId');
    const parentIdFromUrl = searchParams.get('parentId');
    const editMode = searchParams.get('editMode'); // 👈 New
    const sectionId = searchParams.get('sectionId');
    const formRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [subTopics, setSubTopics] = useState<SubTopic[]>([]);

    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSubject, setSelectedSubject] = useState('');
    const [selectedChapter, setSelectedChapter] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [selectedSubTopic, setSelectedSubTopic] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const [questionText, setQuestionText] = useState<JSONContent>({ type: 'doc', content: [] });
    const [options, setOptions] = useState(['', '', '', '']);
    const [correctAnswers, setCorrectAnswers] = useState([false, false, false, false]); // Track correct answers
    const [explanation, setExplanation] = useState<JSONContent>({ type: 'doc', content: [] });
    const [questionTypeState, setQuestionTypeState] = useState<"OBJECTIVE" | "DESCRIPTIVE" | "COMPREHENSIVE">(questionType);
    const [childQuestionType, setChildQuestionType] = useState<"OBJECTIVE" | "DESCRIPTIVE">("OBJECTIVE");
    const [childAnswerType, setChildAnswerType] = useState<"SINGLE" | "MULTIPLE">("SINGLE");

    const [answerType, setAnswerType] = useState<"SINGLE" | "MULTIPLE">("SINGLE");
    const [tagInput, setTagInput] = useState('');
    const [tags, setTags] = useState<{ id?: string; name: string }[]>([]);

    const [attachments, setAttachments] = useState<{ type: string; url: string; fileObject?: File }[]>([]);
    const [attachmentInput, setAttachmentInput] = useState<{ url: string; type: string }>({ url: "", type: "IMAGE" });
    const [fileInputs, setFileInputs] = useState<File[]>([]);
    const [showObjectiveOptions, setShowObjectiveOptions] = useState(false);
    const objectiveRef = useRef<HTMLDivElement | null>(null);
    const [isViewMode, setIsViewMode] = useState(false);
    const [isSaved, setIsSaved] = useState(false);
    const [questionEditorKey, setQuestionEditorKey] = useState(0);
    const [explanationEditorKey, setExplanationEditorKey] = useState(0);
    const [comprehensivePara, setComprehensivePara] = useState<JSONContent | null>(null);
    const [showParaModal, setShowParaModal] = useState(false);
    const [parentQuestionId, setParentQuestionId] = useState<string | null>(null);


    useEffect(() => {
        if (!parentQuestionId) {
            if (parentIdFromUrl) {
                setParentQuestionId(parentIdFromUrl);
            } else if (parentId) {
                setParentQuestionId(parentId);
            }
        }
    }, [parentIdFromUrl, parentId, parentQuestionId]);


    useEffect(() => {
        if (sectionId) {
            setSelectedCourse('');
            setSelectedSubject('');
            setSelectedChapter('');
            setSelectedTopic('');
            setSelectedSubTopic('');
        }
    }, [sectionId]);

    useEffect(() => {
        if (questionType === "COMPREHENSIVE" && !parentId) {
            if (editMode === "paragraph" && questionId && comprehensivePara === null) {
                // editing a parent
                const load = async () => {
                    const q = await getQuestionById(questionId);
                    const parsed = typeof q.paragraph === 'string' ? JSON.parse(q.paragraph) : q.paragraph;
                    setComprehensivePara(parsed);
                    setShowParaModal(true);
                };
                load();
            } else if (!questionId && comprehensivePara === null) {
                setShowParaModal(true);
            }
        }
    }, [questionId, questionType, editMode]);

    useEffect(() => { getCourses().then(setCourses).catch(() => toast.error('Failed to fetch courses.')); }, []);
    useEffect(() => { if (selectedCourse) getSubjects().then(setSubjects).catch(() => toast.error('Failed to fetch subjects.')); }, [selectedCourse]);
    useEffect(() => { if (selectedSubject) getChapters(selectedSubject).then(setChapters).catch(() => toast.error('Failed to fetch chapters.')); }, [selectedSubject]);
    useEffect(() => { if (selectedChapter) getTopics(selectedChapter).then(setTopics).catch(() => toast.error('Failed to fetch topics.')); }, [selectedChapter]);
    useEffect(() => { if (selectedTopic) getSubTopics(selectedTopic).then(setSubTopics).catch(() => toast.error('Failed to fetch subtopics.')); }, [selectedTopic]);

    const handleAddAttachment = async () => {
        if (!attachmentInput.url.trim() && fileInputs.length === 0) {
            return toast.error('Please provide an attachment.');
        }

        try {
            const newAttachments: { type: string; url: string; fileObject?: File }[] = [];

            if (fileInputs.length > 0) {
                for (const file of fileInputs) {
                    const path = `questions/temp/${Date.now()}-${file.name}`;
                    const url = await uploadFileToFirebase(file, path);
                    newAttachments.push({ type: attachmentInput.type, url, fileObject: file });
                }
                setFileInputs([]); // Clear after processing
                if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input UI
            } else if (attachmentInput.url.trim()) {
                newAttachments.push({ type: attachmentInput.type, url: attachmentInput.url });
            }

            setAttachments([...attachments, ...newAttachments]);
            setAttachmentInput({ url: '', type: 'IMAGE' });
        } catch (error) {
            toast.error('Attachment upload failed.');
        }
    };

    const handleSubmit = async () => {
        if (!questionText || !questionText.content || questionText.content.length === 0) {
            return toast.error('Please enter a question.');
        }

        if (!user || !user.id) {
            toast.error("User not authenticated.");
            return;
        }

        const isObjective =
            questionType === 'COMPREHENSIVE'
                ? childQuestionType === 'OBJECTIVE'
                : questionTypeState === 'OBJECTIVE';

        const currentAnswerType =
            questionType === 'COMPREHENSIVE' ? childAnswerType : answerType;

        const isComprehensiveParent = questionType === "COMPREHENSIVE" && !parentQuestionId;
        const isComprehensiveChild = questionType === "COMPREHENSIVE" && !!parentQuestionId;

        setIsLoading(true);
        try {
            const payload = {
                question: questionText,
                type: isComprehensiveChild ? childQuestionType : questionTypeState,
                correctType: isComprehensiveChild ? childAnswerType : answerType,
                subTopicId: sectionId ? undefined : selectedSubTopic?.trim(),
                explanation: isComprehensiveParent ? undefined : explanation,
                tags: isComprehensiveParent ? [] : tags,
                attachments: [],
                paragraph: isComprehensiveParent && comprehensivePara ? comprehensivePara : undefined,
                parentId: isComprehensiveChild ? parentQuestionId : undefined,
                sectionId: sectionId ?? undefined,
            };

            let questionRes = null;

            if (questionId) {
                questionRes = await updateQuestion(questionId, payload);
                toast.success('Question updated successfully');
            } else {
                questionRes = await addQuestion(payload);
                toast.success('Question created successfully');
            }

            if (isComprehensiveParent && !questionId && questionRes?.id) {
                setParentQuestionId(questionRes.id);
                toast.success('Paragraph saved. Now add child questions.');
                return;
            }

            const qId = questionId || questionRes.id;

            if (!isComprehensiveParent && attachments.length) {
                const validAttachments = attachments.map(att => ({
                    type: att.type as "IMAGE" | "PDF" | "VIDEO" | "URL",
                    url: att.url,
                }));
                await addAttachments(qId, validAttachments);
            }

            if (!isComprehensiveParent && isObjective) {
                const validOptions = options.filter(opt => opt.trim()).map((opt, idx) => ({
                    value: opt,
                    correct: correctAnswers[idx],
                }));
                await addOptions(qId, validOptions);
            }

            if (!questionId && sectionId) {
                await addQuestionsToSection(sectionId, [qId]);
            }

            handleNewQuestion();
        } catch (err) {
            toast.error('Failed to save question.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleRemoveTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag.name !== tagToRemove));
    };

    const resetForm = () => {
        // Reset all fields
        setSelectedCourse('');
        setSelectedSubject('');
        setSelectedChapter('');
        setSelectedTopic('');
        setSelectedSubTopic('');
        setQuestionText({ type: 'doc', content: [] });
        setOptions(['', '', '', '']);
        setCorrectAnswers([false, false, false, false]);
        setExplanation({ type: 'doc', content: [] });
        setTagInput('');
        setTags([]);
        setAttachments([]);
        setAttachmentInput({ url: '', type: 'IMAGE' });
        setFileInputs([]);
        setIsSaved(false);
        setIsViewMode(false);


        setQuestionEditorKey(prev => prev + 1);
        setExplanationEditorKey(prev => prev + 1);


        // ✅ Clear file input manually (IMPORTANT)
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleNewQuestion = () => {
        // Reset common fields
        setQuestionText({ type: 'doc', content: [] });
        setOptions(['', '', '', '']);
        setCorrectAnswers([false, false, false, false]);
        setExplanation({ type: 'doc', content: [] });
        setAttachments([]);
        setAttachmentInput({ url: '', type: 'IMAGE' });
        setFileInputs([]);
        setIsSaved(false);
        setIsViewMode(false);
        setQuestionEditorKey(prev => prev + 1);
        setExplanationEditorKey(prev => prev + 1);
        if (fileInputRef.current) fileInputRef.current.value = '';

        // If comprehensive, reset only child-specific state
        if (questionType === "COMPREHENSIVE") {
            setChildQuestionType("OBJECTIVE");
            setChildAnswerType("SINGLE");
            // ✅ Do NOT reset comprehensivePara or parentQuestionId
            return;
        }

        // ✅ Reset everything only for non-comprehensive types
        setParentQuestionId(null);
        setComprehensivePara(null);
        setQuestionTypeState("OBJECTIVE");
        setAnswerType("SINGLE");
    };


    useEffect(() => {
        function handleOutsideClick(event: MouseEvent) {
            if (!formRef.current) return;

            // Check if clicked element is inside form
            if (formRef.current.contains(event.target as Node)) {
                return; // Click inside form → do nothing
            }

            // ALSO: Check if clicked element is a dropdown (like Radix UI, HeadlessUI etc)
            const target = event.target as HTMLElement;
            if (target.closest('[data-radix-popper-content-wrapper]')) {
                return; // Click inside dropdown → do nothing
            }

            onClose(); // Otherwise, close form
        }

        document.addEventListener('mousedown', handleOutsideClick);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, [onClose]);

    useEffect(() => {
        const loadQuestionIfEditing = async () => {
            if (!questionId) return;
            try {
                const data = await getQuestionById(questionId);
                setSelectedSubTopic(data.subTopicId ?? '');
                setQuestionText(typeof data.question === 'string' ? JSON.parse(data.question) : data.question);
                setQuestionEditorKey(prev => prev + 1);

                if (data.explanation) {
                    setExplanation(typeof data.explanation === 'string' ? JSON.parse(data.explanation) : data.explanation);
                    setExplanationEditorKey(prev => prev + 1);
                }

                setQuestionTypeState(data.type);
                setAnswerType(data.correctType);
                setTags(data.tags?.map((t: any) => typeof t === 'string' ? t : t.name) || []);

                if (data.options) {
                    setOptions(data.options.map((o: any) => o.value));
                    setCorrectAnswers(data.options.map((o: any) => o.correct));
                }

                if (data.attachments) {
                    setAttachments(data.attachments);
                }

                if (data.parentId) {
                    setParentQuestionId(data.parentId); // ✅ It's a child
                } else if (data.paragraph) {
                    setComprehensivePara(typeof data.paragraph === 'string' ? JSON.parse(data.paragraph) : data.paragraph); // ✅ It's a parent
                }
            } catch (err) {
                toast.error('Failed to load question.');
            }
        };
        loadQuestionIfEditing();
    }, [questionId]);


    return (

        <div className="space-y-6 h-[95vh] p-2 flex flex-col justify-content-center align-items-center">
            {/* <div className='flex align-items-center justify-content-between w-full px-2'> */}
            <div className='w-full flex justify-content-between items-center'>
                <button
                    onClick={() => router.back()}
                    className="inline-flex items-center text-sm sm:text-base text-gray-700 hover:underline"
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

                <div><h2 className="text-xl text-gray-700 font-semibold text-center">{questionId ? 'Edit Question' : 'Create Question'}</h2></div>
                <div className="flex justify-end space-x-2">
                    {/* Finish Comprehensive Button */}
                    {questionType === "COMPREHENSIVE" && parentQuestionId && (
                        <Button
                            variant="destructive"
                            onClick={() => {
                                setParentQuestionId(null);
                                setComprehensivePara(null);
                                toast.success("Finished adding comprehensive question set.");
                            }}
                        >
                            Finish Comprehensive
                        </Button>
                    )}

                    {/* Save / Save & Add Next */}
                    {isSaved ? (
                        <Button variant="outline" onClick={() => setIsViewMode(false)} className="bg-gray-900 text-white hover:bg-gray-800">
                            Edit
                        </Button>
                    ) : (
                        <>
                            {questionTypeState === "COMPREHENSIVE" ? (
                                <Button variant="outline" onClick={handleSubmit} disabled={isLoading} className="bg-gray-900 text-white hover:bg-gray-800">
                                    {isLoading ? "Saving..." : "Save & Add Next"}
                                </Button>
                            ) : (
                                <Button variant="outline" onClick={handleSubmit} disabled={isLoading} className="bg-gray-900 text-white hover:bg-gray-800">
                                    {isLoading ? "Saving..." : "Save"}
                                </Button>
                            )}
                        </>
                    )}

                    {/* Reset Button */}
                    <Button onClick={resetForm} variant="outline" className="bg-gray-300 text-black hover:bg-gray-400">
                        Reset
                    </Button>
                </div>

            </div>

            {/* Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
                {[{
                    value: selectedCourse, setValue: setSelectedCourse, items: courses, placeholder: 'Select Course'
                }, {
                    value: selectedSubject, setValue: setSelectedSubject, items: subjects, placeholder: 'Select Subject'
                }, {
                    value: selectedChapter, setValue: setSelectedChapter, items: chapters, placeholder: 'Select Chapter'
                }, {
                    value: selectedTopic, setValue: setSelectedTopic, items: topics, placeholder: 'Select Topic'
                }, {
                    value: selectedSubTopic, setValue: setSelectedSubTopic, items: subTopics, placeholder: 'Select Subtopic'
                }].map((dropdown, index) => (
                    <Select key={index} onValueChange={dropdown.setValue} value={dropdown.value} disabled={!!sectionId || isViewMode}>
                        <SelectTrigger>
                            <SelectValue placeholder={dropdown.placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {dropdown.items.map((item: any) => (
                                <SelectItem key={item.id} value={item.id}>{item.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                ))}


                {/* Tags Input */}
                <div className="space-y-2">
                    <Input
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const trimmed = tagInput.trim();
                                if (trimmed && !tags.some(tag => tag.name === trimmed)) {
                                    setTags(prevTags => [...prevTags, { name: trimmed }]);
                                    setTagInput('');
                                }
                            }
                        }}
                        placeholder="Add a tag and press Enter"
                        disabled={isViewMode}
                    />

                    {/* Tags Display */}
                    <div className="flex flex-wrap gap-2 mt-2 w-full">
                        {tags.map((tag, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-2 px-2 py-1 text-sm bg-gray-200 rounded-2 border border-black">
                                {tag.name}
                                <X
                                    size={18}
                                    className="cursor-pointer text-gray-600"
                                    onClick={() => handleRemoveTag(tag.name)}
                                />
                            </div>
                        ))}
                    </div>
                </div>


                {/* Question Type Selector */}
                <div className="relative">
                    <Select
                        value={
                            questionTypeState === "DESCRIPTIVE"
                                ? "DESCRIPTIVE"
                                : answerType === "SINGLE"
                                    ? "OBJECTIVE_SINGLE"
                                    : "OBJECTIVE_MULTIPLE"
                        }
                        onValueChange={(value) => {
                            if (value === "DESCRIPTIVE") {
                                setQuestionTypeState("DESCRIPTIVE");
                                setAnswerType("SINGLE");
                            } else if (value === "OBJECTIVE_SINGLE") {
                                setQuestionTypeState("OBJECTIVE");
                                setAnswerType("SINGLE");
                            } else if (value === "OBJECTIVE_MULTIPLE") {
                                setQuestionTypeState("OBJECTIVE");
                                setAnswerType("MULTIPLE");
                            } else if (value === "COMPREHENSIVE") {
                                setQuestionTypeState("COMPREHENSIVE");
                                setShowParaModal(true);
                            }
                        }}

                        disabled={isViewMode}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select Question Type">
                                {questionTypeState === "DESCRIPTIVE"
                                    ? "Descriptive"
                                    : questionTypeState === "COMPREHENSIVE"
                                        ? "Comprehensive"
                                        : `Objective (${answerType === "SINGLE" ? "Single" : "Multiple"})`}
                            </SelectValue>
                        </SelectTrigger>

                        <SelectContent>
                            <SelectItem value="DESCRIPTIVE">Descriptive</SelectItem>
                            <SelectItem value="OBJECTIVE_SINGLE">Objective → Single Correct</SelectItem>
                            <SelectItem value="OBJECTIVE_MULTIPLE">Objective → Multiple Correct</SelectItem>
                            <SelectItem value="COMPREHENSIVE">Comprehensive</SelectItem>
                        </SelectContent>
                    </Select>

                </div>


                {showObjectiveOptions && (
                    <div
                        onMouseEnter={() => setShowObjectiveOptions(true)}
                        onMouseLeave={() => setShowObjectiveOptions(false)}
                        className="absolute z-50 bg-white border shadow-lg rounded w-64 ml-2 mt-1"
                        style={{
                            top: objectiveRef.current?.getBoundingClientRect().top ?? 0,
                            left: (objectiveRef.current?.getBoundingClientRect().right ?? 0) + 10,
                            position: 'fixed'
                        }}
                    >
                        <div
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                setQuestionTypeState("OBJECTIVE");
                                setAnswerType("SINGLE");
                                setShowObjectiveOptions(false);
                            }}
                        >
                            Single Correct Answer
                        </div>
                        <div
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                            onClick={() => {
                                setQuestionTypeState("OBJECTIVE");
                                setAnswerType("MULTIPLE");
                                setShowObjectiveOptions(false);
                            }}
                        >
                            Multiple Correct Answers
                        </div>
                    </div>
                )}

            </div>

            <div className=' bg-white p-4 space-y-6 rounded border-2 border-black w-[98%] overflow-y-auto h-[90%]'>

                {questionTypeState === "COMPREHENSIVE" && (
                    <div className="space-y-6 w-full">

                        {/* Question Type Selector for child question */}
                        <div className="w-full">
                            <label className="text-sm font-medium">Select Question Type</label>
                            <Select
                                onValueChange={(value) => {
                                    if (value === "DESCRIPTIVE") {
                                        setChildQuestionType("DESCRIPTIVE");
                                        setChildAnswerType("SINGLE");
                                    } else if (value === "OBJECTIVE_SINGLE") {
                                        setChildQuestionType("OBJECTIVE");
                                        setChildAnswerType("SINGLE");
                                    } else if (value === "OBJECTIVE_MULTIPLE") {
                                        setChildQuestionType("OBJECTIVE");
                                        setChildAnswerType("MULTIPLE");
                                    }
                                }}
                            >

                                <SelectTrigger>
                                    <SelectValue placeholder="Choose type for this question" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DESCRIPTIVE">Descriptive</SelectItem>
                                    <SelectItem value="OBJECTIVE_SINGLE">Objective → Single Correct</SelectItem>
                                    <SelectItem value="OBJECTIVE_MULTIPLE">Objective → Multiple Correct</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {/* Question */}
                <div className="space-y-2 w-[full]">
                    <label className="text-sm font-medium">Question</label>
                    <div className="w-full">
                        <TiptapEditor content={questionText} onUpdate={isViewMode ? undefined : setQuestionText} editable={!isViewMode} placeholder="Enter your question here..." key={questionEditorKey} />
                    </div>
                </div>

                {/* Options */}
                {(questionTypeState === 'COMPREHENSIVE' ? childQuestionType : questionTypeState) === 'OBJECTIVE' && (

                    <div className="space-y-4">
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center space-x-2">
                                <input
                                    type={(questionType === "COMPREHENSIVE" ? childAnswerType : answerType) === "MULTIPLE" ? "checkbox" : "radio"}
                                    checked={correctAnswers[idx]}
                                    onChange={() => {
                                        const newCorrectAnswers = [...correctAnswers];
                                        if ((questionType === "COMPREHENSIVE" ? childAnswerType : answerType) === "SINGLE") {
                                            newCorrectAnswers.fill(false);
                                            newCorrectAnswers[idx] = true;
                                        } else {
                                            newCorrectAnswers[idx] = !newCorrectAnswers[idx];
                                        }
                                        setCorrectAnswers(newCorrectAnswers);
                                    }}
                                    className={
                                        (questionType === "COMPREHENSIVE" ? childAnswerType : answerType) === 'SINGLE'
                                            ? 'custom-radio'
                                            : 'custom-checkbox'
                                    }

                                />
                                <Input
                                    value={opt}
                                    onChange={(e) => {
                                        const newOpts = [...options];
                                        newOpts[idx] = e.target.value;
                                        setOptions(newOpts);
                                    }}
                                    placeholder={`Option ${idx + 1}`}
                                    className={
                                        (questionType === "COMPREHENSIVE" ? childAnswerType : answerType) === 'SINGLE'
                                            ? 'custom-radio'
                                            : 'custom-checkbox'
                                    } />
                            </div>
                        ))}
                    </div>
                )}

                {/* Attachments */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Attachments</label>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Select value={attachmentInput.type} onValueChange={(val) => setAttachmentInput({ ...attachmentInput, type: val })}>
                            <SelectTrigger className="w-[150px]">
                                <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="IMAGE">Image</SelectItem>
                                <SelectItem value="PDF">PDF</SelectItem>
                                <SelectItem value="VIDEO">Video</SelectItem>
                                <SelectItem value="URL">External Link</SelectItem>
                            </SelectContent>
                        </Select>
                        {['IMAGE', 'PDF'].includes(attachmentInput.type)
                            ? <Input
                                type="file"
                                accept={attachmentInput.type === "IMAGE" ? "image/*" : ".pdf"}
                                multiple
                                onChange={(e) => {
                                    const files = e.target.files ? Array.from(e.target.files) : [];
                                    setFileInputs(files);
                                }}
                                ref={fileInputRef}
                            />

                            : <Input value={attachmentInput.url} onChange={(e) => setAttachmentInput({ ...attachmentInput, url: e.target.value })} placeholder="Enter URL" />}
                        <Button variant="outline" onClick={handleAddAttachment} className="bg-gray-900 text-white hover:bg-gray-800" >Add</Button>
                    </div>
                    {attachments.map((a, i) => (
                        <div key={i} className="flex justify-between items-start gap-4 bg-gray-100 p-3 rounded-md border text-sm">
                            <div>
                                <p className="font-medium">{a.type}</p>
                                {a.type === 'IMAGE' && <img src={a.url} className="w-32 rounded" />}
                                {a.type === 'PDF' && <a href={a.url} target="_blank" className="text-blue-600 underline">View PDF</a>}
                                {a.type === 'VIDEO' && <video src={a.url} controls className="w-64 rounded" />}
                                {a.type === 'URL' && <a href={a.url} target="_blank" className="text-blue-600 underline">Visit Link</a>}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => setAttachments(attachments.filter((_, index) => index !== i))}>Remove</Button>
                        </div>
                    ))}
                </div>

                {/* Explanation */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Explanation</label>
                    <TiptapEditor content={explanation} onUpdate={isViewMode ? undefined : setExplanation} editable={!isViewMode} placeholder="Enter your explanation here..." key={explanationEditorKey} />
                </div>


            </div>
            {showParaModal && (!parentId && !parentIdFromUrl || editMode === "paragraph") && (
                <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex justify-center items-center m-0 w-full">
                    <div className="bg-white p-6 rounded-lg shadow-xl w-[80%] max-w-3xl">
                        <h2 className="text-lg font-bold mb-4">Enter Comprehensive Paragraph</h2>
                        <TiptapEditor
                            content={comprehensivePara || { type: 'doc', content: [] }}
                            onUpdate={setComprehensivePara}
                            editable={true}
                            placeholder="Type the paragraph..."
                        />
                        <div className="flex justify-end gap-4 mt-4">
                            <Button variant="outline" onClick={() => setShowParaModal(false)}>Cancel</Button>
                            {/* <Button
                                className="bg-gray-900 text-white"
                                onClick={() => {
                                    if (!comprehensivePara || comprehensivePara.content?.length === 0) {
                                        return toast.error("Paragraph can't be empty.");
                                    }
                                    handleSubmit();
                                    setShowParaModal(false);
                                }}
                            >
                                Save Paragraph
                            </Button> */}
                            <Button
                                className="bg-gray-900 text-white"
                                onClick={async () => {
                                    if (!comprehensivePara || comprehensivePara.content?.length === 0) {
                                        return toast.error("Paragraph can't be empty.");
                                    }

                                    try {
                                        if (questionId) {
                                            // Edit mode
                                            await updateQuestion(questionId, { paragraph: comprehensivePara });
                                            setParentQuestionId(questionId);
                                            toast.success("Paragraph updated");
                                            setShowParaModal(false);
                                            router.push('/dbms');
                                        } else {
                                            // Create mode (new comprehensive parent)
                                            const parent = await addQuestion({
                                                type: "COMPREHENSIVE",
                                                correctType: "SINGLE", // Default, not used here
                                                question: { type: 'doc', content: [] }, // empty, not needed
                                                paragraph: comprehensivePara,
                                                subTopicId: sectionId ? undefined : selectedSubTopic?.trim(),
                                                tags,
                                                attachments: [],
                                            });

                                            if (parent?.id) {
                                                if (sectionId) {
                                                    await addQuestionsToSection(sectionId, [parent.id]);
                                                }
                                                setParentQuestionId(parent.id);
                                                toast.success("Paragraph saved. Now add child questions.");
                                                setShowParaModal(false);
                                            }
                                        }
                                    } catch (err) {
                                        toast.error("Failed to save paragraph.");
                                        console.error(err);
                                    }
                                }}
                            >
                                Save Paragraph
                            </Button>



                        </div>
                    </div>
                </div>
            )}

        </div>
        //     </div>
        // </div>
    );
};

export default CreateQuestionForm;
