import { supabase } from './supabase';

export async function handleDestinationRequest(siteSlug: string, payload: any, signature: string) {
  try {
    const { data: site } = await supabase
      .from('sites')
      .select('*')
      .eq('slug', siteSlug)
      .maybeSingle();

    if (!site) {
      return {
        success: false,
        error: 'Site not found',
        status: 404,
      };
    }

    const validSignature = await verifySignature(payload, site.destination_secret, signature);
    if (!validSignature) {
      return {
        success: false,
        error: 'Invalid signature',
        status: 401,
      };
    }

    await supabase
      .from('destination_snapshots')
      .upsert({
        site_id: site.id,
        payload,
        received_at: new Date().toISOString(),
        item_count: payload.items?.length || 0,
      }, { onConflict: 'site_id' });

    return {
      success: true,
      applied: true,
      receivedAt: new Date().toISOString(),
      itemCount: payload.items?.length || 0,
      status: 200,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      status: 500,
    };
  }
}

async function verifySignature(payload: any, secret: string, providedSignature: string): Promise<boolean> {
  try {
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
    const expectedSignature = Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    return expectedSignature === providedSignature;
  } catch {
    return false;
  }
}
