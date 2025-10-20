// Instagram Campaign Landing Page - Dynamic Content Loader

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Get synced data from localStorage
        const storageKey = 'landing_page_data_instagram';
        const storedData = localStorage.getItem(storageKey);

        if (!storedData) {
            throw new Error('No synced data available');
        }

        const data = JSON.parse(storedData);

        // Populate hero section
        if (data.hero_headline) {
            document.getElementById('hero-headline').textContent = data.hero_headline;
        }

        if (data.hero_subheadline) {
            document.getElementById('hero-subheadline').textContent = data.hero_subheadline;
        }

        // Populate CTA button (support both cta_text and cta_primary)
        const ctaText = data.cta_text || data.cta_primary;
        if (ctaText) {
            const ctaButton = document.getElementById('cta-button');
            ctaButton.textContent = ctaText;

            const ctaUrl = data.cta_url || data.cta_link;
            if (ctaUrl) {
                ctaButton.href = ctaUrl;
            }
        }

        // Populate offer section (if available)
        const offerSection = document.getElementById('offer-section');
        if (data.offer_title && data.offer_description) {
            document.getElementById('offer-title').textContent = data.offer_title;

            // Handle markdown in offer description
            const offerDesc = document.getElementById('offer-description');
            if (data.offer_description.includes('**') || data.offer_description.includes('*')) {
                // Simple markdown to HTML conversion
                let html = data.offer_description
                    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                    .replace(/\*(.+?)\*/g, '<em>$1</em>')
                    .replace(/\n/g, '<br>');
                offerDesc.innerHTML = html;
            } else {
                offerDesc.textContent = data.offer_description;
            }

            // Support both offer_expires and valid_until fields
            const expiresDate = data.offer_expires || data.valid_until;
            if (expiresDate) {
                const date = new Date(expiresDate);
                document.getElementById('offer-expires').textContent =
                    `Expires: ${date.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}`;
            }

            // Show discount amount if available
            if (data.discount_amount) {
                const offerBadge = offerSection.querySelector('.offer-badge');
                offerBadge.textContent = data.discount_amount;
            }
        } else {
            offerSection.classList.add('hidden');
        }

        // Populate location info
        if (data.location_address) {
            document.getElementById('location-address').textContent = data.location_address;
        }

        if (data.location_city) {
            document.getElementById('location-city').textContent = data.location_city;
        }

        if (data.location_hours) {
            document.getElementById('location-hours').textContent = data.location_hours;
        }

        if (data.phone) {
            document.getElementById('phone').textContent = data.phone;
        }

        // Populate testimonial (if available)
        const testimonialSection = document.getElementById('testimonial-section');
        const testimonialText = data.testimonial_text || data.testimonial;
        if (testimonialText && data.testimonial_author) {
            document.getElementById('testimonial-text').textContent = `"${testimonialText}"`;
            document.getElementById('testimonial-author').textContent = `- ${data.testimonial_author}`;
        } else {
            testimonialSection.classList.add('hidden');
        }

        // Update sync status
        if (data.synced_at) {
            const syncDate = new Date(data.synced_at);
            const timeAgo = getTimeAgo(syncDate);
            document.getElementById('sync-status').textContent =
                `Last synced ${timeAgo} from Instagram Campaign`;
        } else {
            document.getElementById('sync-status').textContent =
                'Content loaded from Instagram Campaign';
        }

    } catch (error) {
        console.error('Error loading content:', error);

        // Show error state
        document.getElementById('sync-status').textContent =
            'No synced content available yet';
        document.getElementById('hero-headline').textContent =
            'Content Not Yet Synced';
        document.getElementById('hero-subheadline').textContent =
            'Please run a sync from the DataSync admin dashboard to populate this landing page.';
        document.getElementById('cta-button').textContent =
            'Sync Required';
        document.getElementById('cta-button').href = '#';

        // Hide optional sections
        document.getElementById('offer-section').classList.add('hidden');
        document.getElementById('testimonial-section').classList.add('hidden');
    }
});

/**
 * Calculate human-readable time ago string
 */
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);

    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);

        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }

    return 'just now';
}
