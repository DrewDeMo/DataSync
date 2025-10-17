const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY
);

async function checkTables() {
    console.log('🔍 Checking if database tables exist...\n');

    const tables = [
        'organizations',
        'profiles',
        'content_types',
        'content_items',
        'sites',
        'site_item_mappings',
        'sync_jobs',
        'job_logs',
        'destination_snapshots'
    ];

    for (const table of tables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('count')
                .limit(1);

            if (error) {
                console.log(`❌ ${table}: NOT FOUND (${error.message})`);
            } else {
                console.log(`✅ ${table}: EXISTS`);
            }
        } catch (err) {
            console.log(`❌ ${table}: ERROR (${err.message})`);
        }
    }

    console.log('\n📋 Summary:');
    console.log('If you see "NOT FOUND" errors, the migration hasn\'t been run yet.');
    console.log('\n💡 To fix: Run the SQL in Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/flvmrlahfxnuxtclkdrn/sql');
}

checkTables();
