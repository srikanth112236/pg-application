const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000';

async function comprehensivePGFix() {
  console.log('🔧 Comprehensive PG Fix...\n');

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
      pgId: user.pgId || 'UNDEFINED',
      onboarding: user.onboarding
    });

    if (!user.pgId) {
      console.log('\n❌ User has no PG ID - checking onboarding status...');
      
      // Step 2: Check onboarding status
      console.log('\n2️⃣ Checking onboarding status...');
      const onboardingResponse = await fetch(`${BASE_URL}/api/onboarding/status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (onboardingResponse.ok) {
        const onboardingData = await onboardingResponse.json();
        console.log('📊 Onboarding status:', onboardingData.data);
        
        if (!onboardingData.data.isCompleted) {
          console.log('\n🔄 User needs to complete onboarding first');
          console.log('📝 Current step:', onboardingData.data.currentStep);
          
          // Step 3: Complete PG configuration if needed
          if (onboardingData.data.currentStep === 'pg_configuration') {
            console.log('\n3️⃣ Completing PG configuration...');
            const pgConfigResponse = await fetch(`${BASE_URL}/api/onboarding/configure-pg`, {
              method: 'POST',
              headers: { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                name: 'Test PG Three',
                description: 'A test PG for development',
                address: '123 Test Street, Test City',
                phone: '9876543210',
                email: 'testpgthree@gmail.com'
              })
            });

            if (pgConfigResponse.ok) {
              console.log('✅ PG configuration completed');
              
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
                  
                  // Step 5: Test QR generation
                  console.log('\n5️⃣ Testing QR code generation...');
                  const qrResponse = await fetch(`${BASE_URL}/api/qr/generate/${newUser.pgId}`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${newLoginData.data.tokens.accessToken}` }
                  });
                  
                  if (qrResponse.ok) {
                    const qrData = await qrResponse.json();
                    console.log('✅ QR code generated successfully!');
                    console.log(`📱 QR Code: ${qrData.data.qrCode}`);
                    console.log(`🔗 Public URL: ${qrData.data.fullUrl}`);
                  } else {
                    const errorData = await qrResponse.json();
                    console.log('❌ QR generation failed:', errorData.message);
                  }
                } else {
                  console.log('\n❌ Still no PG ID after onboarding');
                }
              }
            } else {
              console.log('❌ Failed to complete PG configuration');
            }
          } else {
            console.log('❌ User needs to complete other onboarding steps first');
            console.log('🔧 Manual intervention required');
          }
        } else {
          console.log('✅ Onboarding completed but no PG ID - checking PGs...');
          
          // Check if PGs exist
          const pgsResponse = await fetch(`${BASE_URL}/api/pg`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (pgsResponse.ok) {
            const pgsData = await pgsResponse.json();
            console.log(`📊 Found ${pgsData.data?.pgs?.length || 0} PGs`);
            
            if (pgsData.data?.pgs && pgsData.data.pgs.length > 0) {
              const pg = pgsData.data.pgs[0];
              console.log(`🏢 Using PG: ${pg.name} (${pg._id})`);
              
              // Update user with PG ID
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
                
                // Test login again
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
                  }
                }
              }
            } else {
              console.log('❌ No PGs found - user needs to complete PG onboarding');
            }
          }
        }
      } else {
        console.log('❌ Failed to get onboarding status');
      }
    } else {
      console.log('\n✅ User already has PG ID - testing QR generation...');
      
      // Test QR generation
      const qrResponse = await fetch(`${BASE_URL}/api/qr/generate/${user.pgId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (qrResponse.ok) {
        const qrData = await qrResponse.json();
        console.log('✅ QR code generated successfully!');
        console.log(`📱 QR Code: ${qrData.data.qrCode}`);
        console.log(`🔗 Public URL: ${qrData.data.fullUrl}`);
      } else {
        const errorData = await qrResponse.json();
        console.log('❌ QR generation failed:', errorData.message);
      }
    }

    console.log('\n🎉 Comprehensive PG Fix Complete!');

  } catch (error) {
    console.error('❌ Fix failed:', error.message);
  }
}

comprehensivePGFix(); 