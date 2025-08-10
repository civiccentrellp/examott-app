'use client';

import React, { useState } from 'react';
import ReadOnlyTiptapRenderer from '@/components/ui/ReadOnlyTiptapRenderer';
import { Button } from '@/components/ui/button';
import { Paperclip, Pencil, Trash } from 'react-bootstrap-icons';
import { Check2 } from 'react-bootstrap-icons';
import { MinusCircle, Plus, PlusCircle } from 'lucide-react';
import { updateTestQuestionMarks } from '@/utils/tests/test';

type QuestionCardProps = {
    question: any;
    index?: number;
    isExpanded?: boolean;
    onToggleExpand?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    showCheckbox?: boolean;
    checked?: boolean;
    onCheckChange?: (checked: boolean) => void;
    showChildren?: boolean;
    childrenQuestions?: any[];
    onChildEdit?: (child: any) => void;
    onChildDelete?: (childId: string) => void;
    onAddChild?: (parent: any) => void;
    allowNegative?: boolean;
    showMarks?: boolean;
};

const safeParse = (input: any) =>
    typeof input === 'string' ? JSON.parse(input) : input;

const QuestionCard: React.FC<QuestionCardProps> = ({
    question,
    index,
    isExpanded = false,
    onToggleExpand,
    onEdit,
    onDelete,
    showCheckbox = false,
    checked = false,
    onCheckChange,
    showChildren = false,
    childrenQuestions = [],
    onChildEdit,
    onChildDelete,
    onAddChild,
    allowNegative,
    showMarks
}) => {

    const isComprehensive = question.type === 'COMPREHENSIVE';
    const parsed = safeParse(isComprehensive ? question.paragraph : question.question);
    const explanation = safeParse(question.explanation);
    const [isEditingMarks, setIsEditingMarks] = useState(false);
    const [marksInput, setMarksInput] = useState(question.marks ?? 0);
    const [negativeInput, setNegativeInput] = useState(question.negativeMarks ?? 0);

    const handleMarksSave = async () => {
        setIsEditingMarks(false);
        await updateTestQuestionMarks(question.testQuestionId, {
            marks: parseFloat(marksInput),
            negativeMarks: parseFloat(negativeInput),
        });
    };

    return (
        <div
            onClick={onToggleExpand}
            className="group relative flex flex-col gap-2 mb-6 rounded border border-gray-200 bg-white hover:shadow-md transition-all p-3"
        >
            <div className="flex items-start gap-4">
                {showCheckbox && (
                    <label className="mt-1">
                        <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => {
                                e.stopPropagation();
                                onCheckChange?.(e.target.checked);
                            }}
                            className="sr-only"
                        />
                        <div
                            className={`w-5 h-5 border-2 rounded-md flex items-center justify-center transition ${checked ? 'bg-gray-900 border-black' : 'border-gray-400'}`}
                        >
                            {checked && <Check2 className="text-white w-3 h-3" />}
                        </div>
                    </label>
                )}

                <div className="flex-1 flex items-start gap-2 text-sm text-gray-800">
                    {typeof index === 'number' && (
                        <div className="font text-gray-700 mb-1">{index + 1}.</div>
                    )}
                    <ReadOnlyTiptapRenderer className="" jsonContent={parsed} />
                </div>

            </div>

            {isExpanded && (
                <div className="space-y-4">
                    {/* Tags & Created By */}
                    <div className="flex items-center justify-between">
                        <div className="min-h-[28px] flex items-center gap-2">
                           
                            {!isComprehensive ? (
                                // For Objective/Descriptive
                                question.tags?.length > 0 && (
                                    <div className="min-h-[28px] flex items-center flex-wrap gap-2">
                                        {question.tags.map((tag: any) => (
                                            <span key={tag.id} className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded-2 border border-black">
                                                {tag.name}
                                            </span>
                                        ))}
                                    </div>
                                )
                            ) : (
                                // For Comprehensive – show combined child tags
                                Array.isArray(childrenQuestions) &&
                                childrenQuestions.some((child) => Array.isArray(child.tags) && child.tags.length > 0) && (
                                    <div className="min-h-[28px] flex items-center flex-wrap gap-2">
                                        {childrenQuestions.flatMap((child) => child.tags || []).map((tag: any, index) => (
                                            <span key={`${tag.id}-${index}`} className="bg-gray-100 text-gray-800 px-2 py-1 text-xs rounded-2 border border-black">
                                                {tag.name}
                                            </span>

                                        ))}
                                    </div>
                                )
                            )}

                            {question.createdBy?.name && (
                                <div className="bg-blue-100 text-gray-800 px-2 py-1 text-xs rounded-2 border border-black">
                                    Created by: <span className="font-medium">{question.createdBy.name}</span>
                                </div>
                            )}

                            {showMarks && (
                                <div className="flex items-center gap-3">
                                    {isEditingMarks ? (
                                        <div className="flex gap-2 items-center">
                                            <input
                                                type="number"
                                                value={marksInput}
                                                onChange={(e) => setMarksInput(e.target.value)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border p-1 w-16 text-center rounded-lg focus:outline-none focus:ring-0 focus:shadow-none"
                                            />
                                            {allowNegative && (
                                                <input
                                                    type="number"
                                                    value={negativeInput}
                                                    onChange={(e) => setNegativeInput(e.target.value)}
                                                    onClick={(e) => e.stopPropagation()}
                                                    className="appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none border p-1 w-16 rounded-lg focus:outline-none focus:ring-0 focus:shadow-none"
                                                />
                                            )}

                                            <Button size="sm" onClick={(e) => {
                                                e.stopPropagation();
                                                handleMarksSave();
                                            }}>Save</Button>
                                        </div>
                                    ) : (
                                        <div
                                            className="flex items-center gap-3 cursor-pointer"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditingMarks(true);
                                            }}
                                        >
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs font-medium px-2.5 py-1.5 rounded-2">
                                                <PlusCircle className="w-3 h-3" />
                                                {question.marks}
                                            </span>
                                            {allowNegative && (
                                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-xs font-medium px-2.5 py-1.5 rounded-2">
                                                    <MinusCircle className="w-3 h-3" />
                                                    {question.negativeMarks}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}


                        </div>

                        <div className="flex items-center gap-4">
                            {onEdit && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-gray-700 hover:text-blue-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onEdit();
                                    }}
                                >
                                    <Pencil />
                                </Button>
                            )}
                            {isComprehensive &&
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => onAddChild?.(question)}
                                    className="mt-2"
                                >
                                    <Plus />
                                </Button>
                            }

                            {onDelete && (
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    className="bg-red-500"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete();
                                    }}
                                >
                                    <Trash />
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Options */}
                    {question.options?.length > 0 && (
                        <div className="flex flex-col gap-2">
                            {question.options.map((opt: any, idx: number) => (
                                <label
                                    key={idx}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-default ${opt.correct ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-300 bg-white text-gray-700'
                                        }`}
                                >
                                    <input
                                        type={question.correctType === 'SINGLE' ? 'radio' : 'checkbox'}
                                        checked={opt.correct}
                                        readOnly
                                        className="accent-green-500"
                                    />
                                    <span className="font-medium">{opt.value}</span>
                                </label>
                            ))}
                        </div>
                    )}

                    {/* Explanation */}
                    {explanation?.content?.length > 0 && (
                        <div className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 rounded-md">
                            <p className="text-sm text-blue-700 mb-2">Explanation:</p>
                            <ReadOnlyTiptapRenderer className='text-sm text-gray-700' jsonContent={explanation} />
                        </div>
                    )}

                    {/* Attachments */}
                    {Array.isArray(question.attachments) && question.attachments.length > 0 && (
                        <div className="flex flex-wrap gap-3">
                            {question.attachments.map((att: any) => (
                                <a key={att.id} href={att.url} download target="_blank" rel="noopener noreferrer">
                                    <Button variant="outline" className="text-sm">
                                        {att.type} <Paperclip />
                                    </Button>
                                </a>
                            ))}
                        </div>
                    )}

                    {/* Child Questions */}
                    {isComprehensive && showChildren && childrenQuestions.length > 0 && (
                        <div className="border-t pt-2 space-y-2">
                            {childrenQuestions.map((child: any) => {
                                const childParsed = safeParse(child.question);
                                const childExplanation = safeParse(child.explanation);
                                return (
                                    <div key={child.id} className="group relative flex flex-col gap-2 mb-4 rounded border border-gray-200 bg-white p-3">
                                        <div className='flex items-center justify-between '>
                                            <ReadOnlyTiptapRenderer className="fw-semibold text-sm text-gray-700" jsonContent={childParsed} />

                                            <div className="flex items-center gap-4">
                                                {onChildEdit && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="text-gray-700 hover:text-blue-600"
                                                        onClick={() => onChildEdit(child)}
                                                    >
                                                        <Pencil />
                                                    </Button>
                                                )}
                                                {onChildDelete && (
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="bg-red-500"
                                                        onClick={() => onChildDelete(child.id)}
                                                    >
                                                        <Trash />
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                        {child.options?.length > 0 && (
                                            <div className="flex flex-col gap-2">
                                                {child.options.map((opt: any, idx: number) => (
                                                    <label
                                                        key={idx}
                                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg border cursor-default ${opt.correct ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-300 bg-white text-gray-700'
                                                            }`}
                                                    >
                                                        <input
                                                            type={child.correctType === 'SINGLE' ? 'radio' : 'checkbox'}
                                                            checked={opt.correct}
                                                            readOnly
                                                            className="accent-green-500"
                                                        />
                                                        <span className="font-medium">{opt.value}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        )}
                                        {childExplanation?.content?.length > 0 && (
                                            <div className="bg-blue-50 border-l-4 border-blue-400 px-4 py-3 rounded-md">
                                                <p className="text-sm text-blue-700 mb-2">Explanation:</p>
                                                <ReadOnlyTiptapRenderer className='text-sm text-gray-700' jsonContent={childExplanation} />
                                            </div>
                                        )}

                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuestionCard;
