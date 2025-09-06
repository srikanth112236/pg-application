# Room Switching System - Complete Implementation

## Overview
The Room Switching System allows administrators to move residents between different rooms and beds within the same PG facility. This system includes comprehensive validation, preview functionality, and tracking of all room switches.

## Features

### 🏠 **Room & Bed Management**
- **Bed Availability Tracking**: Real-time bed occupancy status
- **Room Filtering**: Filter rooms by sharing type (1-sharing, 2-sharing, 3-sharing, 4-sharing)
- **Bed Selection**: Visual bed selection interface with availability indicators
- **Cost Management**: Automatic cost updates based on sharing type changes

### 👥 **Resident Management**
- **Current Status Display**: Show resident's current room, bed, sharing type, and cost
- **Switch Validation**: Ensure only active residents can switch rooms
- **History Tracking**: Complete switch history with reasons and timestamps
- **Data Consistency**: Maintain data integrity across all related systems

### 🔄 **Switching Process**
- **Preview System**: Side-by-side comparison of current vs. new room
- **Cost Change Warnings**: Alert administrators about cost implications
- **Reason Documentation**: Optional reason tracking for each switch
- **Confirmation Flow**: Multi-step confirmation process

## Backend Implementation

### Models Updated

#### Resident Model (`resident.model.js`)
```javascript
// Added fields for room switching
sharingType: {
  type: String,
  enum: ['1-sharing', '2-sharing', '3-sharing', '4-sharing']
},
cost: {
  type: Number,
  min: [0, 'Cost cannot be negative'],
  default: 0
},
switchHistory: [{
  fromRoom: String,
  fromBed: String,
  toRoom: String,
  toBed: String,
  switchDate: Date,
  reason: String,
  performedBy: ObjectId
}]
```

#### Room Model (`room.model.js`)
```javascript
// Bed schema with occupancy tracking
bedSchema: {
  bedNumber: String,
  isOccupied: Boolean,
  occupiedBy: ObjectId,
  occupiedAt: Date
}
```

### Services Updated

#### Resident Service (`resident.service.js`)

##### `getAvailableRoomsForSwitch(pgId, currentRoomId, sharingType)`
- Returns available rooms with bed availability
- Excludes current room from options
- Filters by sharing type if specified
- Includes bed count and occupancy information

##### `switchResidentRoom(residentId, newRoomId, newBedNumber, switchData, userId)`
- Validates bed availability
- Updates old room bed status
- Updates new room bed status
- Updates resident information
- Tracks switch history
- Maintains data consistency

##### `getResidentSwitchHistory(residentId)`
- Returns complete switch history for a resident
- Includes switch details, reasons, and timestamps

### Routes Added

#### Resident Routes (`resident.routes.js`)
```javascript
// Switch resident room
POST /api/residents/:residentId/switch-room

// Get available rooms for switching
GET /api/residents/switch/available-rooms

// Get resident switch history
GET /api/residents/:residentId/switch-history
```

## Frontend Implementation

### Components

#### RoomSwitching.jsx
- **Resident Selection**: Search and filter active residents
- **Room Selection**: Browse available rooms with bed information
- **Bed Selection**: Visual bed selection interface
- **Preview System**: Side-by-side room comparison
- **Switch Confirmation**: Multi-step confirmation process

### Key Features

#### 1. **Resident Management Panel**
- Search residents by name, email, phone, or room
- Sort by name, room, or check-in date
- Display current room assignment and status
- View switch history for each resident

#### 2. **Available Rooms Panel**
- Filter rooms by sharing type
- Show bed availability counts
- Visual bed status indicators
- Interactive bed selection

#### 3. **Switch Preview System**
- **Current Room Display**: Red-themed panel showing current assignment
- **New Room Display**: Green-themed panel showing new assignment
- **Cost Change Warnings**: Yellow alerts for cost implications
- **Reason Input**: Optional reason documentation

#### 4. **Bed Status Visualization**
- **Available Beds**: Green indicators for free beds
- **Occupied Beds**: Red indicators for occupied beds
- **Interactive Selection**: Click to select available beds
- **Real-time Updates**: Live bed availability status

## API Endpoints

### Switch Room
```http
POST /api/residents/:residentId/switch-room
Content-Type: application/json
Authorization: Bearer <token>

{
  "newRoomId": "room_id_here",
  "newBedNumber": "bed_number_here",
  "reason": "Optional reason for switch",
  "trackHistory": true
}
```

### Get Available Rooms
```http
GET /api/residents/switch/available-rooms?pgId=<pg_id>&currentRoomId=<current_room_id>&sharingType=<sharing_type>
Authorization: Bearer <token>
```

### Get Switch History
```http
GET /api/residents/:residentId/switch-history
Authorization: Bearer <token>
```

## Data Flow

### 1. **Room Switch Process**
```
Resident Selection → Room Selection → Bed Selection → Preview → Confirmation → Switch Execution
```

### 2. **Backend Operations**
```
Validate Request → Check Bed Availability → Update Old Room → Update New Room → Update Resident → Log History
```

### 3. **Data Updates**
- **Old Room**: Free up bed, update occupancy status
- **New Room**: Occupy bed, update occupancy status
- **Resident**: Update room, bed, sharing type, and cost
- **History**: Log switch details with timestamp

## Security & Validation

### Input Validation
- Resident ID validation
- Room ID validation
- Bed number validation
- User permission checks

### Business Logic Validation
- Bed availability checks
- Resident status validation
- Room sharing type validation
- Cost calculation validation

### Data Integrity
- Transaction-based updates
- Rollback on errors
- Audit trail maintenance
- History tracking

## Testing

### Test Scripts
- `test-room-switching-complete.js`: Comprehensive functionality testing
- Tests bed availability
- Tests room switching
- Tests history tracking
- Tests data consistency

### Test Coverage
- ✅ Resident selection
- ✅ Room availability
- ✅ Bed selection
- ✅ Switch execution
- ✅ History tracking
- ✅ Data validation
- ✅ Error handling

## Usage Examples

### Basic Room Switch
1. Select a resident from the left panel
2. Choose an available room from the right panel
3. Select an available bed
4. Review the preview comparison
5. Enter optional reason
6. Confirm the switch

### Filtering Rooms
- Use sharing type filter to find specific room types
- Sort rooms by availability
- View bed status for each room

### Cost Management
- Preview cost changes before switching
- Understand sharing type implications
- Track cost history through switch records

## Error Handling

### Common Errors
- **Bed Not Available**: Bed is already occupied
- **Invalid Room**: Room doesn't exist or is inactive
- **Invalid Resident**: Resident not found or inactive
- **Permission Denied**: User lacks switching permissions

### Error Responses
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": "Detailed error information"
}
```

## Future Enhancements

### Planned Features
- **Bulk Room Switching**: Switch multiple residents at once
- **Room Preferences**: Resident room preference tracking
- **Switch Scheduling**: Future-dated room switches
- **Advanced Analytics**: Switch pattern analysis
- **Notification System**: Email/SMS notifications for switches

### Integration Points
- **Payment System**: Automatic cost updates
- **Reporting System**: Switch analytics and reports
- **Audit System**: Compliance and audit trail
- **Mobile App**: Mobile-friendly switching interface

## Troubleshooting

### Common Issues
1. **No Available Rooms**: Check room status and bed availability
2. **Switch Fails**: Verify resident and room status
3. **History Missing**: Check switchHistory field in resident model
4. **Cost Mismatch**: Verify sharing type and cost fields

### Debug Steps
1. Check console logs for detailed error messages
2. Verify database connections and permissions
3. Test individual API endpoints
4. Check resident and room data integrity

## Conclusion

The Room Switching System provides a comprehensive solution for managing resident room assignments with full validation, preview functionality, and history tracking. The system ensures data consistency while providing an intuitive user interface for administrators to manage room switches effectively.

For technical support or feature requests, please refer to the development team or create an issue in the project repository.
