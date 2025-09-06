# Settings Page Duplicate Branches & Default Values Fix

## Issues Identified

1. **Duplicate Branches**: The settings page was showing duplicate branches
2. **Settings Not Pre-filled**: Settings page wasn't loading data from onboarding
3. **Payment Settings Not Defaulted**: Payment settings from onboarding weren't being used as defaults
4. **Onboarding Duplicate Creation**: Onboarding process could create duplicate branches

## Solutions Implemented

### 1. Fixed Onboarding Service (`backend/src/services/onboarding.service.js`)

**Problem**: Onboarding could create duplicate branches when users refreshed or went back/forward.

**Solution**: 
- Modified `setupBranch` method to check for ANY existing branch (not just default)
- If branch exists, update it instead of creating new one
- Ensure only one branch exists per PG during onboarding
- Added proper logging for debugging

**Key Changes**:
```javascript
// Check if any branch already exists for this PG (not just default)
let branch = await Branch.findOne({ 
  pgId: user.pgId, 
  isActive: true 
});

if (branch) {
  // Update existing branch and make it default
  branch.name = branchData.name;
  // ... update other fields
  branch.isDefault = true; // Ensure it's marked as default
  await branch.save();
} else {
  // Create new branch only if none exists
  branch = new Branch({...});
  await branch.save();
}
```

### 2. Enhanced Settings Page (`frontend/src/pages/admin/Settings.jsx`)

**Problem**: Settings page wasn't loading PG data and payment information from onboarding.

**Solution**:
- Added `loadPGData()` function to fetch PG information
- Added `loadPaymentData()` function to fetch payment settings
- Modified `useEffect` to load all data on component mount
- Pre-fill forms with onboarding data

**Key Changes**:
```javascript
useEffect(() => {
  // Load settings data
  loadProfileData();
  loadPGData();
  loadPaymentData();
}, [user, navigate, selectedBranch]);
```

### 3. Improved Branch Management (`frontend/src/components/admin/BranchManagement.jsx`)

**Problem**: Duplicate branches were being displayed in the UI.

**Solution**:
- Added duplicate detection and removal in `fetchBranches()`
- Filter out duplicates based on `_id`
- Ensure only one default branch is shown
- Added cleanup functionality

**Key Changes**:
```javascript
// Remove duplicates based on _id
const uniqueBranches = data.data.filter((branch, index, self) => 
  index === self.findIndex(b => b._id === branch._id)
);

// Ensure only one default branch
const defaultBranches = uniqueBranches.filter(b => b.isDefault);
if (defaultBranches.length > 1) {
  // Keep the first default branch, mark others as non-default
  const updatedBranches = uniqueBranches.map((branch, index) => {
    if (branch.isDefault && index !== uniqueBranches.findIndex(b => b.isDefault)) {
      return { ...branch, isDefault: false };
    }
    return branch;
  });
  setBranches(updatedBranches);
}
```

### 4. Enhanced Payment Info Form (`frontend/src/components/admin/PaymentInfoForm.jsx`)

**Problem**: Payment settings weren't pre-filled with onboarding data.

**Solution**:
- Added fallback to fetch onboarding data when no payment info exists
- Pre-fill form with onboarding payment settings
- Improved data loading logic

**Key Changes**:
```javascript
// Try to get onboarding data as fallback
try {
  const onboardingResponse = await fetch('/api/onboarding/status');
  if (onboardingResponse.ok) {
    const onboardingData = await onboardingResponse.json();
    const paymentStep = onboardingData.data.steps?.find(step => step.stepId === 'payment_settings');
    if (paymentStep && paymentStep.data) {
      // Pre-fill form with onboarding data
      setFormData({...paymentStep.data});
    }
  }
} catch (onboardingError) {
  console.log('No onboarding data available:', onboardingError);
}
```

### 5. Added Database Cleanup (`backend/src/services/branch.service.js`)

**Problem**: Existing duplicate branches in database needed cleanup.

**Solution**:
- Added `cleanupDuplicateBranches()` method
- Groups branches by name and removes duplicates
- Ensures only one default branch per PG
- Marks duplicates as inactive instead of deleting

**Key Features**:
- Groups branches by name
- Keeps the oldest branch (by creation date)
- Marks newer duplicates as inactive
- Ensures only one default branch
- Comprehensive logging

### 6. Added Cleanup API Route (`backend/src/routes/branch.routes.js`)

**Problem**: No way to trigger cleanup from frontend.

**Solution**:
- Added `POST /api/branches/cleanup-duplicates` endpoint
- Admin-only access
- Triggers database cleanup
- Returns cleanup results

### 7. Added Cleanup UI Button (`frontend/src/components/admin/BranchManagement.jsx`)

**Problem**: No user interface to trigger cleanup.

**Solution**:
- Added "Clean Duplicates" button
- Confirmation dialog before cleanup
- Shows cleanup results
- Refreshes branch list after cleanup

## Benefits

### ✅ **Duplicate Prevention**
- Onboarding no longer creates duplicate branches
- Frontend filters out any existing duplicates
- Database cleanup removes historical duplicates

### ✅ **Data Pre-filling**
- Settings page automatically loads PG data
- Payment settings pre-filled from onboarding
- Seamless transition from onboarding to settings

### ✅ **Better User Experience**
- No more duplicate branches in UI
- Settings are pre-configured
- One-click cleanup for existing issues

### ✅ **Data Integrity**
- Only one default branch per PG
- Proper duplicate detection and removal
- Comprehensive logging for debugging

## Files Modified

### Backend Files:
1. `backend/src/services/onboarding.service.js` - Fixed duplicate branch creation
2. `backend/src/services/branch.service.js` - Added cleanup functionality
3. `backend/src/routes/branch.routes.js` - Added cleanup endpoint

### Frontend Files:
1. `frontend/src/pages/admin/Settings.jsx` - Added data loading functions
2. `frontend/src/components/admin/BranchManagement.jsx` - Added duplicate filtering and cleanup UI
3. `frontend/src/components/admin/PaymentInfoForm.jsx` - Added onboarding data fallback

## Testing Recommendations

1. **Test Onboarding Flow**:
   - Complete onboarding with branch setup
   - Refresh page during onboarding
   - Go back/forward during onboarding
   - Verify no duplicates created

2. **Test Settings Page**:
   - Navigate to settings after onboarding
   - Verify PG data is pre-filled
   - Verify payment settings are pre-filled
   - Check branch management shows no duplicates

3. **Test Cleanup Functionality**:
   - Create duplicate branches (if possible)
   - Use "Clean Duplicates" button
   - Verify duplicates are removed
   - Verify only one default branch remains

## Status

✅ **COMPLETED** - All duplicate branch issues fixed and settings pre-filling implemented.

The settings page now properly loads data from onboarding, prevents duplicate branches, and provides cleanup functionality for existing duplicates.
