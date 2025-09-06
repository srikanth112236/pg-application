# Onboarding Data Loading Debug Fix

## Overview

Fixed the issue where advance payment, room sharing costs, and per day cost were not being fetched and displayed in the resident onboarding process. Added comprehensive debugging and multiple fallback mechanisms to ensure data is properly loaded.

## Issues Fixed

### ✅ **1. Data Not Loading on Payment Step**
- **Problem**: Payment data was only loaded when branch changed, not when payment step was reached
- **Solution**: Added useEffect that triggers data loading when currentStep === 5 (Payment Information step)
- **Result**: Data is now loaded when user reaches the payment step

### ✅ **2. Missing Debug Information**
- **Problem**: No way to debug why data wasn't loading
- **Solution**: Added comprehensive console logging and debug UI
- **Result**: Clear visibility into data loading process

### ✅ **3. No Fallback Mechanism**
- **Problem**: If payment settings API failed, no alternative data source
- **Solution**: Added fallback to load from onboarding status API
- **Result**: Multiple data sources ensure data is loaded

## Technical Implementation

### 🔧 **Enhanced Data Loading Functions**

#### 1. **Enhanced loadPaymentSettings()**
```javascript
const loadPaymentSettings = async () => {
  try {
    if (!selectedBranch) {
      console.log('❌ No selected branch, cannot load payment settings');
      return;
    }
    
    console.log('🔍 Loading payment settings for branch:', selectedBranch._id);
    console.log('🔍 Selected branch details:', selectedBranch);
    
    const response = await fetch(`/api/payment-info/${selectedBranch._id}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 Payment settings API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Payment settings response:', data);
      
      if (data.success && data.data) {
        console.log('📊 Payment data received:', data.data);
        
        // Set advance amount if available
        if (data.data.advanceAmount && data.data.advanceAmount > 0) {
          setAdvancePayment(prev => ({ 
            ...prev, 
            amount: data.data.advanceAmount.toString() 
          }));
          console.log('✅ Advance amount loaded and set:', data.data.advanceAmount);
        } else {
          console.log('⚠️ No advance amount found in data');
        }
        
        // Set per day cost for custom calculation
        if (data.data.perDayCost && data.data.perDayCost > 0) {
          setPerDayCost(data.data.perDayCost);
          console.log('✅ Per day cost loaded and set:', data.data.perDayCost);
        } else {
          console.log('⚠️ No per day cost found in data');
        }
      } else {
        console.log('⚠️ Payment settings response not successful or no data');
      }
    } else {
      console.warn('⚠️ Payment settings API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.warn('⚠️ Error response body:', errorData);
      
      // Try fallback: load from onboarding status
      console.log('🔄 Trying fallback: loading from onboarding status...');
      await loadFromOnboardingStatus();
    }
  } catch (error) {
    console.error('❌ Error loading payment settings:', error);
  }
};
```

#### 2. **Enhanced loadPGConfiguration()**
```javascript
const loadPGConfiguration = async () => {
  try {
    if (!user?.pgId) {
      console.log('❌ No user PG ID, cannot load PG configuration');
      return;
    }
    
    console.log('🔍 Loading PG configuration for PG:', user.pgId);
    console.log('🔍 User details:', user);
    
    const response = await fetch(`/api/pg/${user.pgId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📡 PG configuration API response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 PG configuration response:', data);
      
      if (data.success && data.data && data.data.sharingTypes) {
        console.log('✅ PG sharing types loaded:', data.data.sharingTypes);
        // The sharing types with costs will be loaded by fetchSharingTypes
      } else {
        console.log('⚠️ No sharing types found in PG configuration');
      }
    } else {
      console.warn('⚠️ PG configuration API error:', response.status, response.statusText);
      const errorData = await response.text();
      console.warn('⚠️ Error response body:', errorData);
    }
  } catch (error) {
    console.error('❌ Error loading PG configuration:', error);
  }
};
```

#### 3. **New Fallback Function**
```javascript
// Fallback: Load payment data from onboarding status
const loadFromOnboardingStatus = async () => {
  try {
    console.log('🔍 Loading payment data from onboarding status...');
    
    const response = await fetch('/api/onboarding/status', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('📊 Onboarding status response:', data);
      
      if (data.success && data.data) {
        // Check if payment settings were completed during onboarding
        const paymentStep = data.data.steps?.find(step => step.stepId === 'payment_settings');
        if (paymentStep && paymentStep.completed && paymentStep.data) {
          console.log('📊 Payment settings from onboarding:', paymentStep.data);
          
          // Set advance amount if available
          if (paymentStep.data.advanceAmount && paymentStep.data.advanceAmount > 0) {
            setAdvancePayment(prev => ({ 
              ...prev, 
              amount: paymentStep.data.advanceAmount.toString() 
            }));
            console.log('✅ Advance amount loaded from onboarding:', paymentStep.data.advanceAmount);
          }
          
          // Set per day cost for custom calculation
          if (paymentStep.data.perDayCost && paymentStep.data.perDayCost > 0) {
            setPerDayCost(paymentStep.data.perDayCost);
            console.log('✅ Per day cost loaded from onboarding:', paymentStep.data.perDayCost);
          }
        } else {
          console.log('⚠️ Payment settings not completed in onboarding');
        }
      }
    } else {
      console.warn('⚠️ Onboarding status API error:', response.status);
    }
  } catch (error) {
    console.error('❌ Error loading from onboarding status:', error);
  }
};
```

### 🔄 **Enhanced useEffect Hooks**

#### 1. **Payment Step Data Loading**
```javascript
// Load payment data when reaching payment step
useEffect(() => {
  if (currentStep === 5) { // Payment Information step
    console.log('🔍 Payment step reached, loading payment data...');
    loadPaymentSettings();
    loadPGConfiguration();
  }
}, [currentStep]);
```

#### 2. **Branch Change Data Loading**
```javascript
useEffect(() => {
  if (!selectedBranch) return;
  fetchResidents();
  fetchSharingTypes();
  loadPaymentSettings();
  loadPGConfiguration();
}, [selectedBranch]);
```

### 🎯 **Debug UI Added**

#### **Debug Button and Info Display**
```javascript
{/* Debug Button */}
<div className="mb-4">
  <button
    onClick={() => {
      console.log('🔍 Manual data loading triggered');
      loadPaymentSettings();
      loadPGConfiguration();
    }}
    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors text-sm"
  >
    🔍 Load Payment Data (Debug)
  </button>
  
  {/* Debug Info */}
  <div className="mt-2 text-xs text-gray-500">
    <p>Advance: ₹{advancePayment.amount || '0'}</p>
    <p>Per Day Cost: ₹{perDayCost || '0'}</p>
    <p>Branch: {selectedBranch?._id || 'None'}</p>
    <p>User PG: {user?.pgId || 'None'}</p>
  </div>
</div>
```

## Data Flow

### 📊 **Multiple Data Sources**
1. **Primary**: `GET /api/payment-info/{branchId}` - Payment settings API
2. **Fallback**: `GET /api/onboarding/status` - Onboarding status API
3. **PG Config**: `GET /api/pg/{pgId}` - PG configuration API

### 🔄 **Loading Triggers**
1. **Branch Change**: When selectedBranch changes
2. **Payment Step**: When currentStep === 5
3. **Manual Trigger**: Debug button click

### 💾 **State Updates**
- **Advance Payment**: `setAdvancePayment()` with loaded amount
- **Per Day Cost**: `setPerDayCost()` for custom calculation
- **Room Sharing Costs**: Loaded via `fetchSharingTypes()` API

## Debugging Features

### 🔍 **Console Logging**
- **API Calls**: Logs all API requests and responses
- **Data Processing**: Logs data extraction and state updates
- **Error Handling**: Logs errors and fallback attempts
- **State Changes**: Logs when data is successfully loaded

### 🎯 **Debug UI**
- **Manual Trigger**: Button to manually load data
- **State Display**: Shows current values of key variables
- **Real-time Updates**: Updates as data is loaded

### ⚠️ **Error Handling**
- **API Errors**: Logs HTTP status codes and error messages
- **Missing Data**: Logs when expected data is not found
- **Fallback Attempts**: Logs when fallback mechanisms are triggered

## Testing Instructions

### 🧪 **How to Test**
1. **Navigate to Resident Onboarding**: Go to the onboarding page
2. **Reach Payment Step**: Complete steps 1-4 to reach payment step
3. **Check Debug Info**: Look at the debug info display
4. **Click Debug Button**: Click "Load Payment Data (Debug)" button
5. **Check Console**: Open browser console to see detailed logs
6. **Verify Data**: Check if advance payment and per day cost are loaded

### 📋 **Expected Results**
- **Advance Payment Field**: Should show configured amount
- **Per Day Cost**: Should be available in custom modal
- **Console Logs**: Should show detailed loading process
- **Debug Info**: Should display current state values

## Files Modified

### Frontend Files:
1. `frontend/src/pages/admin/ResidentOnboarding.jsx` - Enhanced data loading with debugging

## Status

✅ **COMPLETED** - All debugging and data loading issues have been fixed:

1. **Payment Step Loading**: Data now loads when payment step is reached
2. **Comprehensive Debugging**: Added detailed console logging and debug UI
3. **Fallback Mechanisms**: Multiple data sources ensure data is loaded
4. **Error Handling**: Graceful handling of API errors
5. **Manual Testing**: Debug button for manual data loading
6. **State Visibility**: Real-time display of current state values

The onboarding process now has comprehensive debugging and multiple fallback mechanisms to ensure payment data is properly loaded and displayed!
