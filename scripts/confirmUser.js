/**
 * Admin Script: Manually Confirm User Email
 * 
 * Use this to confirm users without clicking email links
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function confirmUserByEmail(email) {
  try {
    console.log(`\n🔍 Looking for user with email: ${email}\n`);
    
    // Get user by email using admin API
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();
    
    if (listError) {
      console.error('❌ Error listing users:', listError.message);
      return;
    }
    
    const user = users.users.find(u => u.email === email);
    
    if (!user) {
      console.log('❌ User not found with email:', email);
      console.log('\n💡 Available users:');
      users.users.forEach(u => console.log(`   - ${u.email} (${u.id})`));
      return;
    }
    
    console.log(`✅ Found user: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`);
    
    if (user.email_confirmed_at) {
      console.log('\n✅ User is already confirmed!');
      console.log('   You can login now at: https://spend-shadow.preview.emergentagent.com\n');
      return;
    }
    
    // Confirm the user
    const { data, error } = await supabase.auth.admin.updateUserById(
      user.id,
      { 
        email_confirmed_at: new Date().toISOString()
      }
    );
    
    if (error) {
      console.error('❌ Error confirming user:', error.message);
      return;
    }
    
    console.log('\n✅ SUCCESS! User email confirmed!');
    console.log('\n🎉 You can now login with:');
    console.log(`   Email: ${email}`);
    console.log(`   URL: https://spend-shadow.preview.emergentagent.com\n`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.log('\n❌ Please provide an email address!');
  console.log('\nUsage:');
  console.log('  node scripts/confirmUser.js your@email.com\n');
  process.exit(1);
}

confirmUserByEmail(email);
