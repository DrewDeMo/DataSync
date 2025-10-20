import React, { useState } from 'react';
import { FieldDefinition } from '../../types/fieldTypes';
import { DynamicFormField } from './DynamicFormField';

interface FormBuilderProps {
    schema: FieldDefinition[];
    initialData?: Record<string, any>;
    onSubmit: (data: Record<string, any>) => void;
    submitLabel?: string;
}

export function FormBuilder({
    schema,
    initialData = {},
    onSubmit,
    submitLabel = 'Save Content'
}: FormBuilderProps) {
    const [formData, setFormData] = useState(initialData);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleFieldChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
        if (errors[fieldName]) {
            setErrors(prev => ({ ...prev, [fieldName]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        schema.forEach(field => {
            const value = formData[field.name];

            if (field.required && !value) {
                newErrors[field.name] = `${field.label} is required`;
            }

            if (field.type === 'phone' && value) {
                const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
                if (!phoneRegex.test(value)) {
                    newErrors[field.name] = 'Phone must be in format xxx-xxx-xxxx';
                }
            }

            if (field.type === 'email' && value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(value)) {
                    newErrors[field.name] = 'Invalid email address';
                }
            }

            if (field.type === 'url' && value) {
                try {
                    new URL(value);
                } catch {
                    newErrors[field.name] = 'Invalid URL';
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            {schema.map(field => (
                <div key={field.name}>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>

                    {field.helpText && (
                        <p className="text-xs text-slate-500 mb-2">{field.helpText}</p>
                    )}

                    <DynamicFormField
                        field={field}
                        value={formData[field.name]}
                        onChange={(value) => handleFieldChange(field.name, value)}
                        error={errors[field.name]}
                    />
                </div>
            ))}

            <button type="submit" className="btn-primary w-full mt-6">
                {submitLabel}
            </button>
        </form>
    );
}
