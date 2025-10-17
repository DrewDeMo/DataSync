// Facebook Campaign Landing Page - Dynamic Content Loader

document.addEventListener('DOMContentLoaded', async () => {
    try {
        // Fetch the synced data
        const response = await fetch('data.json');

        if (!response.ok) {
            throw new Error('No synced data available');
        }

        const data = await response.json();

        // Populate hero section
        if (data.hero_headline) {
            document.getElementById('hero-headline').textContent = data.hero_headline;
        }

        if (data.hero_subheadline) {
            document.getElementById('hero-subheadline').textContent = data.hero_subheadline;
        }

        // Populate CTA button
        if (data.cta_text) {
            const ctaButton = document.getElementById('cta-button');
            ctaButton.textContent = data.cta_text;

            if (data.cta_url) {
                ctaButton.href = data.cta_url;
            }
        }

        // Populate offer section (if available)
        const offerSection = document.getElementById('offer-section');
        if (data.offer_title && data.offer_description) {
            document.getElementById('offer-title').textContent = data.offer_title;
            document.getElementById('offer-description').textContent = data.offer_description;

            if (data.offer_expires) {
                const expiresDate = new Date(data.offer_expires);
                document.getElementById('offer-expires').textContent =
                    `Expires: ${expiresDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}`;
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
        if (data.testimonial_text && data.testimonial_author) {
            document.getElementById('testimonial-text').textContent = `"${data.testimonial_text}"`;
            document.getElementById('testimonial-author').textContent = `- ${data.testimonial_author}`;
        } else {
            testimonialSection.classList.add('hidden');
        }

        // Update sync status
        if (data.synced_at) {
            const syncDate = new Date(data.synced_at);
            const timeAgo = getTimeAgo(syncDate);
            document.getElementById('sync-status').textContent =
                `Last synced ${timeAgo} from Facebook Campaign`;
        } else {
            document.getElementById('sync-status').textContent =
                'Content loaded from Facebook Campaign';
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
