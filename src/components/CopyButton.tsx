import { useState } from 'react';
import { Copy, Check } from '@phosphor-icons/react';

interface CopyButtonProps {
    text: string;
    label?: string;
    className?: string;
}

export default function CopyButton({ text, label = 'Copy', className = '' }: CopyButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy:', error);
        }
    };

    return (
        <button
            onClick={handleCopy}
            className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${copied
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                    : 'bg-slate-100 text-slate-700 border border-slate-300 hover:bg-slate-200'
                } ${className}`}
            title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4" weight="bold" />
                    <span>Copied!</span>
                </>
            ) : (
                <>
                    <Copy className="w-4 h-4" weight="bold" />
                    <span>{label}</span>
                </>
            )}
        </button>
    );
}
