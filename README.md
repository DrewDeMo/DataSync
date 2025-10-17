# DataSync

A multi-tenant content synchronization system built with React, TypeScript, Vite, and Supabase.

## Features

- 🏢 Multi-tenant organization support
- 👥 User authentication and role-based access control
- 📝 Flexible content type definitions with JSON schemas
- 🔄 Content lifecycle management (draft/published/archived)
- 🌐 Multiple publishing destinations (sites)
- 🔗 Content-to-site mappings with override capabilities
- 📊 Sync job tracking with live logging
- 🔒 Row-level security for data isolation

## Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/DrewDeMo/DataSync.git
   cd DataSync
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```bash
   cp .env.example .env
   ```
   
   Update the following values in `.env`:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `SUPABASE_ACCESS_TOKEN`: Your Supabase personal access token (for CLI)

4. **Run database migrations**
   
   The migrations have already been applied, but if you need to run them again:
   ```bash
   npx supabase db push --db-url "your-database-url"
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

## GitHub Secrets Setup

To securely store your environment variables in GitHub (for CI/CD or GitHub Actions):

1. Go to your repository on GitHub: https://github.com/DrewDeMo/DataSync
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add each of the following:

   - **Name**: `VITE_SUPABASE_URL`  
     **Value**: `https://flvmrlahfxnuxtclkdrn.supabase.co`

   - **Name**: `VITE_SUPABASE_ANON_KEY`  
     **Value**: Your Supabase anonymous key

   - **Name**: `DATABASE_URL`  
     **Value**: Your PostgreSQL connection string

   - **Name**: `SUPABASE_ACCESS_TOKEN`  
     **Value**: Your Supabase personal access token

## Database Schema

The application uses the following main tables:

- **organizations**: Tenant boundaries for multi-tenant isolation
- **profiles**: User accounts linked to organizations
- **content_types**: Schema definitions for content
- **content_items**: Actual content instances
- **sites**: Publishing destinations with credentials
- **site_item_mappings**: Content-to-site relationships
- **sync_jobs**: Job execution tracking
- **job_logs**: Detailed sync operation logs
- **destination_snapshots**: Latest payload per site

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Auth + Realtime)
- **Icons**: Lucide React

## Security

- All sensitive credentials are stored in `.env` (excluded from git)
- Row-level security (RLS) enabled on all database tables
- Organization-based data isolation
- Secure authentication via Supabase Auth

## License

MIT
