# Payment Settings Duplicate Key Error Fix

## Problem Description

The onboarding payment settings step was failing with a duplicate key error:

```
E11000 duplicate key error collection: pg_maintenance.paymentinfos index: branchId_1_isActive_1 dup key: { branchId: ObjectId('68bb81937bf4a13a7df1e1a6'), isActive: true }
```

## Root Cause

The `PaymentInfo` model has a unique index constraint:
```javascript
paymentInfoSchema.index({ branchId: 1, isActive: 1 }, { 
  unique: true, 
  partialFilterExpression: { isActive: true } 
});
```

This constraint ensures only **one active payment info record per branch**. When users tried to set up payment settings multiple times (e.g., page refresh, going back and forth), the system attempted to create duplicate records, violating this constraint.

## Solution Implemented

### 1. Updated `setupPaymentSettings` Method

**File**: `backend/src/services/onboarding.service.js`

**Changes**:
- Added check for existing payment info before creating new one
- If payment info exists, update it instead of creating new
- If no payment info exists, create new one
- Added proper logging for debugging

**Key Logic**:
```javascript
// Check if payment info already exists for this branch
let paymentInfo = await PaymentInfo.findOne({ 
  branchId: branch._id, 
  isActive: true 
});

if (paymentInfo) {
  // Update existing payment info
  paymentInfo.upiId = paymentData.upiId;
  paymentInfo.upiName = paymentData.upiName || user.firstName + ' ' + user.lastName;
  // ... update other fields
  paymentInfo.updatedBy = userId;
  await paymentInfo.save();
} else {
  // Create new payment info
  paymentInfo = new PaymentInfo({...});
  await paymentInfo.save();
}
```

### 2. Updated `setupBranch` Method

**File**: `backend/src/services/onboarding.service.js`

**Changes**:
- Added similar logic to handle existing default branches
- Prevents duplicate default branch creation
- Updates existing branch if found

**Key Logic**:
```javascript
// Check if a default branch already exists for this PG
let branch = await Branch.findOne({ 
  pgId: user.pgId, 
  isDefault: true, 
  isActive: true 
});

if (branch) {
  // Update existing default branch
  branch.name = branchData.name;
  // ... update other fields
  await branch.save();
} else {
  // Create new branch
  branch = new Branch({...});
  await branch.save();
}
```

## Benefits

1. **Prevents Duplicate Key Errors**: No more E11000 errors when users retry payment settings
2. **Idempotent Operations**: Multiple calls to the same endpoint produce the same result
3. **Better User Experience**: Users can refresh or go back without errors
4. **Data Consistency**: Ensures only one active payment info per branch
5. **Audit Trail**: Proper logging and activity recording

## Testing

Created test file `test-payment-settings-fix.js` to verify:
- First payment settings setup works
- Second payment settings setup updates existing record
- Only one active payment info exists per branch

## Files Modified

1. `backend/src/services/onboarding.service.js`
   - Updated `setupPaymentSettings` method
   - Updated `setupBranch` method

2. `test-payment-settings-fix.js` (new)
   - Test file to verify the fix

## Database Schema

The unique index constraint remains unchanged:
```javascript
// Ensure only one active payment info per branch
paymentInfoSchema.index({ branchId: 1, isActive: 1 }, { 
  unique: true, 
  partialFilterExpression: { isActive: true } 
});
```

This constraint is important for data integrity and should be maintained.

## Status

✅ **FIXED** - Payment settings onboarding step now handles duplicate key errors gracefully by updating existing records instead of creating new ones.
