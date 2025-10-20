
# Content Management System Refactor - Complete Implementation Guide

## 📋 Overview

This document provides a comprehensive, step-by-step plan to transform DataSync's JSON-based content editing into an intuitive, form-based interface focused on marketing campaign content. This makes the system accessible to non-technical users while maintaining flexibility for power users.

---

## 🎯 Goals

1. **Eliminate JSON complexity** - Users should never need to write JSON manually
2. **Marketing-focused** - Pre-built templates for promotional offers, landing pages, business info
3. **User-friendly forms** - Dynamic form generation based on content type schemas
4. **Visual feedback** - Preview content before publishing
5. **Maintain flexibility** - Keep JSON view available for advanced users

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Content Management Flow                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  1. User selects Content Type                                │
│           ↓                                                   │
│  2. System loads schema definition                           │
│           ↓                                                   │
│  3. DynamicFormBuilder renders appropriate fields            │
│           ↓                                                   │
│  4. User fills out form with validation                      │
│           ↓                                                   │
│  5. FormPreview shows formatted content                      │
│           ↓                                                   │
│  6. System converts form data to JSON                        │
│           ↓                                                   │
│  7. Content saved to database                                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Component Structure

### New Components to Create

```
src/components/
├── forms/
│   ├── DynamicFormField.tsx      # Renders individual field based on type
│   ├── FormBuilder.tsx            # Generates complete form from schema
│   ├── PhoneInput.tsx             # Phone number formatter (xxx-xxx-xxxx)
│   ├── MarkdownEditor.tsx         # Simple markdown editor for rich text
│   └── ImageUpload.tsx            # Supabase storage integration
├── content/
│   ├── FormPreview.tsx            # Visual content preview
│   ├── ContentTypeTemplates.ts    # Pre-configured templates
│   └── EditItemModal.tsx          # Edit with Form/JSON tabs
└── viewers/
    └── FormattedItemViewer.tsx    # Replaces raw JSON display
```

---

## 🔧 Implementation Steps

### Phase 1: Foundation & Documentation

#### Step 1.1: Update about.md
**File:** `about.md`

**Changes:**
- Rewrite with non-technical language
- Focus on marketing use cases
- Add clear examples of content types
- Remove developer-centric jargon

**New Structure:**
```markdown
# DataSync - Marketing Content Management Made Simple

## What is DataSync?

DataSync helps marketing teams manage promotional content across multiple websites from one central location. Update your offers, business information, and landing page content once, and automatically sync it to all your sites.

## Who is it for?

- Marketing managers who need to update promotional offers
- Content teams managing multiple regional websites
- Business owners who want consistent messaging across platforms

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

### A/B Testing
Test different offers on different sites and track performance.
```

---

#### Step 1.2: Design Field Type Specifications
**File:** `src/types/fieldTypes.ts` (new file)

**Content:**
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
  options?: string[]; // For select/multi-select
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

**Field Type Specifications:**

| Type | Input Component | Validation | Example Value |
|------|----------------|------------|---------------|
| `text` | Single-line input | Max 255 chars | "Summer Sale 2024" |
| `textarea` | Multi-line input | Max 2000 chars | "Get 20% off all services..." |
| `markdown` | Markdown editor | Valid markdown | "**Bold** text with *emphasis*" |
| `date` | Date picker | Valid date | "2024-06-01" |
| `number` | Number input | Numeric only | 25 |
| `select` | Dropdown | Must be in options | "Full Coverage" |
| `multi-select` | Checkbox group | Array of values | ["County A", "County B"] |
| `phone` | Phone formatter | xxx-xxx-xxxx | "555-123-4567" |
| `email` | Email input | Valid email | "contact@example.com" |
| `url` | URL input | Valid URL | "https://example.com" |
| `image` | File upload + preview | Image file/URL | Supabase storage URL |

---

### Phase 2: Core Components

#### Step 2.1: Create DynamicFormField Component
**File:** `src/components/forms/DynamicFormField.tsx`

**Purpose:** Renders the appropriate input component based on field type

**Key Features:**
- Switch statement for field type rendering
- Built-in validation
- Error message display
- Help text tooltips
- Consistent styling

**Implementation Details:**
```typescript
interface DynamicFormFieldProps {
  field: FieldDefinition;
  value: any;
  onChange: (value: any) => void;
  error?: string;
}

export function DynamicFormField({ field, value, onChange, error }: DynamicFormFieldProps) {
  // Render different input types based on field.type
  switch (field.type) {
    case 'text':
      return <input type="text" ... />
    case 'phone':
      return <PhoneInput ... />
    case 'markdown':
      return <MarkdownEditor ... />
    case 'image':
      return <ImageUpload ... />
    // ... etc
  }
}
```

---

#### Step 2.2: Create PhoneInput Component
**File:** `src/components/forms/PhoneInput.tsx`

**Purpose:** Format and validate phone numbers as xxx-xxx-xxxx

**Features:**
- Auto-formatting as user types
- Validation for US phone format
- Clear error messages

**Implementation:**
```typescript
export function PhoneInput({ value, onChange, error }: PhoneInputProps) {
  const formatPhone = (input: string) => {
    // Remove non-digits
    const digits = input.replace(/\D/g, '');
    
    // Format as xxx-xxx-xxxx
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
        placeholder="555-123-4567"
        maxLength={12}
        className="input"
      />
      {error && <span className="text-red-600 text-sm">{error}</span>}
    </div>
  );
}
```

---

#### Step 2.3: Create MarkdownEditor Component
**File:** `src/components/forms/MarkdownEditor.tsx`

**Purpose:** Simple markdown editor for rich text content

**Features:**
- Textarea with markdown toolbar
- Preview toggle
- Common formatting buttons (bold, italic, lists)

**Dependencies:**
```bash
npm install react-markdown
```

**Implementation:**
```typescript
import ReactMarkdown from 'react-markdown';

export function MarkdownEditor({ value, onChange }: MarkdownEditorProps) {
  const [showPreview, setShowPreview] = useState(false);

  const insertMarkdown = (syntax: string) => {
    // Insert markdown syntax at cursor position
  };

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex gap-2 border-b pb-2">
        <button onClick={() => insertMarkdown('**text**')}>Bold</button>
        <button onClick={() => insertMarkdown('*text*')}>Italic</button>
        <button onClick={() => insertMarkdown('- ')}>List</button>
        <button onClick={() => setShowPreview(!showPreview)}>
          {showPreview ? 'Edit' : 'Preview'}
        </button>
      </div>

      {/* Editor or Preview */}
      {showPreview ? (
        <div className="prose">
          <ReactMarkdown>{value}</ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={6}
          className="input font-mono"
        />
      )}
    </div>
  );
}
```

---

#### Step 2.4: Create ImageUpload Component
**File:** `src/components/forms/ImageUpload.tsx`

**Purpose:** Upload images to Supabase storage and return URL

**Features:**
- Drag-and-drop upload
- Image preview
- Progress indicator
- URL output

**Supabase Setup:**
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

**Implementation:**
```typescript
import { supabase } from '../../lib/supabase';

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
    <div className="space-y-2">
      <input
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
        disabled={uploading}
      />
      {preview && (
        <img src={preview} alt="Preview" className="max-w-xs rounded" />
      )}
      {uploading && <p>Uploading...</p>}
    </div>
  );
}
```

---

#### Step 2.5: Create FormBuilder Component
**File:** `src/components/forms/FormBuilder.tsx`

**Purpose:** Generate complete form from content type schema

**Features:**
- Iterate through schema fields
- Render DynamicFormField for each
- Collect form data
- Validate all fields
- Return structured data

**Implementation:**
```typescript
interface FormBuilderProps {
  schema: FieldDefinition[];
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => void;
}

export function FormBuilder({ schema, initialData = {}, onSubmit }: FormBuilderProps) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleFieldChange = (fieldName: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({ ...prev, [fieldName]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    schema.forEach(field => {
      if (field.required && !formData[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      }
      
      // Type-specific validation
      if (field.type === 'phone' && formData[field.name]) {
        const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
        if (!phoneRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Phone must be in format xxx-xxx-xxxx';
        }
      }
      
      if (field.type === 'email' && formData[field.name]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.name])) {
          newErrors[field.name] = 'Invalid email address';
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {schema.map(field => (
        <div key={field.name}>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          
          {field.helpText && (
            <p className="text-xs text-slate-500 mb-1">{field.helpText}</p>
          )}
          
          <DynamicFormField
            field={field}
            value={formData[field.name] || ''}
            onChange={(value) => handleFieldChange(field.name, value)}
            error={errors[field.name]}
          />
        </div>
      ))}

      <button type="submit" className="btn-primary w-full">
        Save Content
      </button>
    </form>
  );
}
```

---

### Phase 3: Content Type Templates

#### Step 3.1: Create Content Type Templates
**File:** `src/components/content/ContentTypeTemplates.ts`

**Purpose:** Pre-configured schemas for common marketing content

**Templates:**

```typescript
export const CONTENT_TYPE_TEMPLATES = {
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
        helpText: 'Detailed description of the offer (supports markdown)'
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
        label: 'Call-to-Action Button Text',
        type: 'text',
        required: true,
        placeholder: 'Claim This Offer',
        helpText: 'Text for the action button'
      },
      {
        name: 'cta_link',
        label: 'Call-to-Action Link',
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
        helpText: 'Main page headline (H1)'
      },
      {
        name: 'hero_headline',
        label: 'Hero Headline',
        type: 'text',
        required: true,
        placeholder: 'Transform Your Home Today',
        helpText: 'Large hero section headline'
      },
      {
        name: 'hero_subheadline',
        label: 'Hero Subheadline',
        type: 'textarea',
        placeholder: 'Expert installation with lifetime warranty',
        helpText: 'Supporting text under hero headline'
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
        helpText: 'Bullet points of key features or benefits'
      },
      {
        name: 'testimonial',
        label: 'Customer Testimonial',
        type: 'textarea',
        placeholder: 'Best service we ever received!',
        helpText: 'Customer quote or review'
      },
      {
        name: 'testimonial_author',
        label: 'Testimonial Author',
        type: 'text',
        placeholder: 'John D., Homeowner',
        helpText: 'Name and title of testimonial author'
      },
      {
        name: 'cta_primary',
        label: 'Primary Call-to-Action',
        type: 'text',
        required: true,
        placeholder: 'Get Free Quote',
        helpText: 'Main action button text'
      },
      {
        name: 'cta_secondary',
        label: 'Secondary Call-to-Action',
        type: 'text',
        placeholder: 'Learn More',
        helpText: 'Secondary action button text'
      },
      {
        name: 'phone',
        label: 'Contact Phone',
        type: 'phone',
        required: true,
        placeholder: '555-123-4567',
        helpText: 'Primary contact phone number'
      },
      {
        name: 'email',
        label: 'Contact Email',
        type: 'email',
        placeholder: 'contact@example.com',
        helpText: 'Primary contact email'
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
        placeholder: 'Acme Windows & Doors',
        helpText: 'Official business name'
      },
      {
        name: 'tagline',
        label: 'Business Tagline',
        type: 'text',
        placeholder: 'Quality You Can Trust',
        helpText: 'Short memorable phrase'
      },
      {
        name: 'description',
        label: 'Business Description',
        type: 'textarea',
        required: true,
        placeholder: 'We provide professional window installation...',
        helpText: 'Brief description of your business'
      },
      {
        name: 'phone',
        label: 'Phone Number',
        type: 'phone',
        required: true,
        placeholder: '555-123-4567',
        helpText: 'Primary business phone'
      },
      {
        name: 'email',
        label: 'Email Address',
        type: 'email',
        required: true,
        placeholder: 'info@example.com',
        helpText: 'Primary business email'
      },
      {
        name: 'address',
        label: 'Business Address',
        type: 'textarea',
        required: true,
        placeholder: '123 Main St\nCity, ST 12345',
        helpText: 'Full business address'
      },
      {
        name: 'service_areas',
        label: 'Service Areas',
        type: 'textarea',
        required: true,
        placeholder: 'County A, County B, County C',
        helpText: 'Counties or regions you serve (comma-separated)'
      },
      {
        name: 'hours',
        label: 'Hours of Operation',
        type: 'textarea',
        placeholder: 'Mon-Fri: 8am-6pm\nSat: 9am-4pm\nSun: Closed',
        helpText: 'Business hours'
      },
      {
        name: 'license_number',
        label: 'License Number',
        type: 'text',
        placeholder: 'LIC-12345',
        helpText: 'Business license or certification number'
      },
      {
        name: 'years_in_business',
        label: 'Years in Business',
        type: 'number',
        placeholder: '15',
        helpText: 'How many years you have been operating'
      },
      {
        name: 'logo_url',
        label: 'Business Logo',
        type: 'image',
        helpText: 'Upload your business logo'
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
        placeholder: 'Montgomery County',
        helpText: 'County or region name'
      },
      {
        name: 'coverage_type',
        label: 'Coverage Type',
        type: 'select',
        required: true,
        options: ['Full Coverage', 'Partial Coverage', 'On Request'],
        helpText: 'Level of service availability'
      },
      {
        name: 'zip_codes',
        label: 'Zip Codes',
        type: 'textarea',
        placeholder: '12345, 12346, 12347',
        helpText: 'Comma-separated list of zip codes served'
      },
      {
        name: 'special_notes',
        label: 'Special Notes',
        type: 'textarea',
        placeholder: 'Additional travel fees may apply...',
        helpText: 'Area-specific information or restrictions'
      },
      {
        name: 'active',
        label: 'Currently Active',
        type: 'select',
        required: true,
        options: ['Yes', 'No'],
        helpText: 'Whether this area is currently being served'
      }
    ]
  }
};
```

---

### Phase 4: UI Integration

#### Step 4.1: Update CreateItemModal
**File:** `src/pages/Content.tsx`

**Changes to CreateItemModal:**

```typescript
function CreateItemModal({ types, onClose, onSuccess }: CreateItemModalProps) {
  const [typeId, setTypeId] = useState('');
  const [title, setTitle] = useState('');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [showJsonMode, setShowJsonMode] = useState(false);
  const [jsonData, setJsonData] = useState('{}');
  const [loading, setLoading] = useState(false);

  const selectedType = types.find(t => t.id === typeId);

  const handleFormSubmit = async (formData: Record<string, any>) => {
    setLoading(true);
    try {
      await createContentItem(typeId, title, formData, status);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Error creating content item');
    } finally {
      setLoading(false);
    }
  };

  const handleJsonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const parsedData = JSON.parse(jsonData);
      await createContentItem(typeId, title, parsedData, status);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating item:', error);
      alert('Invalid JSON or error creating item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <h3 className="text-xl font-bold">Create Content Item</h3>
        </div>

        <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
          {/* Content Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Content Type
            </label>
            <select
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
              required
              className="input"
            >
              <option value="">Select a content type</option>
              {types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="input"
              placeholder="Enter item title"
            />
          </div>

          {/* Status */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
              className="input"
            >
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </div>

          {/* Mode Toggle */}
          {selectedType && (
            <div className="mb-4">
              <div className="flex gap-2 border-b">
                <button
                  type="button"
                  onClick={() => setShowJsonMode(false)}
                  className={`px-4 py-2 font-semibold ${
                    !showJsonMode
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-slate-600'
                  }`}
                >
                  Form View
                </button>
                <button
                  type="button"
                  onClick={() => setShowJsonMode(true)}
                  className={`px-4 py-2 font-semibold ${
                    showJsonMode
                      ? 'border-b-2 border-indigo-600 text-indigo-600'
                      : 'text-slate-600'
                  }`}
                >
                  JSON View
                </button>
              </div>
            </div>
          )}

          {/* Form or JSON Editor */}
          {selectedType && (
            showJsonMode ? (
              <form onSubmit={handleJsonSubmit}>
                <textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  rows={12}
                  className="input font-mono text-sm"
                  placeholder='{"key": "value"}'
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full mt-4"
                >
                  {loading ? 'Creating...' : 'Create Item'}
                </button>
              </form>
            ) : (
              <FormBuilder
                schema={selectedType.schema}
                onSubmit={handleFormSubmit}
              />
            )
          )}
        </div>

        <div className="px
