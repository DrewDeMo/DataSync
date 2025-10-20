import { FieldDefinition } from '../../types/fieldTypes';

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

// Helper function to get template by slug
export function getTemplateBySlug(slug: string): ContentTypeTemplate | undefined {
    return CONTENT_TYPE_TEMPLATES[slug];
}

// Helper function to get all template slugs
export function getAllTemplateSlugs(): string[] {
    return Object.keys(CONTENT_TYPE_TEMPLATES);
}

// Helper function to get all templates as array
export function getAllTemplates(): ContentTypeTemplate[] {
    return Object.values(CONTENT_TYPE_TEMPLATES);
}
