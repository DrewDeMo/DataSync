const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const USER_ID = '5a7e5925-8959-49ba-9c86-2abc4a8e14d5';

async function seed() {
    console.log('🌱 Starting manual seed for user:', USER_ID);
    console.log('');

    try {
        // 1. Create organization
        console.log('1️⃣ Creating organization...');
        const { data: org, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: 'Demo Organization',
                slug: 'demo-org'
            })
            .select()
            .single();

        if (orgError) {
            console.error('❌ Error creating organization:', orgError.message);
            return;
        }
        console.log('✅ Organization created:', org.id);

        // 2. Create profile
        console.log('\n2️⃣ Creating profile...');
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: USER_ID,
                organization_id: org.id,
                email: 'demo@example.com',
                role: 'admin'
            })
            .select()
            .single();

        if (profileError) {
            console.error('❌ Error creating profile:', profileError.message);
            return;
        }
        console.log('✅ Profile created');

        // 3. Create content type
        console.log('\n3️⃣ Creating Business Landing Page content type...');
        const { data: contentType, error: typeError } = await supabase
            .from('content_types')
            .insert({
                organization_id: org.id,
                name: 'Business Landing Page',
                slug: 'business_landing_page',
                schema: [
                    { name: 'hero_headline', type: 'text', required: true },
                    { name: 'hero_subheadline', type: 'text', required: true },
                    { name: 'cta_text', type: 'text', required: true },
                    { name: 'cta_url', type: 'text', required: true },
                    { name: 'offer_title', type: 'text', required: false },
                    { name: 'offer_description', type: 'text', required: false },
                    { name: 'offer_expires', type: 'date', required: false },
                    { name: 'location_address', type: 'text', required: false },
                    { name: 'location_city', type: 'text', required: false },
                    { name: 'location_hours', type: 'text', required: false },
                    { name: 'phone', type: 'text', required: false },
                    { name: 'testimonial_text', type: 'text', required: false },
                    { name: 'testimonial_author', type: 'text', required: false },
                ]
            })
            .select()
            .single();

        if (typeError) {
            console.error('❌ Error creating content type:', typeError.message);
            return;
        }
        console.log('✅ Content type created');

        // 4. Create sites
        console.log('\n4️⃣ Creating campaign sites...');
        const baseUrl = 'http://localhost:5173';
        const sites = [
            {
                name: 'Facebook Campaign',
                slug: 'facebook',
                destination_url: `${baseUrl}/landing-pages/facebook/`,
                destination_secret: 'facebook-secret-key-2024',
                organization_id: org.id
            },
            {
                name: 'Google Campaign',
                slug: 'google',
                destination_url: `${baseUrl}/landing-pages/google/`,
                destination_secret: 'google-secret-key-2024',
                organization_id: org.id
            },
            {
                name: 'Instagram Campaign',
                slug: 'instagram',
                destination_url: `${baseUrl}/landing-pages/instagram/`,
                destination_secret: 'instagram-secret-key-2024',
                organization_id: org.id
            }
        ];

        const createdSites = [];
        for (const site of sites) {
            const { data, error } = await supabase
                .from('sites')
                .insert(site)
                .select()
                .single();

            if (error) {
                console.error(`❌ Error creating ${site.name}:`, error.message);
                return;
            }
            createdSites.push(data);
            console.log(`✅ ${site.name} created`);
        }

        // 5. Create content items
        console.log('\n5️⃣ Creating content items...');
        const items = [
            {
                title: 'Spring Sale 2024',
                status: 'published',
                organization_id: org.id,
                content_type_id: contentType.id,
                data: {
                    hero_headline: 'Spring Into Savings - Up to 40% Off',
                    hero_subheadline: 'Limited time spring sale on all products',
                    cta_text: 'Shop Now',
                    cta_url: 'https://example.com/shop',
                    offer_title: 'Spring Sale - Up to 40% Off',
                    offer_description: 'Limited time spring sale on select items. Don\'t miss out on incredible savings!',
                    offer_expires: '2024-05-31',
                    location_address: '123 Main Street',
                    location_city: 'San Francisco, CA 94102',
                    location_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
                    phone: '(555) 123-4567',
                    testimonial_text: 'Amazing service and great prices! I found exactly what I needed.',
                    testimonial_author: 'Sarah Johnson',
                },
            },
            {
                title: 'New Customer Welcome',
                status: 'published',
                organization_id: org.id,
                content_type_id: contentType.id,
                data: {
                    hero_headline: 'Welcome! Get 20% Off Your First Purchase',
                    hero_subheadline: 'Join thousands of satisfied customers today',
                    cta_text: 'Claim Offer',
                    cta_url: 'https://example.com/welcome',
                    offer_title: 'First-Time Customer Exclusive',
                    offer_description: 'Get 20% off your first purchase when you sign up for our newsletter.',
                    offer_expires: '2024-12-31',
                    location_address: '123 Main Street',
                    location_city: 'San Francisco, CA 94102',
                    location_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
                    phone: '(555) 123-4567',
                    testimonial_text: 'The welcome discount made it easy to try their products. Highly recommend!',
                    testimonial_author: 'Michael Chen',
                },
            },
            {
                title: 'Premium Services',
                status: 'published',
                organization_id: org.id,
                content_type_id: contentType.id,
                data: {
                    hero_headline: 'Premium Installation & Support',
                    hero_subheadline: 'Professional service packages tailored to your needs',
                    cta_text: 'Learn More',
                    cta_url: 'https://example.com/services',
                    offer_title: 'Professional Service Packages',
                    offer_description: 'Expert installation and ongoing support for all your needs.',
                    offer_expires: '2024-12-31',
                    location_address: '123 Main Street',
                    location_city: 'San Francisco, CA 94102',
                    location_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
                    phone: '(555) 123-4567',
                    testimonial_text: 'The installation team was professional and efficient. Five stars!',
                    testimonial_author: 'Emily Rodriguez',
                },
            },
            {
                title: 'Holiday Preview',
                status: 'draft',
                organization_id: org.id,
                content_type_id: contentType.id,
                data: {
                    hero_headline: 'Holiday Sale Coming Soon',
                    hero_subheadline: 'Be the first to know about our biggest sale of the year',
                    cta_text: 'Get Notified',
                    cta_url: 'https://example.com/notify',
                    offer_title: 'Holiday Sale Preview',
                    offer_description: 'Sign up to get early access to our holiday deals.',
                    offer_expires: '2024-12-25',
                    location_address: '123 Main Street',
                    location_city: 'San Francisco, CA 94102',
                    location_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
                    phone: '(555) 123-4567',
                    testimonial_text: 'Can\'t wait for the holiday sale! Last year was amazing.',
                    testimonial_author: 'David Thompson',
                },
            },
        ];

        const createdItems = [];
        for (const item of items) {
            const { data, error } = await supabase
                .from('content_items')
                .insert(item)
                .select()
                .single();

            if (error) {
                console.error(`❌ Error creating ${item.title}:`, error.message);
                return;
            }
            createdItems.push(data);
            console.log(`✅ ${item.title} created`);
        }

        // 6. Create mappings
        console.log('\n6️⃣ Creating campaign mappings...');
        const mappings = [
            // Facebook Campaign
            { site: 0, item: 0, mode: 'full' },
            { site: 0, item: 1, mode: 'override', overrides: { cta_text: 'Sign Up Free' } },
            { site: 0, item: 2, mode: 'block' },

            // Google Campaign
            { site: 1, item: 0, mode: 'override', overrides: { cta_text: 'Get Quote' } },
            { site: 1, item: 1, mode: 'full' },
            { site: 1, item: 2, mode: 'full' },

            // Instagram Campaign
            { site: 2, item: 0, mode: 'override', overrides: { cta_text: 'Shop Now', cta_url: 'https://example.com/shop?utm_source=instagram&utm_medium=cpc&utm_campaign=spring_sale' } },
            { site: 2, item: 2, mode: 'override', overrides: { offer_title: 'Premium Services - Instagram Exclusive' } },
            { site: 2, item: 1, mode: 'block' },
        ];

        for (const mapping of mappings) {
            const site = createdSites[mapping.site];
            const item = createdItems[mapping.item];

            if (site && item && item.status === 'published') {
                const { error } = await supabase
                    .from('site_item_mappings')
                    .insert({
                        site_id: site.id,
                        content_item_id: item.id,
                        mode: mapping.mode,
                        overrides: mapping.overrides || {},
                    });

                if (error) {
                    console.error(`❌ Error creating mapping:`, error.message);
                } else {
                    console.log(`✅ Mapping created: ${site.name} → ${item.title} (${mapping.mode})`);
                }
            }
        }

        console.log('\n🎉 Seed completed successfully!');
        console.log('\n📝 Next steps:');
        console.log('   1. Refresh your browser (Ctrl+Shift+R)');
        console.log('   2. You should now see data in the dashboard');
        console.log('   3. Go to Dashboard and click "Run Sync"');
        console.log('   4. Go to Sites and click "View Landing Page"');

    } catch (error) {
        console.error('\n❌ Unexpected error:', error);
    }
}

seed();
