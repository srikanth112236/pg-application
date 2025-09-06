# 🔄 Resident Data Synchronization System

## 📋 Overview

This document explains how resident data is synchronized across all components when changes occur, ensuring consistency between:
- **Resident Profile** - Basic information, room assignment, payment status
- **Payment Records** - Advance payments, rent payments, payment history
- **Room Allocation** - Current room, bed, sharing type, cost
- **Allocation Letters** - Official documents reflecting current room status
- **Room Switching History** - Complete audit trail of room changes

## 🏗️ System Architecture

### Data Flow Diagram
```
Onboarding/Assignment → Resident Update → Payment Processing → Allocation Letter Generation
         ↓                      ↓              ↓                    ↓
   Room Assignment      Cost/Type Update   Payment Records    Document Sync
         ↓                      ↓              ↓                    ↓
   Resident Profile     Data Consistency   Financial Status   Legal Documents
```

## 🔑 Key Components

### 1. Resident Model (`backend/src/models/resident.model.js`)

**Core Fields for Synchronization:**
```javascript
{
  // Room Assignment
  roomId: ObjectId,
  roomNumber: String,
  bedNumber: String,
  
  // Cost & Sharing
  sharingType: String, // '1-sharing', '2-sharing', etc.
  cost: Number,        // Monthly rent amount
  
  // Payment Tracking
  advancePayment: {
    amount: Number,
    date: Date,
    receiptNumber: String
  },
  rentPayment: {
    amount: Number,
    date: Date,
    receiptNumber: String
  },
  totalAmountPaid: Number,
  paymentStatus: String, // 'paid', 'pending', 'overdue'
  lastPaymentDate: Date,
  
  // Room Switching History
  switchHistory: [{
    fromRoom: String,
    fromBed: String,
    toRoom: String,
    toBed: String,
    switchDate: Date,
    reason: String,
    performedBy: ObjectId
  }]
}
```

### 2. Resident Service (`backend/src/services/resident.service.js`)

**Key Methods for Data Sync:**

#### A. `assignResidentToRoom()` - Initial Room Assignment
```javascript
// Updates resident with room details
const updateData = {
  roomId: room._id,
  roomNumber: room.roomNumber,
  bedNumber: onboardingData.bedNumber,
  sharingType: room.sharingType,    // ✅ Syncs sharing type
  cost: room.cost,                  // ✅ Syncs monthly cost
  checkInDate: onboardingData.checkInDate,
  contractStartDate: onboardingData.contractStartDate,
  status: 'active'
};

// Processes payments during onboarding
if (onboardingData.advancePayment) {
  updateData.advancePayment = {
    amount: onboardingData.advancePayment.amount,
    date: new Date(),
    receiptNumber: `ADV-${Date.now()}`
  };
}

if (onboardingData.rentPayment) {
  updateData.rentPayment = {
    amount: onboardingData.rentPayment.amount,
    date: new Date(),
    receiptNumber: `RENT-${Date.now()}`
  };
}

// Calculates total amount paid
updateData.totalAmountPaid = advanceAmount + rentAmount;
updateData.paymentStatus = updateData.totalAmountPaid > 0 ? 'paid' : 'pending';
```

#### B. `switchResidentRoom()` - Room Switching with Data Sync
```javascript
// Updates resident with new room details
const updateData = {
  roomId: newRoom._id,
  roomNumber: newRoom.roomNumber,
  bedNumber: newBedNumber,
  sharingType: newRoom.sharingType,  // ✅ Syncs new sharing type
  cost: newRoom.cost,                // ✅ Syncs new monthly cost
  updatedBy: userId
};

// Records switch history
const switchRecord = {
  fromRoom: currentRoomInfo.roomNumber,
  fromBed: currentRoomInfo.bedNumber,
  toRoom: newRoom.roomNumber,
  toBed: newBedNumber,
  switchDate: new Date(),
  reason: switchData.reason || 'Room switch',
  performedBy: userId
};

updateData.$push = { switchHistory: switchRecord };

// Generates new allocation letter for room switch
const newAllocationLetter = new AllocationLetter({
  residentId: residentId,
  allocationData: {
    sharingType: {
      id: newRoom.sharingType,
      name: newRoom.sharingType,
      cost: newRoom.cost          // ✅ Syncs new cost
    },
    room: {
      _id: newRoom._id,
      roomNumber: newRoom.roomNumber,
      bedNumber: newBedNumber
    }
  }
});
```

#### C. `getResidentComprehensiveDetails()` - Real-time Data Fetching
```javascript
// Fetches complete resident data with real-time calculations
const resident = await Resident.findById(residentId)
  .populate('roomId', 'roomNumber floorId sharingType cost numberOfBeds')
  .populate('branchId', 'name')
  .populate('pgId', 'name');

// Gets payment history
const payments = await Payment.find({ 
  residentId: residentId, 
  isActive: true 
}).sort({ paymentDate: -1 });

// Calculates payment statistics
const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
const lastPayment = payments.length > 0 ? payments[0] : null;

// Gets allocation letter
const allocationLetter = await AllocationLetter.findOne({ 
  residentId: residentId 
}).sort({ createdAt: -1 });

// Updates resident data with calculated fields
const residentData = resident.toObject();
residentData.paymentHistory = payments;
residentData.allocationLetter = allocationLetter;
residentData.totalAmountPaid = totalPaid;
residentData.lastPaymentDate = lastPayment ? lastPayment.paymentDate : null;
```

### 3. Enhanced Resident Details Component (`frontend/src/components/admin/ResidentDetails.jsx`)

**Tabbed Interface for Complete Data Display:**

#### A. Overview Tab
- Basic information
- Address details
- Work information
- Emergency contacts

#### B. Payments Tab
- **Payment Summary Cards:**
  - Advance Payment (Blue)
  - Rent Payment (Green)
  - Total Paid (Purple)
- **Current Room & Cost Details:**
  - Room number, bed number, sharing type
  - Monthly cost, payment status
  - Last payment date, check-in date
- **Payment Receipts:**
  - Advance receipt number
  - Rent receipt number

#### C. Room & Allocation Tab
- **Current Allocation:**
  - Room number, bed number, floor
  - Sharing type, monthly cost
- **Important Dates:**
  - Check-in, contract start/end
  - Check-out, vacation, notice period

#### D. Room History Tab
- **Room Switch History:**
  - From room/bed → To room/bed
  - Switch date, reason
  - Performed by user
- **Visual Timeline:**
  - Color-coded status indicators
  - Detailed switch information

#### E. Documents Tab
- ID proof, address proof
- Document download links
- Additional information

## 🔄 Data Synchronization Flow

### 1. **Onboarding Process**
```
Resident Creation → Room Assignment → Payment Processing → Allocation Letter Generation
       ↓                ↓                ↓                    ↓
   Basic Info    Cost/Type Sync    Payment Records      Document Creation
       ↓                ↓                ↓                    ↓
   Resident DB    Resident Update    Payment DB         Allocation DB
```

### 2. **Room Switching Process**
```
Room Switch Request → Bed Validation → Resident Update → History Recording → New Allocation Letter
       ↓                ↓              ↓                ↓                    ↓
   Check Availability  Verify Bed    Update Cost/Type  Add to SwitchHistory  Generate PDF
       ↓                ↓              ↓                ↓                    ↓
   Room Available    Bed Free      Data Sync         Audit Trail          Document Sync
```

### 3. **Payment Updates**
```
Payment Made → Payment Record → Resident Update → Status Sync → UI Refresh
      ↓            ↓              ↓              ↓            ↓
   Amount/Date   Store in DB   Update Status   Real-time   Component Update
      ↓            ↓              ↓              ↓            ↓
   Receipt Gen   Payment DB   Resident DB     Data Sync   UI Sync
```

## 🎯 Key Benefits

### 1. **Real-time Data Consistency**
- All components reflect current resident status
- No stale data or inconsistencies
- Automatic updates across all views

### 2. **Complete Audit Trail**
- Every room change is recorded
- Payment history is maintained
- Allocation letters are versioned

### 3. **Seamless User Experience**
- Tabbed interface for organized information
- Real-time data fetching
- Comprehensive payment tracking

### 4. **Business Process Compliance**
- Proper documentation for room changes
- Payment verification and tracking
- Legal compliance through allocation letters

## 🚀 Implementation Notes

### 1. **Backend API Endpoints**
- `GET /api/residents/:residentId/details` - Comprehensive resident data
- `POST /api/residents/:residentId/switch-room` - Room switching
- `GET /api/residents/:residentId/allocation-letters` - Allocation documents

### 2. **Data Validation**
- Room availability checks before assignment
- Bed validation during switching
- Payment amount verification

### 3. **Error Handling**
- Graceful fallbacks for failed operations
- Comprehensive error logging
- User-friendly error messages

### 4. **Performance Optimization**
- Efficient database queries with population
- Caching of frequently accessed data
- Lazy loading of heavy components

## 🔧 Maintenance & Updates

### 1. **Regular Data Validation**
- Verify resident-room consistency
- Check payment record accuracy
- Validate allocation letter data

### 2. **System Monitoring**
- Track room switching frequency
- Monitor payment processing
- Audit allocation letter generation

### 3. **Future Enhancements**
- Real-time notifications for changes
- Advanced reporting and analytics
- Integration with external systems

---

**Last Updated:** January 2025  
**Version:** 1.0  
**Maintained By:** Full Stack Development Team
