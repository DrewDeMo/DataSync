import { supabase } from './supabase';
import { generateSecret } from './api';

export async function seedDemoData(userId: string, organizationId: string) {
  try {
    console.log('Starting seed process...');

    const baseUrl = window.location.origin;

    const sites = [
      {
        name: 'Facebook Campaign',
        slug: 'facebook',
        destination_url: `${baseUrl}/landing-pages/facebook/`,
        destination_secret: await generateSecret(),
      },
      {
        name: 'Google Campaign',
        slug: 'google',
        destination_url: `${baseUrl}/landing-pages/google/`,
        destination_secret: await generateSecret(),
      },
      {
        name: 'Instagram Campaign',
        slug: 'instagram',
        destination_url: `${baseUrl}/landing-pages/instagram/`,
        destination_secret: await generateSecret(),
      },
    ];

    console.log('Creating sites...');
    const createdSites = [];
    for (const site of sites) {
      const { data, error } = await supabase
        .from('sites')
        .insert({ ...site, organization_id: organizationId })
        .select()
        .single();
      if (error) throw error;
      createdSites.push(data);
    }

    console.log('Creating content type...');
    const { data: contentType, error: typeError } = await supabase
      .from('content_types')
      .insert({
        organization_id: organizationId,
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
        ],
      })
      .select()
      .single();

    if (typeError) throw typeError;

    console.log('Creating content items...');
    const items = [
      {
        title: 'Spring Sale 2024',
        status: 'published',
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
        .insert({
          organization_id: organizationId,
          content_type_id: contentType.id,
          ...item,
        })
        .select()
        .single();
      if (error) throw error;
      createdItems.push(data);
    }

    console.log('Creating mappings...');
    const mappings = [
      // Facebook Campaign
      { site: 'Facebook Campaign', item: 0, mode: 'full' as const },
      { site: 'Facebook Campaign', item: 1, mode: 'override' as const, overrides: { cta_text: 'Sign Up Free' } },
      { site: 'Facebook Campaign', item: 2, mode: 'block' as const },

      // Google Campaign
      { site: 'Google Campaign', item: 0, mode: 'override' as const, overrides: { cta_text: 'Get Quote' } },
      { site: 'Google Campaign', item: 1, mode: 'full' as const },
      { site: 'Google Campaign', item: 2, mode: 'full' as const },

      // Instagram Campaign
      { site: 'Instagram Campaign', item: 0, mode: 'override' as const, overrides: { cta_text: 'Shop Now', cta_url: 'https://example.com/shop?utm_source=instagram&utm_medium=cpc&utm_campaign=spring_sale' } },
      { site: 'Instagram Campaign', item: 2, mode: 'override' as const, overrides: { offer_title: 'Premium Services - Instagram Exclusive' } },
      { site: 'Instagram Campaign', item: 1, mode: 'block' as const },
    ];

    for (const mapping of mappings) {
      const site = createdSites.find(s => s.name === mapping.site);
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
        if (error) throw error;
      }
    }

    console.log('Seed completed successfully!');
    return { success: true };
  } catch (error) {
    console.error('Seed error:', error);
    return { success: false, error };
  }
}
