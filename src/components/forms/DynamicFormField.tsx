import React from 'react';
import { FieldDefinition } from '../../types/fieldTypes';
import { PhoneInput } from './PhoneInput';
import { MarkdownEditor } from './MarkdownEditor';
import { ImageUpload } from './ImageUpload';

interface DynamicFormFieldProps {
    field: FieldDefinition;
    value: any;
    onChange: (value: any) => void;
    error?: string;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
    const renderField = () => {
        switch (field.type) {
            case 'text':
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        className="input"
                    />
                );

            case 'textarea':
                return (
                    <textarea
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className="input"
                    />
                );

            case 'markdown':
                return (
                    <MarkdownEditor
                        value={value || ''}
                        onChange={onChange}
                        placeholder={field.placeholder}
                    />
                );

            case 'date':
                return (
                    <input
                        type="date"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="input"
                    />
                );

            case 'number':
                return (
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        className="input"
                    />
                );

            case 'select':
                return (
                    <select
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="input"
                    >
                        <option value="">Select an option</option>
                        {field.options?.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                );

            case 'multi-select':
                return (
                    <div className="space-y-2">
                        {field.options?.map((option) => (
                            <label key={option} className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    checked={(value || []).includes(option)}
                                    onChange={(e) => {
                                        const currentValues = value || [];
                                        if (e.target.checked) {
                                            onChange([...currentValues, option]);
                                        } else {
                                            onChange(currentValues.filter((v: string) => v !== option));
                                        }
                                    }}
                                    className="rounded"
                                />
                                <span className="text-sm">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'phone':
                return (
                    <PhoneInput
                        value={value || ''}
                        onChange={onChange}
                        placeholder={field.placeholder}
                        error={error}
                    />
                );

            case 'email':
                return (
                    <input
                        type="email"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        className="input"
                    />
                );

            case 'url':
                return (
                    <input
                        type="url"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder}
                        className="input"
                    />
                );

            case 'image':
                return (
                    <ImageUpload
                        value={value || ''}
                        onChange={onChange}
                    />
                );

            default:
                return (
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        className="input"
                    />
                );
        }
    };

    return (
        <div>
            {renderField()}
            {error && field.type !== 'phone' && (
                <span className="text-red-600 text-sm mt-1 block">{error}</span>
            )}
        </div>
    );
}
