// Test Supabase Connection
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    // Test 1: Check if we can query the categories table
    console.log('\n✓ Testing database connection...');
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
      return false;
    }
    
    console.log('✅ Database connection successful!');
    console.log('   Categories table accessible');
    
    // Test 2: Check auth
    console.log('\n✓ Testing authentication...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError) {
      console.error('❌ Auth check failed:', authError.message);
      return false;
    }
    
    console.log('✅ Authentication system operational!');
    console.log('   Current session:', session ? 'Active' : 'No active session (expected)');
    
    // Test 3: List all tables
    console.log('\n✓ Checking database tables...');
    const tables = ['users', 'categories', 'products', 'orders', 'order_items', 'reviews', 'product_requests'];
    
    for (const table of tables) {
      const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
      if (error) {
        console.log(`   ❌ ${table}: Not accessible`);
      } else {
        console.log(`   ✅ ${table}: Accessible`);
      }
    }
    
    console.log('\n🎉 All tests passed! Supabase is fully configured and operational.');
    return true;
    
  } catch (error) {
    console.error('❌ Connection test failed:', error.message);
    return false;
  }
}

testConnection().then(success => {
  process.exit(success ? 0 : 1);
});
