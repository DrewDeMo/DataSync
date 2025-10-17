/**
 * Landing Page Receiver Endpoint
 * 
 * Accepts POST requests with synced content data and writes to landing page data.json files.
 * Validates HMAC signatures to ensure data integrity.
 * 
 * Expected POST body:
 * {
 *   payload: { ...content data... },
 *   signature: "hmac-sha256-signature",
 *   campaign: "facebook" | "google" | "instagram"
 * }
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Secret key for HMAC validation (should match syncEngine.ts)
const HMAC_SECRET = process.env.SYNC_SECRET || 'datasync-demo-secret-key-2024';

// Valid campaign names
const VALID_CAMPAIGNS = ['facebook', 'google', 'instagram'];

/**
 * Verify HMAC signature
 */
function verifySignature(payload, signature) {
    const expectedSignature = crypto
        .createHmac('sha256', HMAC_SECRET)
        .update(JSON.stringify(payload))
        .digest('hex');

    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
}

/**
 * Main handler function
 */
export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({
            success: false,
            error: 'Method not allowed'
        });
    }

    try {
        const { payload, signature, campaign } = req.body;

        // Validate required fields
        if (!payload || !signature || !campaign) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: payload, signature, campaign'
            });
        }

        // Validate campaign name
        if (!VALID_CAMPAIGNS.includes(campaign)) {
            return res.status(400).json({
                success: false,
                error: `Invalid campaign. Must be one of: ${VALID_CAMPAIGNS.join(', ')}`
            });
        }

        // Verify HMAC signature
        if (!verifySignature(payload, signature)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid signature'
            });
        }

        // Add sync timestamp
        const dataToWrite = {
            ...payload,
            synced_at: new Date().toISOString(),
            campaign: campaign
        };

        // Determine target file path
        const landingPagesDir = path.join(__dirname, '..', '..', 'landing-pages');
        const targetFile = path.join(landingPagesDir, campaign, 'data.json');

        // Ensure directory exists
        const targetDir = path.dirname(targetFile);
        if (!fs.existsSync(targetDir)) {
            fs.mkdirSync(targetDir, { recursive: true });
        }

        // Write data to file
        fs.writeFileSync(
            targetFile,
            JSON.stringify(dataToWrite, null, 2),
            'utf8'
        );

        console.log(`✅ Successfully synced content to ${campaign} landing page`);

        return res.status(200).json({
            success: true,
            message: `Content synced to ${campaign} landing page`,
            timestamp: dataToWrite.synced_at
        });

    } catch (error) {
        console.error('Error processing sync request:', error);
        return res.status(500).json({
            success: false,
            error: 'Internal server error',
            details: error.message
        });
    }
}
