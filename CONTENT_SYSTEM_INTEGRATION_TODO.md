# Content Management System - Integration Tasks

## ✅ Completed
- All form components created (PhoneInput, MarkdownEditor, ImageUpload, DynamicFormField, FormBuilder)
- Field type definitions created
- Content type templates created (4 templates: promotional_offer, landing_page_content, business_info, service_area)
- Supabase storage migration created
- Documentation updated (about.md)

## 🔧 Remaining Integration Tasks

### 1. Update Content.tsx Page
**File:** `src/pages/Content.tsx`

**Changes needed:**
- Import FormBuilder and CONTENT_TYPE_TEMPLATES
- Add template selector dropdown (shows 4 template options)
- Replace JSON textarea with FormBuilder component when template is selected
- Keep "Custom JSON" option for power users
- Add toggle between "Form View" and "JSON View"
- Pass selected template's schema to FormBuilder
- Handle FormBuilder onSubmit to convert form data to JSON and save to content_items table

### 2. Add Template Selector UI
- Dropdown showing: Promotional Offer, Landing Page Content, Business Information, Service Area, Custom JSON
- When template selected, show FormBuilder with that template's schema
- When Custom JSON selected, show existing JSON textarea

### 3. Add View Toggle
- Button to switch between "Form View" and "JSON View"
- Form View: Shows FormBuilder with fields
- JSON View: Shows formatted JSON (read-only or editable)

### 4. Update Content Display
- When viewing existing content, detect if it matches a template schema
- If matches, show in Form View by default
- If doesn't match, show in JSON View

### 5. Handle Form Submission
- Convert FormBuilder output (Record<string, any>) to JSON string
- Save to content_items.content_data column
- Maintain existing save/update logic

### 6. Add Content Preview (Optional Enhancement)
- Create preview component that renders content based on template type
- Show live preview of how content will appear on landing pages

### 7. Test Each Template
- Create content using each of the 4 templates
- Verify phone formatting works (xxx-xxx-xxxx)
- Test image upload to Supabase
- Test markdown editor with preview
- Verify all validation rules work

### 8. Update Content List View
- Show template type badge on each content item
- Add filter by template type

## 📝 Implementation Order

1. **First:** Update Content.tsx to add template selector
2. **Second:** Integrate FormBuilder component
3. **Third:** Add Form/JSON view toggle
4. **Fourth:** Test with each template type
5. **Fifth:** Add preview functionality (optional)

## 🎯 Key Integration Points

**Import statements needed in Content.tsx:**
```typescript
import { FormBuilder } from '../components/forms/FormBuilder';
import { CONTENT_TYPE_TEMPLATES } from '../lib/contentTypeTemplates';
```

**State to add:**
- `selectedTemplate: string | null` - tracks which template is selected
- `viewMode: 'form' | 'json'` - tracks current view mode

**Logic flow:**
1. User selects template from dropdown
2. If template selected → show FormBuilder with template.schema
3. If "Custom JSON" → show existing textarea
4. FormBuilder onSubmit → convert to JSON → save to database
5. Toggle button switches between form and JSON views

## 🔍 Testing Checklist

- [ ] Can create content using Promotional Offer template
- [ ] Can create content using Landing Page Content template
- [ ] Can create content using Business Information template
- [ ] Can create content using Service Area template
- [ ] Phone numbers auto-format correctly
- [ ] Images upload to Supabase successfully
- [ ] Markdown editor preview works
- [ ] Form validation catches required fields
- [ ] Form validation catches invalid emails/URLs/phones
- [ ] Can switch between Form and JSON views
- [ ] Can still use Custom JSON for power users
- [ ] Existing content loads correctly

## 💡 Notes

- The FormBuilder component is fully functional and ready to use
- All templates are pre-configured with proper field types and validation
- The system maintains backward compatibility with existing JSON content
- Image uploads require the Supabase migration to be run first
