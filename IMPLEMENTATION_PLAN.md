# DataSync Ad Campaign Landing Page Showcase - Implementation Plan

## Overview
Transform DataSync into a portfolio showcase that demonstrates syncing business content (offers, locations, hours) to actual landing pages for Facebook, Google, and Instagram ad campaigns.

## Architecture

```
DataSync Admin (React/Supabase)
    ↓ User creates content & triggers sync
Sync Engine
    ↓ POST with HMAC signature
Landing Pages (Static HTML/CSS/JS)
    ↓ Receive & store in data.json
    ↓ Dynamically render content
Campaign Landing Pages (viewable by portfolio visitors)
```

## Directory Structure

```
h:/Development/DataSync/
├── src/                              # React admin app
│   ├── lib/
│   │   ├── seed.ts                  # UPDATE: Campaign names
│   │   └── syncEngine.ts            # UPDATE: Target landing pages
│   └── pages/
│       └── Sites.tsx                # UPDATE: Add preview links
├── landing-pages/                    # NEW: Standalone pages
│   ├── facebook/
│   │   ├── index.html               # FB campaign page
│   │   ├── styles.css               # FB blue branding
│   │   ├── script.js                # Dynamic content loader
│   │   └── data.json                # Synced content (gitignored)
│   ├── google/
│   │   ├── index.html               # Google campaign page
│   │   ├── styles.css               # Google colors
│   │   ├── script.js                # Dynamic content loader
│   │   └── data.json                # Synced content (gitignored)
│   └── instagram/
│       ├── index.html               # Instagram campaign page
│       ├── styles.css               # IG gradient branding
│       ├── script.js                # Dynamic content loader
│       └── data.json                # Synced content (gitignored)
└── public/
    └── api/
        └── landing-receiver.js      # NEW: Sync receiver endpoint
```

## Content Type Schema

**Business Landing Page** content type with fields:
- `hero_headline` (text, required) - Main headline
- `hero_subheadline` (text, required) - Supporting text
- `cta_text` (text, required) - Call-to-action button text
- `cta_url` (text, required) - CTA destination URL
- `offer_title` (text) - Current promotion title
- `offer_description` (text) - Promotion details
- `offer_expires` (date) - Expiration date
- `location_address` (text) - Store address
- `location_city` (text) - City
- `location_hours` (text) - Operating hours
- `phone` (text) - Contact phone
- `testimonial_text` (text) - Customer quote
- `testimonial_author` (text) - Customer name

## Demo Content Items

1. **"Spring Sale 2024"** (published)
   - Hero: "Spring Into Savings - Up to 40% Off"
   - Offer: "Limited time spring sale"
   - CTA: "Shop Now"

2. **"New Customer Welcome"** (published)
   - Hero: "Welcome! Get 20% Off Your First Purchase"
   - Offer: "First-time customer exclusive"
   - CTA: "Claim Offer"

3. **"Premium Services"** (published)
   - Hero: "Premium Installation & Support"
   - Offer: "Professional service packages"
   - CTA: "Learn More"

4. **"Holiday Preview"** (draft)
   - Not synced - demonstrates draft filtering

## Campaign Mappings

**Facebook Campaign:**
- Spring Sale (full)
- New Customer (override: CTA → "Sign Up Free")
- Premium Services (block)

**Google Campaign:**
- Spring Sale (override: CTA → "Get Quote")
- New Customer (full)
- Premium Services (full)

**Instagram Campaign:**
- Spring Sale (override: CTA → "Shop Now", add UTM)
- Premium Services (override: offer_title)
- New Customer (block)

## Landing Page Sections

Each landing page includes:
1. **Hero Section** - Headline, subheadline, CTA button
2. **Current Offer** - Promotional banner with expiration
3. **Location Info** - Address, hours, phone
4. **Testimonial** - Customer review
5. **Sync Status Badge** - Shows last update time and campaign source

## Technical Implementation

### 1. Landing Page Receiver Endpoint
```javascript
// public/api/landing-receiver.js
// Accepts POST with:
// - payload: content data
// - signature: HMAC for validation
// - campaign: facebook|google|instagram
// Validates signature, writes to data.json
```

### 2. Landing Page Dynamic Loader
```javascript
// landing-pages/{campaign}/script.js
// On page load:
// - Fetch data.json
// - Populate DOM elements
// - Show sync timestamp
// - Handle missing data gracefully
```

### 3. Sync Engine Updates
```javascript
// src/lib/syncEngine.ts
// For each site:
// - Build payload from content items
// - Apply overrides
// - Generate HMAC signature
// - POST to landing page receiver
// - Log results
```

### 4. Vite Configuration
```javascript
// vite.config.ts
// Serve landing-pages as static assets
// Configure API proxy for receiver endpoint
```

## Platform Branding

**Facebook:**
- Primary color: #1877F2 (Facebook blue)
- Accent: #4267B2
- Font: System sans-serif

**Google:**
- Primary colors: #4285F4, #EA4335, #FBBC04, #34A853
- Clean, modern aesthetic
- Font: Roboto

**Instagram:**
- Gradient: #833AB4 → #FD1D1D → #FCAF45
- Bold, visual design
- Font: System sans-serif

## UTM Tracking Parameters

CTAs include campaign-specific tracking:
- Facebook: `?utm_source=facebook&utm_medium=cpc&utm_campaign=spring_sale`
- Google: `?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale`
- Instagram: `?utm_source=instagram&utm_medium=cpc&utm_campaign=spring_sale`

## Demo Flow

1. Open DataSync admin dashboard
2. Navigate to Content → See 4 business landing page items
3. Navigate to Mappings → See matrix of which content goes to which campaign
4. Click "Run Sync" → Watch live logs
5. Navigate to Sites → Click "View Landing Page" for each campaign
6. Compare pages → Same base content, different CTAs and styling

## Success Criteria

✅ Three actual landing pages accessible at:
   - `/landing-pages/facebook/`
   - `/landing-pages/google/`
   - `/landing-pages/instagram/`

✅ Sync updates all three pages with different content based on mappings

✅ Landing pages show sync timestamp and campaign source

✅ Platform-specific branding clearly visible

✅ Clean, professional design suitable for portfolio

✅ Complete documentation in README

## Next Steps

Ready to switch to Code mode for implementation!
