const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function fixUserPGAssociation() {
  console.log('🔧 Fixing User PG Association...\n');

  try {
    // Step 1: Login as admin
    console.log('1️⃣ Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'testpgthree@gmail.com',
        password: 'password123'
      })
    });

    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${loginResponse.status}`);
    }

    const loginData = await loginResponse.json();
    const token = loginData.data.token;
    const user = loginData.data.user;
    
    console.log('✅ Login successful');
    console.log('👤 Current User Data:');
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Role: ${user.role}`);
    console.log(`   PG ID: ${user.pgId || 'UNDEFINED'}`);
    console.log(`   PG Name: ${user.pgName || 'UNDEFINED'}`);

    if (!user.pgId) {
      console.log('\n❌ ISSUE: User has no PG ID!');
      console.log('🔧 Attempting to find and associate PG...');
      
      // Step 2: Get all PGs to find the one for this user
      console.log('\n2️⃣ Getting all PGs...');
      const pgsResponse = await fetch(`${BASE_URL}/api/pg`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (pgsResponse.ok) {
        const pgsData = await pgsResponse.json();
        console.log(`✅ Found ${pgsData.data?.pgs?.length || 0} PGs`);
        
        if (pgsData.data?.pgs && pgsData.data.pgs.length > 0) {
          const pg = pgsData.data.pgs[0]; // Use the first PG
          console.log(`🏢 Using PG: ${pg.name} (${pg._id})`);
          
          // Step 3: Update user with PG association
          console.log('\n3️⃣ Updating user with PG association...');
          const updateResponse = await fetch(`${BASE_URL}/api/auth/profile`, {
            method: 'PUT',
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              pgId: pg._id
            })
          });

          if (updateResponse.ok) {
            console.log('✅ User updated with PG association');
            
            // Step 4: Test login again to verify
            console.log('\n4️⃣ Testing login again...');
            const newLoginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: 'testpgthree@gmail.com',
                password: 'password123'
              })
            });

            if (newLoginResponse.ok) {
              const newLoginData = await newLoginResponse.json();
              const newUser = newLoginData.data.user;
              
              console.log('✅ New login successful');
              console.log('👤 Updated User Data:');
              console.log(`   PG ID: ${newUser.pgId || 'UNDEFINED'}`);
              console.log(`   PG Name: ${newUser.pgName || 'UNDEFINED'}`);
              
              if (newUser.pgId) {
                console.log('\n🎉 SUCCESS: User now has PG ID!');
                console.log('✅ QR code generation should now work');
              } else {
                console.log('\n❌ Still no PG ID after update');
              }
            }
          } else {
            console.log('❌ Failed to update user with PG association');
          }
        } else {
          console.log('❌ No PGs found. User needs to complete PG onboarding first.');
        }
      } else {
        console.log('❌ Failed to get PGs');
      }
    } else {
      console.log('\n✅ User already has PG ID - no fix needed');
    }

    console.log('\n🎉 User PG Association Fix Complete!');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixUserPGAssociation(); 