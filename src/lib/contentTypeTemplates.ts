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
