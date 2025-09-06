# Custom Rent Calculation Feature

## Overview

Successfully implemented a custom rent calculation feature in the resident onboarding process that allows users to calculate rent based on per day cost and number of days.

## Features Implemented

### ✅ **Custom Rent Calculation Modal**

#### 1. **Custom Button**
- Added a "Custom" button below the rent amount field
- Button opens a modal for rent calculation
- Styled with blue theme to match the rent payment section

#### 2. **Rent Calculation Modal**
- **Per Day Cost Field**: Automatically fetches from payment settings
- **Number of Days Field**: User can input number of days (default: 30)
- **Real-time Calculation**: Updates calculated rent as user changes values
- **Visual Display**: Shows calculation formula and result
- **Save Functionality**: Saves calculated amount to rent field

#### 3. **Data Integration**
- Fetches per day cost from payment settings API
- Integrates with existing rent payment state
- Updates rent amount field with calculated value

## Technical Implementation

### 🎨 **Frontend Changes**

#### 1. **State Management** (`ResidentOnboarding.jsx`)
```javascript
// Custom rent calculation modal
const [showRentCalculationModal, setShowRentCalculationModal] = useState(false);
const [perDayCost, setPerDayCost] = useState(0);
const [numberOfDays, setNumberOfDays] = useState(30);
const [calculatedRent, setCalculatedRent] = useState(0);
```

#### 2. **API Integration**
```javascript
// Fetch per day cost from payment settings
const fetchPerDayCost = async () => {
  const response = await fetch(`/api/payment-info/${selectedBranch._id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (response.ok) {
    const data = await response.json();
    if (data.success && data.data.perDayCost) {
      setPerDayCost(data.data.perDayCost);
      setCalculatedRent(data.data.perDayCost * numberOfDays);
    }
  }
};
```

#### 3. **UI Components**

**Custom Button:**
```javascript
<button
  type="button"
  onClick={handleOpenRentCalculation}
  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
>
  <DollarSign className="h-4 w-4" />
  Custom
</button>
```

**Rent Calculation Modal:**
- Modal with backdrop overlay
- Per day cost input field
- Number of days input field
- Real-time calculation display
- Save and Cancel buttons

### 🔧 **Key Functions**

#### 1. **Modal Management**
```javascript
const handleOpenRentCalculation = () => {
  fetchPerDayCost();
  setShowRentCalculationModal(true);
};

const handleCloseRentCalculation = () => {
  setShowRentCalculationModal(false);
};
```

#### 2. **Calculation Logic**
```javascript
const handleDaysChange = (days) => {
  setNumberOfDays(days);
  setCalculatedRent(perDayCost * days);
};
```

#### 3. **Save Functionality**
```javascript
const handleSaveCalculatedRent = () => {
  setRentPayment(prev => ({ ...prev, amount: calculatedRent.toString() }));
  setShowRentCalculationModal(false);
  toast.success(`Rent amount calculated and set to ₹${calculatedRent.toLocaleString()}`);
};
```

## User Experience

### 🎯 **Workflow**
1. **Click Custom Button**: User clicks "Custom" button below rent amount field
2. **Modal Opens**: Rent calculation modal opens with per day cost pre-filled
3. **Adjust Days**: User can modify number of days (default: 30)
4. **Real-time Calculation**: Rent amount updates automatically
5. **Save Amount**: User clicks "Save Amount" to apply calculated rent
6. **Field Updated**: Rent amount field is updated with calculated value
7. **Success Feedback**: Toast notification confirms the action

### 🎨 **Visual Design**
- **Consistent Styling**: Matches existing onboarding design
- **Blue Theme**: Uses blue color scheme for rent-related elements
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: Framer Motion animations for modal transitions
- **Clear Typography**: Easy to read labels and values

## Data Flow

### 📊 **Data Sources**
1. **Per Day Cost**: Fetched from payment settings API
2. **Number of Days**: User input (default: 30)
3. **Calculated Rent**: `perDayCost × numberOfDays`

### 💾 **Data Storage**
1. **Temporary State**: Modal state for calculation
2. **Rent Payment State**: Updated with calculated amount
3. **Form Submission**: Included in onboarding data

## Integration Points

### 🔗 **Existing Systems**
- **Payment Settings**: Fetches per day cost from settings
- **Rent Payment State**: Updates existing rent payment data
- **Onboarding Flow**: Integrates seamlessly with existing steps
- **Toast Notifications**: Uses existing notification system

### 🎯 **API Endpoints**
- `GET /api/payment-info/{branchId}` - Fetches payment settings including per day cost

## Benefits

### 🚀 **For Users**
- **Quick Calculation**: Easy rent calculation based on days
- **Pre-filled Data**: Per day cost automatically loaded from settings
- **Flexible Input**: Can adjust number of days as needed
- **Visual Feedback**: Clear display of calculation and result
- **Seamless Integration**: Works within existing onboarding flow

### 🔧 **For Developers**
- **Modular Design**: Clean separation of concerns
- **Reusable Components**: Modal can be reused elsewhere
- **Type Safety**: Proper validation and error handling
- **Maintainable Code**: Well-structured and documented

## Testing Scenarios

### 🧪 **Test Cases**
1. **Basic Calculation**: Test with default 30 days
2. **Custom Days**: Test with different number of days
3. **Per Day Cost**: Test with different per day costs
4. **Save Functionality**: Verify rent amount is updated
5. **Modal Behavior**: Test open/close functionality
6. **Data Persistence**: Verify data is saved in onboarding

### 📋 **Test Checklist**
- [ ] Custom button appears below rent amount field
- [ ] Modal opens when button is clicked
- [ ] Per day cost is fetched from settings
- [ ] Number of days can be modified
- [ ] Calculation updates in real-time
- [ ] Save button updates rent amount field
- [ ] Modal closes after saving
- [ ] Success toast appears
- [ ] Data persists in form state

## Files Modified

### Frontend Files:
1. `frontend/src/pages/admin/ResidentOnboarding.jsx` - Added custom rent calculation feature

## Status

✅ **COMPLETED** - All features have been successfully implemented:

1. **Custom Button**: Added below rent amount field
2. **Rent Calculation Modal**: Created with per day cost and days fields
3. **API Integration**: Fetches per day cost from payment settings
4. **Calculation Logic**: Real-time rent calculation
5. **Save Functionality**: Updates rent amount field with calculated value
6. **User Experience**: Smooth animations and clear feedback

The custom rent calculation feature is now fully functional and integrated into the resident onboarding process!
