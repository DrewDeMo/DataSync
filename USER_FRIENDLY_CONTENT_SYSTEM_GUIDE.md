# User-Friendly Content Management System - Complete Implementation Guide

## 📋 Executive Summary

Transform DataSync's JSON-based content editing into an intuitive, form-based interface for marketing campaign content. This guide provides step-by-step instructions for implementing a system that non-technical users can easily understand and use.

**Key Improvements:**
- Replace JSON textarea with dynamic form fields
- Add pre-built marketing content templates
- Implement phone formatting (xxx-xxx-xxxx)
- Integrate Supabase image storage
- Add markdown editor for rich text
- Create visual content preview
- Maintain JSON view for power users

---

## 🎯 Implementation Phases

### Phase 1: Foundation (Days 1-2)
- Update documentation
- Define field types
- Set up Supabase storage

### Phase 2: Core Components (Days 3-5)
- Build form field components
- Create dynamic form builder
- Implement validation

### Phase 3: Templates & Integration (Days 6-8)
- Create content type templates
- Update UI components
- Add preview functionality

### Phase 4: Testing & Polish (Days 9-10)
- Comprehensive testing
- Bug fixes
- Documentation updates

---

## 📦 Required Dependencies

```bash
npm install react-markdown
```

---

## 🔧 Step-by-Step Implementation

### STEP 1: Update about.md

**File:** `about.md`

**Replace entire content with:**

```markdown
# DataSync - Marketing Content Management Made Simple

## What is DataSync?

DataSync helps marketing teams manage promotional content across multiple websites from one central location. Update your offers, business information, and landing page content once, and automatically sync it to all your sites.

## Who is it for?

- Marketing managers updating promotional offers
- Content teams managing multiple regional websites  
- Business owners wanting consistent messaging across platforms

## Key Features

### Easy Content Creation
Create promotional offers, landing page content, and business information using simple forms - no coding required.

### Multi-Site Synchronization
Update content once and push it to all your websites automatically.

### Content Types

#### Promotional Offers
- Offer headlines and descriptions
- Discount amounts and terms
- Valid date ranges
- Call-to-action buttons

#### Landing Page Content
- Hero sections with headlines
- Feature lists
- Testimonials
- Contact information

#### Business Information
- Company details
- Contact information
- Service areas
- Hours of operation

## How It Works

1. **Create Content** - Fill out simple forms with your marketing content
2. **Map to Sites** - Choose which websites should receive each piece of content
3. **Sync** - Click one button to update all your sites
4. **Monitor** - View live logs and confirm successful updates
5. **Manage** - Edit content anytime and re-sync instantly

## Use Cases

### Seasonal Promotions
Launch a summer sale across all regional sites with one click.

### Regional Campaigns
Create location-specific offers for different service areas.

### Business Updates
Update phone numbers, addresses, or hours across all sites instantly.
```

---

### STEP 2: Create Field Type Definitions

**File:** `src/types/fieldTypes.ts` (NEW FILE)

```typescript
export type FieldType = 
  | 'text'
  | 'textarea' 
  | 'markdown'
  | 'date'
  | 'number'
  | 'select'
  | 'multi-select'
  | 'phone'
  | 'email'
  | 'url'
  | 'image';

export interface FieldDefinition {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

export interface ContentTypeSchema {
  fields: FieldDefinition[];
}
```

---

### STEP 3: Set Up Supabase Storage

**Run in Supabase SQL Editor:**

```sql
-- Create storage bucket for content images
INSERT INTO storage.buckets (id, name, public)
VALUES ('content-images', 'content-images', true);

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'content-images');

-- Allow public read access
CREATE POLICY "Public can view images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'content-images');
```

---

### STEP 4: Create PhoneInput Component

**File:** `src/components/forms/PhoneInput.tsx` (NEW FILE)

```typescript
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
    if (digits.length <= 6) return `${digits.slice(0,3)}-${digits.slice(3)}`;
    return `${digits.slice(0,3)}-${digits.slice(3,6)}-${digits.slice(6,10)}`;
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
```

---

### STEP 5: Create MarkdownEditor Component

**File:** `src/components/forms/MarkdownEditor.tsx` (NEW FILE)

```typescript
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
```

---

### STEP 6: Create ImageUpload Component

**File:** `src/components/forms/ImageUpload.tsx` (NEW FILE)

```typescript
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
```

---

### STEP 7: Create DynamicFormField Component

**File:** `src/components/forms/DynamicFormField.tsx` (NEW FILE)

```typescript
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
```

---

### STEP 8: Create FormBuilder Component

**File:** `src/components/forms/FormBuilder.tsx` (NEW FILE)

```typescript
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
```

---

### STEP 9: Create Content Type Templates

**File:** `src/lib/contentTypeTemplates.ts` (NEW FILE)

```typescript
import { FieldDefinition } from '../types/fieldTypes';

export interface ContentTypeTemplate {
  name: string;
  slug: string;
  description: string;
  schema: FieldDefinition[];
}

export const CONTENT_TYPE_TEMPLATES: Record<string, ContentTypeTemplate> = {
  promotional_offer: {
    name: 'Promotional Offer',
    slug: 'promotional_offer',
    description: 'Special deals, discounts, and limited-time offers',
    schema: [
      {
        name: 'offer_title',
        label: 'Offer Title',
        type: 'text',
        required: true,
        placeholder: 'Summer Sale 2024',
        helpText: 'Main headline for your promotional offer'
      },
      {
        name: 'offer_description',
        label: 'Offer Description',
        type: 'markdown',
        required: true,
        placeholder: 'Get **20% off** all services...',
        helpText: 'Detailed description (supports markdown formatting)'
      },
      {
        name: 'discount_amount',
        label: 'Discount Amount',
        type: 'text',
        required: true,
        placeholder: '20% OFF or $500 OFF',
        helpText: 'How much customers save'
      },
      {
        name: 'valid_from',
        label: 'Valid From',
        type: 'date',
        required: true,
        helpText: 'When the offer starts'
      },
      {
        name: 'valid_until',
        label: 'Valid Until',
        type: 'date',
        required: true,
        helpText: 'When the offer ends'
      },
      {
        name: 'terms',
        label: 'Terms & Conditions',
        type: 'textarea',
        placeholder: 'Cannot be combined with other offers...',
        helpText: 'Fine print and restrictions'
      },
      {
        name: 'cta_text',
        label: 'Call-to-Action Button',
        type: 'text',
        required: true,
        placeholder: 'Claim This Offer',
        helpText: 'Text for the action button'
      },
      {
        name: 'cta_link',
        label: 'Button Link',
        type: 'url',
        placeholder: 'https://example.com/contact',
        helpText: 'Where the button should link to'
      },
      {
        name: 'image_url',
        label: 'Promotional Image',
        type: 'image',
        helpText: 'Upload an image for this offer'
      }
    ]
  },

  landing_page_content: {
    name: 'Landing Page Content',
    slug: 'landing_page_content',
    description: 'Complete content for marketing landing pages',
    schema: [
      {
        name: 'page_title',
        label: 'Page Title',
        type: 'text',
        required: true,
        placeholder: 'Professional Window Installation',
        helpText: 'Main page headline'
      },
      {
        name: 'hero_headline',
        label: 'Hero Headline',
        type: 'text',
        required: true,
        placeholder: 'Transform Your Home Today'
      },
      {
        name: 'hero_subheadline',
        label: 'Hero Subheadline',
        type: 'textarea',
        placeholder: 'Expert installation with lifetime warranty'
      },
      {
        name: 'hero_image',
        label: 'Hero Image',
        type: 'image',
        helpText: 'Main hero section background image'
      },
      {
        name: 'features',
        label: 'Key Features',
        type: 'markdown',
        placeholder: '- Feature 1\n- Feature 2\n- Feature 3',
        helpText: 'Bullet points of key features'
      },
      {
        name: 'testimonial',
        label: 'Customer Testimonial',
        type: 'textarea',
        placeholder: 'Best service we ever received!'
      },
      {
        name: 'testimonial_author',
        label: 'Testimonial Author',
        type: 'text',
        placeholder: 'John D., Homeowner'
      },
      {
        name: 'cta_primary',
        label: 'Primary Call-to-Action',
        type: 'text',
        required: true,
        placeholder: 'Get Free Quote'
      },
      {
        name: 'phone',
        label: 'Contact Phone',
        type: 'phone',
        required: true,
        placeholder: '555-123-4567'
      },
      {
        name: 'email',
        label: 'Contact Email',
        type: 'email',
        placeholder: 'contact@example.com'
      }
    ]
  },

  business_info: {
    name: 'Business Information',
    slug: 'business_info',
    description: 'Core business details and contact information',
    schema: [
      {
        name: 'business_name',
        label: 'Business Name',
        type: 'text',
        required: true,
        placeholder: 'Acme Windows & Doors'
      },
      {
        name: 'tagline',
        label: 'Business Tagline',
        type: 'text',
        placeholder: 'Quality You Can Trust'
      },
      {
        name: 'description',
        label: 'Business Description',
        type: 'textarea',
        required: true,
        placeholder: 'We provide professional window installation...'
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'phone',
        required: true,
        placeholder: '555-123-4567'
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'info@example.com'
      },
      {
        name: 'address',
        label: 'Business Address',
        type: 'textarea',
        required: true,
        placeholder: '123 Main St\nCity, ST 12345'
      },
      {
        name: 'service_areas',
        label: 'Service Areas',
        type: 'textarea',
        required: true,
        placeholder: 'Montgomery County, Howard County, Anne Arundel County',
        helpText: 'Counties or regions you serve (comma-separated)'
      },
      {
        name: 'hours',
        label: 'Hours of Operation',
        type: 'textarea',
        placeholder: 'Mon-Fri: 8am-6pm\nSat: 9am-4pm\nSun: Closed'
      },
      {
        name: 'license_number',
        label: 'License Number',
        type: 'text',
        placeholder: 'LIC-12345'
      },
      {
        name: 'years_in_business',
        label: 'Years in Business',
        type: 'number',
        placeholder: '15'
      }
    ]
  },

  service_area: {
    name: 'Service Area',
    slug: 'service_area',
    description: 'Geographic regions where services are offered',
    schema: [
      {
        name: 'area_name',
        label: 'Area Name',
        type: 'text',
        required: true,
        placeholder: 'Montgomery County'
      },
      {
        name: 'coverage_type',
        label: 'Coverage Type',
        type: 'select',
        required: true,
        options: ['Full Coverage', 'Partial Coverage', 'On Request']
      },
      {
        name: 'zip_codes',
        label: 'Zip Codes',
        type: 'textarea',
        placeholder: '12345, 12346, 12347',
        helpText: 'Comma-separated list'
      },
      {
        name: 'special_notes',
        label: 'Special Notes',
        type: 'textarea',
        placeholder: 'Additional travel fees may apply...'
      },
      {
        name: 'active',
        label: 'Currently Active',
        type: 'select',
        required: true,
        options: ['Yes', 'No']
      }
    ]
  }
};
```

---

## 📝 Next Steps

This comprehensive guide provides all the code and instructions needed to implement the user-friendly content management system. The implementation should be done in order, testing each component as you build it.

**Ready to implement?** Switch to Code mode to begin building these components.
