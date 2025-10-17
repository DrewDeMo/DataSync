import { supabase } from './supabase';
import { generateSecret } from './api';

export async function seedDemoData(userId: string, organizationId: string) {
  try {
    console.log('Starting seed process...');

    const baseUrl = window.location.origin;

    const sites = [
      {
        name: 'North',
        slug: 'north',
        destination_url: `${baseUrl}/api/destination/north`,
        destination_secret: await generateSecret(),
      },
      {
        name: 'South',
        slug: 'south',
        destination_url: `${baseUrl}/api/destination/south`,
        destination_secret: await generateSecret(),
      },
      {
        name: 'West',
        slug: 'west',
        destination_url: `${baseUrl}/api/destination/west`,
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
        name: 'Offer Banner',
        slug: 'offer_banner',
        schema: [
          { name: 'headline', type: 'text', required: true },
          { name: 'cta_text', type: 'text', required: true },
          { name: 'start_date', type: 'date', required: false },
          { name: 'end_date', type: 'date', required: false },
          { name: 'discount_percent', type: 'number', required: false },
          { name: 'terms', type: 'text', required: false },
        ],
      })
      .select()
      .single();

    if (typeError) throw typeError;

    console.log('Creating content items...');
    const items = [
      {
        title: 'Fall Savings Event',
        status: 'published',
        data: {
          headline: 'Fall Savings Event - Up to 40% Off',
          cta_text: 'Shop Now',
          start_date: '2024-09-01',
          end_date: '2024-11-30',
          discount_percent: 40,
          terms: 'Some exclusions apply. See store for details.',
        },
      },
      {
        title: 'Free Installation',
        status: 'published',
        data: {
          headline: 'Free Professional Installation',
          cta_text: 'Learn More',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          discount_percent: 0,
          terms: 'On qualifying purchases over $999.',
        },
      },
      {
        title: '0% Financing 12mo',
        status: 'published',
        data: {
          headline: '0% Financing for 12 Months',
          cta_text: 'Apply Now',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          discount_percent: 0,
          terms: 'Subject to credit approval. See store for details.',
        },
      },
      {
        title: 'Veterans Day Special',
        status: 'draft',
        data: {
          headline: 'Veterans Day - Thank You for Your Service',
          cta_text: 'View Offers',
          start_date: '2024-11-11',
          end_date: '2024-11-11',
          discount_percent: 15,
          terms: 'Valid military ID required.',
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
      { site: 'North', item: 0, mode: 'full' as const },
      { site: 'North', item: 1, mode: 'override' as const, overrides: { cta_text: 'Get Started Today' } },
      { site: 'South', item: 0, mode: 'block' as const },
      { site: 'South', item: 2, mode: 'full' as const },
      { site: 'West', item: 0, mode: 'full' as const },
      { site: 'West', item: 1, mode: 'full' as const },
      { site: 'West', item: 2, mode: 'full' as const },
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
