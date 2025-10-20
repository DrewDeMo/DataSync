import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';

interface ImageUploadProps {
    value: string;
    onChange: (value: string) => void;
}

export function ImageUpload({ value, onChange }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState(value);

    const handleUpload = async (file: File) => {
        setUploading(true);

        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('content-images')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage
                .from('content-images')
                .getPublicUrl(filePath);

            onChange(data.publicUrl);
            setPreview(data.publicUrl);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Error uploading image');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-3">
            <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
                disabled={uploading}
                className="block w-full text-sm text-slate-500
          file:mr-4 file:py-2 file:px-4
          file:rounded-lg file:border-0
          file:text-sm file:font-semibold
          file:bg-indigo-50 file:text-indigo-700
          hover:file:bg-indigo-100"
            />
            {preview && (
                <img src={preview} alt="Preview" className="max-w-xs rounded-lg shadow-md" />
            )}
            {uploading && (
                <p className="text-sm text-slate-600">Uploading...</p>
            )}
        </div>
    );
}
