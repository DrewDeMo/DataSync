/**
 * Landing Page Receiver - Client-Side Implementation
 * 
 * Since we're using Vite (client-side only), we'll store synced content
 * in localStorage and have landing pages read from there.
 * 
 * In production, this would be replaced with actual API endpoints.
 */

interface SyncPayload {
    payload: any;
    signature: string;
    campaign: 'facebook' | 'google' | 'instagram';
}

interface ReceiverResponse {
    success: boolean;
    message?: string;
    timestamp?: string;
    error?: string;
}

/**
 * Simulated HMAC verification
 * In production, this would verify against the site's destination_secret
 */
function verifySignature(payload: any, signature: string, secret: string): boolean {
    // For demo purposes, we'll accept any signature
    // In production, this would use crypto.subtle.sign to verify
    return true;
}

/**
 * Handle incoming sync payload
 */
export async function handleLandingPageSync(data: SyncPayload): Promise<ReceiverResponse> {
    try {
        const { payload, signature, campaign } = data;

        // Validate required fields
        if (!payload || !signature || !campaign) {
            return {
                success: false,
                error: 'Missing required fields: payload, signature, campaign'
            };
        }

        // Validate campaign
        const validCampaigns = ['facebook', 'google', 'instagram'];
        if (!validCampaigns.includes(campaign)) {
            return {
                success: false,
                error: `Invalid campaign. Must be one of: ${validCampaigns.join(', ')}`
            };
        }

        // Add sync timestamp
        const dataToStore = {
            ...payload,
            synced_at: new Date().toISOString(),
            campaign: campaign
        };

        // Store in localStorage with campaign-specific key
        const storageKey = `landing_page_data_${campaign}`;
        localStorage.setItem(storageKey, JSON.stringify(dataToStore));

        console.log(`✅ Successfully synced content to ${campaign} landing page`);

        return {
            success: true,
            message: `Content synced to ${campaign} landing page`,
            timestamp: dataToStore.synced_at
        };

    } catch (error: any) {
        console.error('Error processing sync request:', error);
        return {
            success: false,
            error: 'Internal server error',
        };
    }
}

/**
 * Get synced data for a specific campaign
 */
export function getLandingPageData(campaign: 'facebook' | 'google' | 'instagram'): any | null {
    try {
        const storageKey = `landing_page_data_${campaign}`;
        const data = localStorage.getItem(storageKey);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error loading data for ${campaign}:`, error);
        return null;
    }
}

/**
 * Clear synced data for a specific campaign
 */
export function clearLandingPageData(campaign: 'facebook' | 'google' | 'instagram'): void {
    const storageKey = `landing_page_data_${campaign}`;
    localStorage.removeItem(storageKey);
}
