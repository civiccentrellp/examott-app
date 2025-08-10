'use client';

import { createFaq, deleteFaq, Faq, getFaqs, updateFaq } from '@/utils/courses/courseFaqs';
import React, { useEffect, useState } from 'react';
import { Plus, Trash, PencilSquare, ChevronRight } from 'react-bootstrap-icons';
import { CaretRightFill } from 'react-bootstrap-icons';
import IconButtonWithTooltip from '@/components/ui/IconButtonWithTooltip';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import VisibilityCheck from '@/components/VisibilityCheck';
import { useUser } from "@/context/userContext";


type Props = {
    courseId: string;
};

const CourseFaqsTab = ({ courseId }: Props) => {
    const { user } = useUser();
    const [faqs, setFaqs] = useState<Faq[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
    const [expandedId, setExpandedId] = useState<string | null>(null);


    const fetchFaqs = async () => {
        const data = await getFaqs(courseId);
        setFaqs(data);
    };

    useEffect(() => {
        fetchFaqs();
    }, [courseId]);

    const handleAddFaq = async () => {
        const newOne = await createFaq({ courseId, question: newFaq.question, answer: newFaq.answer });
        setFaqs([newOne, ...faqs]);
        setNewFaq({ question: '', answer: '' });
    };

    const handleToggle = (id: string) => {
        setExpandedId(prev => (prev === id ? null : id));
    };


    const handleEditFaq = (id: string, question: string, answer: string) => {
        setEditingId(id);
        setNewFaq({ question, answer });
        setShowModal(true);
    };

    const handleSaveEdit = async () => {
        if (!editingId) return;
        const updated = await updateFaq(editingId, newFaq.question, newFaq.answer);
        setFaqs((prev) =>
            prev.map((faq) => (faq.id === editingId ? updated : faq))
        );
        setEditingId(null);
        setNewFaq({ question: '', answer: '' });
    };

    const handleDeleteFaq = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        await deleteFaq(id);
        setFaqs((prev) => prev.filter((faq) => faq.id !== id));
    };

    return (
        <div className=" space-y-6 text-gray-600">
            <div className="flex justify-end items-center">
                <VisibilityCheck user={user} check="content.create" checkType="permission">
                    <Button
                        variant="outline"
                        className="bg-gray-900 text-white px-4 py-2 rounded-lg flex items-center"
                        onClick={() => setShowModal(true)}
                    >
                        Add FAQ
                    </Button>
                </VisibilityCheck>
            </div>

            <div>
                {faqs.length > 0 ? (
                    faqs.map(({ id, question, answer }) => (
                        <div key={id} className="border border-gray-300 rounded-lg mb-3 transition shadow-sm">
                            <div
                                className="flex justify-between items-center gap-4 cursor-pointer m-3"
                                onClick={() => handleToggle(id)}
                            >
                                <div className="flex items-center text-base text-sm font-semibold text-gray-600 mx-2">
                                    {question}
                                </div>
                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                    <VisibilityCheck user={user} check="content.update" checkType="permission">
                                        <IconButtonWithTooltip
                                            label="Edit"
                                            icon={<PencilSquare size={20} />}
                                            onClick={() => handleEditFaq(id, question, answer)}
                                            className='text-dark'
                                        />
                                    </VisibilityCheck>
                                    <VisibilityCheck user={user} check="content.delete" checkType="permission">
                                        <IconButtonWithTooltip
                                            label="Delete"
                                            icon={<Trash2 size={20} color='red' />}
                                            onClick={(e) => handleDeleteFaq(id, e)}
                                        />
                                    </VisibilityCheck>
                                    <ChevronRight
                                        className={`mr-2 transition-transform duration-200 ${expandedId === id ? 'rotate-90' : ''}`}
                                    />
                                </div>
                            </div>
                            {expandedId === id && (
                                <>
                                    <div className="m-1 px-2 py-2 text-sm bg-slate-50 bg-opacity-50 text-gray-700 border-l-4 border-gray-400 whitespace-pre-wrap break-words">
                                        {answer}
                                    </div>
                                </>
                            )}

                        </div>

                    ))
                ) : (
                    <p>No FAQs available.</p>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
                    <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 animate-fade-in">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            {editingId ? 'Edit FAQ' : 'Add FAQ'}
                        </h2>

                        <input
                            type="text"
                            className="w-full p-2 mb-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 placeholder:text-sm"
                            placeholder="Enter FAQ question"
                            value={newFaq.question}
                            onChange={(e) => setNewFaq({ ...newFaq, question: e.target.value })}
                        />

                        <textarea
                            className="w-full min-h-[140px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-500 bg-gray-50 text-sm text-gray-700 placeholder:text-sm mb-4"
                            placeholder="Enter FAQ answer"
                            value={newFaq.answer}
                            onChange={(e) => setNewFaq({ ...newFaq, answer: e.target.value })}
                        ></textarea>

                        <div className="flex flex-col sm:flex-row gap-3">
                            <button
                                onClick={() => {
                                    setShowModal(false);
                                    setEditingId(null);
                                }}
                                className="w-full sm:w-1/2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    editingId ? handleSaveEdit() : handleAddFaq();
                                    setShowModal(false);
                                }}
                                className="w-full sm:w-1/2 px-4 py-2 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition"
                            >
                                {editingId ? 'Save' : 'Add'}
                            </button>
                        </div>
                    </div>
                </div>

            )}
        </div>
    );
};

export default CourseFaqsTab;
