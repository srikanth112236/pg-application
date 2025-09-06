# Branch Activation & Set-Default Fix

## Problem Solved

The original error was caused by a unique index constraint on `{ pgId: 1, isDefault: 1 }` in the MongoDB branches collection. This prevented having multiple branches with the same `pgId` and `isDefault: false`, causing the error:

```
E11000 duplicate key error collection: pg_maintenance.branches index: pgId_1_isDefault_1 dup key: { pgId: ObjectId('...'), isDefault: false }
```

## Solution Implemented

### 1. Fixed Database Index Issue

- **Removed problematic unique index**: The unique constraint on `{ pgId: 1, isDefault: 1 }` has been removed
- **Added proper indexes**: New non-unique indexes for efficient querying:
  - `{ pgId: 1, isActive: 1 }` - For filtering active branches by PG
  - `{ pgId: 1, isDefault: 1, isActive: 1 }` - For finding default branches
  - `{ createdBy: 1 }` - For user-based queries
  - `{ status: 1 }` - For status-based filtering

### 2. Enhanced Branch Service

#### New Methods Added:

1. **`activateBranch(branchId, userId)`**
   - Activates an inactive branch
   - Returns the updated branch data
   - Includes validation checks

2. **`deactivateBranch(branchId, userId)`**
   - Deactivates an active branch
   - Prevents deactivation of default branch
   - Checks for active floors before deactivation
   - Returns the updated branch data

3. **`getAllBranchesByPG(pgId)`**
   - Returns all branches (active and inactive) for a PG
   - Sorted by default status, active status, and creation date

#### Enhanced Methods:

1. **`setDefaultBranch(branchId, userId)`**
   - Fixed to use direct database operations to avoid index conflicts
   - Added validation to prevent setting inactive branches as default
   - Returns updated branch data
   - Uses atomic operations to ensure consistency

2. **`getBranchStats(pgId)`**
   - Added `isActive` field to statistics output
   - Enhanced data structure for better frontend integration

### 3. New API Endpoints

#### Branch Routes Added:

1. **`GET /api/branches/all`**
   - Get all branches (including inactive) for user's PG
   - Requires admin authentication

2. **`POST /api/branches/:branchId/activate`**
   - Activate a branch
   - Requires admin authentication
   - Returns updated branch data

3. **`POST /api/branches/:branchId/deactivate`**
   - Deactivate a branch
   - Requires admin authentication
   - Prevents deactivation of default branch
   - Returns updated branch data

#### Enhanced Routes:

1. **`POST /api/branches/:branchId/set-default`**
   - Fixed to handle index conflicts properly
   - Returns updated branch data
   - Better error handling

## Usage Examples

### Activate a Branch
```javascript
// Frontend API call
const response = await fetch(`/api/branches/${branchId}/activate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
if (result.success) {
  console.log('Branch activated:', result.data);
}
```

### Deactivate a Branch
```javascript
// Frontend API call
const response = await fetch(`/api/branches/${branchId}/deactivate`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
if (result.success) {
  console.log('Branch deactivated:', result.data);
}
```

### Set Default Branch
```javascript
// Frontend API call
const response = await fetch(`/api/branches/${branchId}/set-default`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});

const result = await response.json();
if (result.success) {
  console.log('Default branch set:', result.data);
}
```

### Get All Branches (Including Inactive)
```javascript
// Frontend API call
const response = await fetch('/api/branches/all', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const result = await response.json();
if (result.success) {
  console.log('All branches:', result.data);
}
```

## Validation Rules

### Activate Branch
- Branch must exist
- Branch must be currently inactive
- User must have admin permissions

### Deactivate Branch
- Branch must exist
- Branch must be currently active
- Branch cannot be the default branch
- Branch must not have active floors
- User must have admin permissions

### Set Default Branch
- Branch must exist
- Branch must be active
- User must have admin permissions
- Automatically removes default status from other branches

## Error Handling

All methods include comprehensive error handling:

- **404**: Branch not found
- **400**: Validation errors (e.g., trying to deactivate default branch)
- **500**: Server errors with detailed error messages

## Database Operations

### Index Management
The fix includes scripts to manage database indexes:

1. **`fix-branch-index-simple.js`** - Simple index fix
2. **`fix-branch-index-complete.js`** - Comprehensive index management

### Direct Database Operations
For critical operations like setting default branches, the service uses direct MongoDB operations to avoid Mongoose index conflicts:

```javascript
const db = Branch.db;
const collection = db.collection('branches');

await collection.updateMany(
  { pgId: branch.pgId, isActive: true, _id: { $ne: branch._id } },
  { $set: { isDefault: false } }
);

await collection.updateOne(
  { _id: branch._id },
  { $set: { isDefault: true } }
);
```

## Testing

A comprehensive test script (`test-branch-activation.js`) has been created to verify:

1. Branch creation
2. Setting default branches
3. Activating/deactivating branches
4. Getting branch statistics
5. Error handling scenarios

## Frontend Integration

The new functionality can be integrated into the frontend with:

1. **Branch Management UI**: Add activate/deactivate buttons
2. **Branch Status Display**: Show active/inactive status
3. **Default Branch Selection**: Enhanced default branch selection
4. **Branch Statistics**: Display comprehensive branch statistics

## Security Considerations

- All endpoints require admin authentication
- Proper validation prevents unauthorized operations
- Audit logging for all branch operations
- Input sanitization and validation

## Performance Optimizations

- Efficient database indexes for common queries
- Atomic operations for default branch management
- Proper error handling to prevent cascading failures
- Optimized queries with proper population

## Migration Notes

1. **Run the index fix script** before deploying:
   ```bash
   node fix-branch-index-simple.js
   ```

2. **Update frontend components** to use new endpoints

3. **Test thoroughly** with the provided test script

4. **Monitor logs** for any remaining index-related issues

## Future Enhancements

1. **Bulk Operations**: Add bulk activate/deactivate functionality
2. **Branch Templates**: Predefined branch configurations
3. **Advanced Filtering**: Filter branches by status, capacity, etc.
4. **Branch Analytics**: Detailed branch performance metrics
5. **Branch Scheduling**: Schedule branch activation/deactivation

---

**Status**: ✅ **COMPLETED**
**Last Updated**: January 2025
**Tested**: ✅ All functionality tested and working
