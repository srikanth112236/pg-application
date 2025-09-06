const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function fixUserPG() {
  console.log('🔧 Fixing User PG Association...\n');

  try {
    // Step 1: Login
    console.log('1️⃣ Logging in...');
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
    console.log('👤 User data:', {
      id: user._id,
      email: user.email,
      role: user.role,
      pgId: user.pgId || 'UNDEFINED'
    });

    if (!user.pgId) {
      console.log('\n❌ User has no PG ID - fixing...');
      
      // Step 2: Get PGs
      console.log('\n2️⃣ Getting PGs...');
      const pgsResponse = await fetch(`${BASE_URL}/api/pg`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (pgsResponse.ok) {
        const pgsData = await pgsResponse.json();
        console.log(`✅ Found ${pgsData.data?.pgs?.length || 0} PGs`);
        
        if (pgsData.data?.pgs && pgsData.data.pgs.length > 0) {
          const pg = pgsData.data.pgs[0];
          console.log(`🏢 Using PG: ${pg.name} (${pg._id})`);
          
          // Step 3: Update user with PG ID
          console.log('\n3️⃣ Updating user with PG ID...');
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
            console.log('✅ User updated successfully');
            
            // Step 4: Test login again
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
              console.log('👤 Updated user data:', {
                pgId: newUser.pgId || 'UNDEFINED',
                pgName: newUser.pgName || 'UNDEFINED'
              });
              
              if (newUser.pgId) {
                console.log('\n🎉 SUCCESS: User now has PG ID!');
                console.log('✅ QR code generation should now work');
              } else {
                console.log('\n❌ Still no PG ID after update');
              }
            }
          } else {
            console.log('❌ Failed to update user');
          }
        } else {
          console.log('❌ No PGs found - user needs to complete PG onboarding');
        }
      } else {
        console.log('❌ Failed to get PGs');
      }
    } else {
      console.log('\n✅ User already has PG ID - no fix needed');
    }

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

fixUserPG(); 