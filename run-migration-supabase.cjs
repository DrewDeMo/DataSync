const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read environment variables
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Read the migration SQL
const migrationSQL = fs.readFileSync('./supabase/migrations/20251017150658_create_datasync_core_schema.sql', 'utf8');

console.log('🚀 Running DataSync migration...\n');
console.log(`📊 SQL file: ${migrationSQL.length} characters`);
console.log(`🔗 Supabase URL: ${supabaseUrl}\n`);

async function runMigration() {
    try {
        console.log('⏳ Executing SQL migration...\n');

        // Use the Supabase REST API to execute raw SQL
        const { data, error } = await supabase.rpc('exec_sql', {
            sql: migrationSQL
        });

        if (error) {
            console.error('❌ Migration failed:', error.message);
            console.error('\n💡 The exec_sql function might not exist. Please run the migration manually:');
            console.error('   1. Go to: https://supabase.com/dashboard/project/flvmrlahfxnuxtclkdrn/sql');
            console.error('   2. Click "New Query"');
            console.error('   3. Copy all SQL from: supabase/migrations/20251017150658_create_datasync_core_schema.sql');
            console.error('   4. Paste and click "Run"\n');
            process.exit(1);
        }

        console.log('✅ Migration completed successfully!');
        console.log('\n🎉 Database tables have been created!');
        console.log('\n📝 Next steps:');
        console.log('   1. Run: npm run dev');
        console.log('   2. Sign up at http://localhost:5173');
        console.log('   3. Demo data will auto-seed on signup\n');

    } catch (err) {
        console.error('❌ Unexpected error:', err.message);
        console.error('\n💡 Please run the migration manually in the Supabase Dashboard SQL Editor');
        console.error('   URL: https://supabase.com/dashboard/project/flvmrlahfxnuxtclkdrn/sql\n');
        process.exit(1);
    }
}

runMigration();
