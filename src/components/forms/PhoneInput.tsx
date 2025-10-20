import React from 'react';

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    placeholder?: string;
}

export function PhoneInput({ value, onChange, error, placeholder }: PhoneInputProps) {
    const formatPhone = (input: string): string => {
        const digits = input.replace(/\D/g, '');

        if (digits.length <= 3) return digits;
        if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
        return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const formatted = formatPhone(e.target.value);
        onChange(formatted);
    };

    return (
        <div>
            <input
                type="tel"
                value={value}
                onChange={handleChange}
                placeholder={placeholder || '555-123-4567'}
                maxLength={12}
                className="input"
            />
            {error && <span className="text-red-600 text-sm mt-1 block">{error}</span>}
        </div>
    );
}
