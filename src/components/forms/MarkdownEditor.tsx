import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function MarkdownEditor({ value, onChange, placeholder }: MarkdownEditorProps) {
    const [showPreview, setShowPreview] = useState(false);

    const insertMarkdown = (before: string, after: string = '') => {
        const textarea = document.querySelector('textarea');
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = value.substring(start, end) || 'text';
        const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);

        onChange(newValue);
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2 border-b pb-2">
                <button
                    type="button"
                    onClick={() => insertMarkdown('**', '**')}
                    className="px-2 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded"
                    title="Bold"
                >
                    <strong>B</strong>
                </button>
                <button
                    type="button"
                    onClick={() => insertMarkdown('*', '*')}
                    className="px-2 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded"
                    title="Italic"
                >
                    <em>I</em>
                </button>
                <button
                    type="button"
                    onClick={() => insertMarkdown('- ')}
                    className="px-2 py-1 text-sm bg-slate-100 hover:bg-slate-200 rounded"
                    title="List"
                >
                    List
                </button>
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="px-2 py-1 text-sm bg-indigo-100 hover:bg-indigo-200 rounded ml-auto"
                >
                    {showPreview ? 'Edit' : 'Preview'}
                </button>
            </div>

            {showPreview ? (
                <div className="prose prose-sm max-w-none p-4 border rounded-lg bg-slate-50">
                    <ReactMarkdown>{value}</ReactMarkdown>
                </div>
            ) : (
                <textarea
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    rows={6}
                    className="input font-mono text-sm"
                />
            )}
        </div>
    );
}
