const fs = require('fs');
const https = require('https');

// Read the migration SQL file
const migrationSQL = fs.readFileSync('./supabase/migrations/20251017150658_create_datasync_core_schema.sql', 'utf8');

// Supabase connection details from .env
const SUPABASE_URL = 'https://flvmrlahfxnuxtclkdrn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsdm1ybGFoZnhudXh0Y2xrZHJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2OTM0MTksImV4cCI6MjA3NjI2OTQxOX0.0_I5WYuqTO0zV1IJ5cGYibkqnwluBNQIOVFA0UhVZG0';

console.log('🚀 Running migration directly via Supabase REST API...\n');
console.log('📄 Migration file: supabase/migrations/20251017150658_create_datasync_core_schema.sql');
console.log(`📊 SQL length: ${migrationSQL.length} characters\n`);

// Use Supabase REST API to execute SQL
const url = new URL('/rest/v1/rpc/exec_sql', SUPABASE_URL);

const postData = JSON.stringify({
    query: migrationSQL
});

const options = {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'Content-Length': Buffer.byteLength(postData)
    }
};

console.log('⏳ Executing migration...\n');

const req = https.request(url, options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
        data += chunk;
    });

    res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 201) {
            console.log('✅ Migration completed successfully!');
            console.log('\n📋 Response:', data || 'No response body');
            console.log('\n🎉 Database tables have been created!');
            console.log('\n📝 Next steps:');
            console.log('   1. Run: npm run dev');
            console.log('   2. Sign up at http://localhost:5173');
            console.log('   3. Demo data will auto-seed on signup');
        } else {
            console.error(`❌ Migration failed with status ${res.statusCode}`);
            console.error('Response:', data);
            console.log('\n💡 Alternative: Copy the SQL from supabase/migrations/20251017150658_create_datasync_core_schema.sql');
            console.log('   and run it in the Supabase Dashboard SQL Editor:');
            console.log('   https://supabase.com/dashboard/project/flvmrlahfxnuxtclkdrn/sql');
        }
    });
});

req.on('error', (error) => {
    console.error('❌ Error executing migration:', error.message);
    console.log('\n💡 Please run the migration manually:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/flvmrlahfxnuxtclkdrn/sql');
    console.log('   2. Click "New Query"');
    console.log('   3. Copy all SQL from: supabase/migrations/20251017150658_create_datasync_core_schema.sql');
    console.log('   4. Paste and click "Run"');
});

req.write(postData);
req.end();
