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
          hero_subheadline: 'Limited time spring sale on all products. Transform your space with premium quality at unbeatable prices!',
          cta_text: 'Shop Now',
          cta_url: 'https://example.com/shop',
          offer_title: 'Spring Sale - Up to 40% Off',
          offer_description: 'Limited time spring sale on select items. Don\'t miss out on incredible savings! Offer valid while supplies last.',
          offer_expires: '2024-05-31',
          location_address: '123 Main Street',
          location_city: 'San Francisco, CA 94102',
          location_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
          phone: '(555) 123-4567',
          testimonial_text: 'Amazing service and great prices! I found exactly what I needed and the staff was incredibly helpful throughout the entire process.',
          testimonial_author: 'Sarah Johnson',
        },
      },
      {
        title: 'New Customer Welcome',
        status: 'published',
        data: {
          hero_headline: 'Welcome! Get 20% Off Your First Purchase',
          hero_subheadline: 'Join thousands of satisfied customers today and experience the difference',
          cta_text: 'Claim Offer',
          cta_url: 'https://example.com/welcome',
          offer_title: 'First-Time Customer Exclusive',
          offer_description: 'Get 20% off your first purchase when you sign up for our newsletter. Plus, receive exclusive tips and early access to sales!',
          offer_expires: '2024-12-31',
          location_address: '123 Main Street',
          location_city: 'San Francisco, CA 94102',
          location_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
          phone: '(555) 123-4567',
          testimonial_text: 'The welcome discount made it easy to try their products. Highly recommend! The quality exceeded my expectations.',
          testimonial_author: 'Michael Chen',
        },
      },
      {
        title: 'Premium Services',
        status: 'published',
        data: {
          hero_headline: 'Premium Installation & Support',
          hero_subheadline: 'Professional service packages tailored to your needs with lifetime warranty',
          cta_text: 'Learn More',
          cta_url: 'https://example.com/services',
          offer_title: 'Professional Service Packages',
          offer_description: 'Expert installation and ongoing support for all your needs. Our certified technicians ensure perfect results every time.',
          offer_expires: '2024-12-31',
          location_address: '123 Main Street',
          location_city: 'San Francisco, CA 94102',
          location_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
          phone: '(555) 123-4567',
          testimonial_text: 'The installation team was professional and efficient. Five stars! They completed the job ahead of schedule and cleaned up perfectly.',
          testimonial_author: 'Emily Rodriguez',
        },
      },
      {
        title: 'Flash Sale - 48 Hours Only',
        status: 'published',
        data: {
          hero_headline: '⚡ Flash Sale - 50% Off Everything!',
          hero_subheadline: 'This weekend only! Don\'t miss our biggest discount of the year',
          cta_text: 'Shop Flash Sale',
          cta_url: 'https://example.com/flash-sale',
          offer_title: '48-Hour Flash Sale',
          offer_description: 'Massive 50% discount on our entire inventory. No exclusions, no gimmicks - just incredible savings for 48 hours only!',
          offer_expires: '2024-06-15',
          location_address: '123 Main Street',
          location_city: 'San Francisco, CA 94102',
          location_hours: 'Extended Hours: 8AM-10PM This Weekend',
          phone: '(555) 123-4567',
          testimonial_text: 'I saved over $500 during the last flash sale! The deals are absolutely real and the selection is amazing.',
          testimonial_author: 'James Martinez',
        },
      },
      {
        title: 'Financing Available',
        status: 'published',
        data: {
          hero_headline: '0% Financing for 12 Months',
          hero_subheadline: 'Make your dream project affordable with flexible payment options',
          cta_text: 'Apply Now',
          cta_url: 'https://example.com/financing',
          offer_title: 'Special Financing Options',
          offer_description: 'Qualified buyers can enjoy 0% APR for 12 months on purchases over $1,000. Subject to credit approval.',
          offer_expires: '2024-12-31',
          location_address: '123 Main Street',
          location_city: 'San Francisco, CA 94102',
          location_hours: 'Mon-Sat: 9AM-8PM, Sun: 10AM-6PM',
          phone: '(555) 123-4567',
          testimonial_text: 'The financing made it possible for us to complete our renovation without breaking the bank. Highly recommend!',
          testimonial_author: 'Lisa Anderson',
        },
      },
      {
        title: 'Holiday Preview',
        status: 'draft',
        data: {
          hero_headline: '🎄 Holiday Sale Coming Soon',
          hero_subheadline: 'Be the first to know about our biggest sale of the year with exclusive early access',
          cta_text: 'Get Notified',
          cta_url: 'https://example.com/notify',
          offer_title: 'Holiday Sale Preview - Early Access',
          offer_description: 'Sign up to get early access to our holiday deals 24 hours before the public. Plus, receive an extra 10% off your first holiday purchase!',
          offer_expires: '2024-12-25',
          location_address: '123 Main Street',
          location_city: 'San Francisco, CA 94102',
          location_hours: 'Extended Holiday Hours: Mon-Sat: 8AM-10PM, Sun: 9AM-8PM',
          phone: '(555) 123-4567',
          testimonial_text: 'Can\'t wait for the holiday sale! Last year was amazing - I got all my gifts at incredible prices.',
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
      // Facebook Campaign - Focus on social proof and urgency
      { site: 'Facebook Campaign', item: 0, mode: 'full' as const },
      {
        site: 'Facebook Campaign', item: 1, mode: 'override' as const, overrides: {
          cta_text: 'Join Now - Limited Spots',
          hero_subheadline: 'Join 10,000+ happy customers who trust us for quality and service'
        }
      },
      {
        site: 'Facebook Campaign', item: 3, mode: 'override' as const, overrides: {
          cta_text: 'Grab This Deal',
          hero_headline: '⚡ Flash Sale Alert - 50% Off!'
        }
      },
      { site: 'Facebook Campaign', item: 2, mode: 'block' as const },

      // Google Campaign - Focus on value and information
      {
        site: 'Google Campaign', item: 0, mode: 'override' as const, overrides: {
          cta_text: 'Get Free Quote',
          hero_subheadline: 'Premium quality at competitive prices - Compare and save today'
        }
      },
      { site: 'Google Campaign', item: 1, mode: 'full' as const },
      { site: 'Google Campaign', item: 2, mode: 'full' as const },
      {
        site: 'Google Campaign', item: 4, mode: 'override' as const, overrides: {
          cta_text: 'Check Eligibility',
          hero_headline: 'Flexible Financing - 0% APR Available'
        }
      },

      // Instagram Campaign - Focus on visual appeal and exclusivity
      {
        site: 'Instagram Campaign', item: 0, mode: 'override' as const, overrides: {
          cta_text: 'Shop Spring Sale 🌸',
          cta_url: 'https://example.com/shop?utm_source=instagram&utm_medium=cpc&utm_campaign=spring_sale',
          hero_headline: '🌸 Spring Vibes - Up to 40% Off'
        }
      },
      {
        site: 'Instagram Campaign', item: 2, mode: 'override' as const, overrides: {
          offer_title: 'Premium Services - Instagram Exclusive ✨',
          hero_headline: '✨ Premium Installation - Instagram Special'
        }
      },
      {
        site: 'Instagram Campaign', item: 3, mode: 'override' as const, overrides: {
          cta_text: 'Shop Flash Sale ⚡',
          hero_headline: '⚡ 48-Hour Flash Sale - 50% Off'
        }
      },
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
