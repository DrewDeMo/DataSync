import { supabase } from './supabase';
import { handleLandingPageSync } from './landingPageReceiver';

export async function executeSyncJob(jobId: string, organizationId: string) {
  try {
    await updateJobStatus(jobId, 'running', new Date().toISOString());
    await addLog(jobId, 'info', 'Sync job started');

    const sites = await getSitesForSync(organizationId);
    await addLog(jobId, 'info', `Found ${sites.length} sites to sync`);

    const results = await Promise.all(
      sites.map(site => syncSite(jobId, site))
    );

    const allSuccess = results.every(r => r.success);
    const allFailed = results.every(r => !r.success);
    const finalStatus = allSuccess ? 'success' : allFailed ? 'failed' : 'partial';

    await updateJobStatus(jobId, finalStatus, null, new Date().toISOString());
    await addLog(jobId, 'info', `Sync job completed with status: ${finalStatus}`);

    return { success: !allFailed, status: finalStatus };
  } catch (error: any) {
    await addLog(jobId, 'error', `Fatal error: ${error.message}`);
    await updateJobStatus(jobId, 'failed', null, new Date().toISOString());
    return { success: false, status: 'failed' };
  }
}

async function getSitesForSync(organizationId: string) {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) throw error;
  return data;
}

async function syncSite(jobId: string, site: any) {
  try {
    await addLog(jobId, 'info', `Syncing site: ${site.name}`, site.id);

    const mappings = await getSiteMappings(site.id);
    await addLog(jobId, 'info', `Found ${mappings.length} mappings for ${site.name}`, site.id);

    const payload = await buildPayload(mappings);

    const shouldFail = Math.random() < 0.15;

    if (shouldFail) {
      await addLog(jobId, 'warn', `Simulated failure for ${site.name}, retrying...`, site.id);
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    await addLog(jobId, 'info', `Sending ${payload.items.length} items to ${site.name}`, site.id, null, { itemCount: payload.items.length });

    // For landing pages, merge all items into a single content object
    const landingPageContent = mergeLandingPageContent(payload.items);

    // Generate signature for the landing page content
    const signature = await generateSignature(landingPageContent, site.destination_secret);

    // Determine campaign type from site slug
    const campaign = site.slug as 'facebook' | 'google' | 'instagram';

    // Use client-side receiver (for demo purposes)
    // In production, this would POST to an actual API endpoint
    const result = await handleLandingPageSync({
      payload: landingPageContent,
      signature: signature,
      campaign: campaign,
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to sync to landing page');
    }

    // Store snapshot in destination_snapshots table
    await supabase
      .from('destination_snapshots')
      .upsert({
        site_id: site.id,
        payload: landingPageContent,
        received_at: new Date().toISOString(),
        item_count: payload.items.length,
      }, {
        onConflict: 'site_id'
      });

    await supabase
      .from('sites')
      .update({
        last_sync_status: 'success',
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', site.id);

    await addLog(jobId, 'info', `Successfully synced to ${site.name}`, site.id, null, {
      ...result,
      itemCount: payload.items.length
    });

    return { success: true, siteId: site.id };
  } catch (error: any) {
    await supabase
      .from('sites')
      .update({
        last_sync_status: 'failed',
        last_sync_at: new Date().toISOString(),
      })
      .eq('id', site.id);

    await addLog(jobId, 'error', `Failed to sync ${site.name}: ${error.message}`, site.id);
    return { success: false, siteId: site.id };
  }
}

async function getSiteMappings(siteId: string) {
  const { data, error } = await supabase
    .from('site_item_mappings')
    .select('*, content_items(*)')
    .eq('site_id', siteId);

  if (error) throw error;
  return data;
}

async function buildPayload(mappings: any[]) {
  const items = mappings
    .filter(m => m.mode !== 'block' && m.content_items?.status === 'published')
    .map(m => {
      const baseData = m.content_items.data;
      const finalData = m.mode === 'override'
        ? { ...baseData, ...m.overrides }
        : baseData;

      return {
        id: m.content_items.id,
        title: m.content_items.title,
        data: finalData,
        mode: m.mode,
      };
    });

  return {
    items,
    syncedAt: new Date().toISOString(),
    version: '1.0',
  };
}

/**
 * Merge multiple content items into a single landing page content object
 * Takes the first item's data as the base and merges in additional items
 */
function mergeLandingPageContent(items: any[]) {
  if (items.length === 0) {
    return {};
  }

  // Start with the first item as the base
  const merged = { ...items[0].data };

  // For landing pages, we typically want to use the first item's content
  // but this could be extended to merge multiple items if needed

  return merged;
}

async function generateSignature(payload: any, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(JSON.stringify(payload));
  const key = encoder.encode(secret);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function updateJobStatus(
  jobId: string,
  status: string,
  startedAt: string | null = null,
  completedAt: string | null = null
) {
  const updates: any = { status };
  if (startedAt) updates.started_at = startedAt;
  if (completedAt) updates.completed_at = completedAt;

  await supabase
    .from('sync_jobs')
    .update(updates)
    .eq('id', jobId);
}

async function addLog(
  jobId: string,
  level: 'info' | 'warn' | 'error',
  message: string,
  siteId: string | null = null,
  contentItemId: string | null = null,
  payload: any = null
) {
  await supabase
    .from('job_logs')
    .insert({
      job_id: jobId,
      level,
      message,
      site_id: siteId,
      content_item_id: contentItemId,
      payload,
    });
}
