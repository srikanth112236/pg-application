console.log('🔧 Payment Index Fix Script');
console.log('This script will fix the duplicate key error for paymentId');

console.log('\n📋 To fix this issue manually:');
console.log('1. Connect to MongoDB');
console.log('2. Run: db.payments.dropIndex("paymentId_1")');
console.log('3. Or run: db.payments.dropIndexes() to drop all custom indexes');

console.log('\n🔧 Alternative fix - Update payment model:');
console.log('1. Remove any paymentId field from payment schema');
console.log('2. Ensure no unique index on paymentId');
console.log('3. Restart the backend server');

console.log('\n✅ The error occurs because:');
console.log('- There is a unique index on paymentId field');
console.log('- The paymentId field is null/undefined');
console.log('- MongoDB prevents multiple null values in unique index');

console.log('\n🎯 Solution: Remove the problematic index'); 