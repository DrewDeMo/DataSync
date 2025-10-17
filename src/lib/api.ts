import { supabase } from './supabase';

export async function getCurrentOrganization() {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .maybeSingle();

  if (!profile) throw new Error('No profile found');

  const { data: org, error } = await supabase
    .from('organizations')
    .select('*')
    .eq('id', profile.organization_id)
    .single();

  if (error) throw error;
  return org;
}

export async function getContentTypes() {
  const { data, error } = await supabase
    .from('content_types')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createContentType(name: string, schema: any[]) {
  const org = await getCurrentOrganization();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_');

  const { data, error } = await supabase
    .from('content_types')
    .insert({
      organization_id: org.id,
      name,
      slug,
      schema,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getContentItems(typeId?: string, status?: string) {
  let query = supabase
    .from('content_items')
    .select('*, content_types(name)')
    .order('updated_at', { ascending: false });

  if (typeId) {
    query = query.eq('content_type_id', typeId);
  }

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function createContentItem(
  contentTypeId: string,
  title: string,
  data: any,
  status: 'draft' | 'published' | 'archived' = 'draft'
) {
  const org = await getCurrentOrganization();

  const { data: item, error } = await supabase
    .from('content_items')
    .insert({
      organization_id: org.id,
      content_type_id: contentTypeId,
      title,
      data,
      status,
    })
    .select()
    .single();

  if (error) throw error;
  return item;
}

export async function updateContentItem(
  itemId: string,
  updates: { title?: string; data?: any; status?: string }
) {
  const { data, error } = await supabase
    .from('content_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', itemId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getSites() {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function createSite(
  name: string,
  destinationUrl: string,
  destinationSecret: string
) {
  const org = await getCurrentOrganization();
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const { data, error } = await supabase
    .from('sites')
    .insert({
      organization_id: org.id,
      name,
      slug,
      destination_url: destinationUrl,
      destination_secret: destinationSecret,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getMappings() {
  const { data, error } = await supabase
    .from('site_item_mappings')
    .select('*, sites(name, slug), content_items(title)')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function upsertMapping(
  siteId: string,
  contentItemId: string,
  mode: 'full' | 'override' | 'block',
  overrides: any = {}
) {
  const { data, error } = await supabase
    .from('site_item_mappings')
    .upsert(
      {
        site_id: siteId,
        content_item_id: contentItemId,
        mode,
        overrides,
      },
      { onConflict: 'site_id,content_item_id' }
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteMapping(siteId: string, contentItemId: string) {
  const { error } = await supabase
    .from('site_item_mappings')
    .delete()
    .eq('site_id', siteId)
    .eq('content_item_id', contentItemId);

  if (error) throw error;
}

export async function getSyncJobs(limit = 10) {
  const { data, error } = await supabase
    .from('sync_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data;
}

export async function getSyncJob(jobId: string) {
  const { data, error } = await supabase
    .from('sync_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) throw error;
  return data;
}

export async function getJobLogs(jobId: string) {
  const { data, error } = await supabase
    .from('job_logs')
    .select('*, sites(name), content_items(title)')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getDestinationSnapshot(siteId: string) {
  const { data, error } = await supabase
    .from('destination_snapshots')
    .select('*')
    .eq('site_id', siteId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function generateSecret(length = 32): Promise<string> {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
