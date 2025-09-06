import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Search, 
  Building2, 
  User, 
  CheckCircle, 
  ArrowLeft, 
  ArrowRight,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  UserCheck,
  Bed,
  Star,
  Clock,
  Home,
  CreditCard,
  RefreshCw,
  Filter,
  Info,
  AlertTriangle,
  CheckSquare,
  XSquare,
  ArrowUpDown,
  History,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { selectSelectedBranch } from '../../store/slices/branch.slice';

const RoomSwitching = () => {
  const selectedBranch = useSelector(selectSelectedBranch);
  const [residents, setResidents] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedBed, setSelectedBed] = useState(null);
  const [switchReason, setSwitchReason] = useState('');
  const [showSwitchModal, setShowSwitchModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [switchHistory, setSwitchHistory] = useState([]);
  const [filterSharingType, setFilterSharingType] = useState('');
  const [sortBy, setSortBy] = useState('name');

  useEffect(() => {
    if (selectedBranch) {
      fetchResidents();
      fetchAvailableRooms();
    }
  }, [selectedBranch]);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/residents?branchId=${selectedBranch._id}&status=active`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && data.data && Array.isArray(data.data.residents)) {
        setResidents(data.data.residents);
      } else {
        console.error('Invalid residents data:', data);
        setResidents([]);
        toast.error(data.message || 'Failed to fetch residents');
      }
    } catch (error) {
      console.error('Error fetching residents:', error);
      setResidents([]);
      toast.error('Failed to fetch residents');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableRooms = async () => {
    try {
      const response = await fetch(`/api/residents/switch/available-rooms?pgId=${selectedBranch.pgId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setAvailableRooms(data.data);
      } else {
        console.error('Invalid available rooms data:', data);
        setAvailableRooms([]);
        toast.error(data.message || 'Failed to fetch available rooms');
      }
    } catch (error) {
      console.error('Error fetching available rooms:', error);
      setAvailableRooms([]);
      toast.error('Failed to fetch available rooms');
    }
  };

  const handleResidentSelect = (resident) => {
    setSelectedResident(resident);
    setSelectedRoom(null);
    setSelectedBed(null);
    setSwitchReason('');
  };

  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
    setSelectedBed(null);
  };

  const handleBedSelect = (bedNumber) => {
    setSelectedBed(bedNumber);
  };

  const handleSwitchSubmit = async () => {
    if (!selectedResident || !selectedRoom || !selectedBed) {
      toast.error('Please select resident, room, and bed');
      return;
    }

    try {
      setLoading(true);
      
      const response = await fetch(`/api/residents/${selectedResident._id}/switch-room`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          newRoomId: selectedRoom._id,
          newBedNumber: selectedBed,
          reason: switchReason || 'Room switch request'
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Room switched successfully!');
        setShowSwitchModal(false);
        resetForm();
        fetchResidents();
        fetchAvailableRooms();
      } else {
        toast.error(data.message || 'Failed to switch room');
      }
    } catch (error) {
      console.error('Error switching room:', error);
      toast.error('Failed to switch room');
    } finally {
      setLoading(false);
    }
  };

  const handleViewHistory = async (residentId) => {
    try {
      const response = await fetch(`/api/residents/${residentId}/switch-history`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.data)) {
        setSwitchHistory(data.data);
        setShowHistoryModal(true);
      } else {
        console.error('Invalid switch history data:', data);
        setSwitchHistory([]);
        toast.error(data.message || 'Failed to fetch switch history');
      }
    } catch (error) {
      console.error('Error fetching switch history:', error);
      setSwitchHistory([]);
      toast.error('Failed to fetch switch history');
    }
  };

  const resetForm = () => {
    setSelectedResident(null);
    setSelectedRoom(null);
    setSelectedBed(null);
    setSwitchReason('');
  };

  const getCurrentRoomInfo = (resident) => {
    if (!resident.roomNumber) {
      return {
        hasRoom: false,
        roomNumber: 'Unassigned',
        bedNumber: 'N/A',
        sharingType: 'N/A',
        cost: 0
      };
    }
    
    return {
      hasRoom: true,
      roomNumber: resident.roomNumber,
      bedNumber: resident.bedNumber || 'N/A',
      sharingType: resident.sharingType || 'N/A',
      cost: resident.cost || 0
    };
  };

  const getFilteredResidents = () => {
    if (!Array.isArray(residents)) return [];
    let filtered = residents.filter(resident => {
      const firstName = resident.firstName || '';
      const lastName = resident.lastName || '';
      const email = resident.email || '';
      const phone = resident.phone || '';
      const roomNumber = resident.roomNumber || '';
      return firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             email.toLowerCase().includes(searchTerm.toLowerCase()) ||
             phone.includes(searchTerm) ||
             roomNumber.includes(searchTerm);
    });
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName || ''} ${a.lastName || ''}`.localeCompare(`${b.firstName || ''} ${b.lastName || ''}`);
        case 'room':
          return (a.roomNumber || '').localeCompare(b.roomNumber || '');
        case 'checkIn':
          return new Date(b.checkInDate || 0) - new Date(a.checkInDate || 0);
        default:
          return 0;
      }
    });
    return filtered;
  };

  const getFilteredRooms = () => {
    if (!Array.isArray(availableRooms)) return [];
    let filtered = availableRooms;
    if (filterSharingType) filtered = filtered.filter(room => room.sharingType === filterSharingType);
    return filtered;
  };

  const getSharingTypeColor = (sharingType) => {
    const colors = {
      '1-sharing': 'bg-blue-100 text-blue-800',
      '2-sharing': 'bg-green-100 text-green-800',
      '3-sharing': 'bg-yellow-100 text-yellow-800',
      '4-sharing': 'bg-purple-100 text-purple-800'
    };
    return colors[sharingType] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inactive' },
      moved_out: { color: 'bg-red-100 text-red-800', text: 'Moved Out' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (!selectedBranch) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Switching</h1>
            <p className="text-gray-600">Please use the branch selector in the header to switch rooms.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Switching</h1>
              <p className="text-gray-600">Switch residents between different rooms and beds</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => {
                  fetchResidents();
                  fetchAvailableRooms();
                }}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Residents */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Current Residents
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {residents.length} residents
                </span>
              </div>
              
              {/* Search and Filters */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search residents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="name">Sort by Name</option>
                  <option value="room">Sort by Room</option>
                  <option value="checkIn">Sort by Check-in Date</option>
                </select>
              </div>
            </div>

            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : getFilteredResidents().length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No residents found</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {getFilteredResidents().map((resident) => (
                    <div
                      key={resident._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedResident?._id === resident._id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleResidentSelect(resident)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">
                              {resident.firstName || 'N/A'} {resident.lastName || 'N/A'}
                            </h3>
                            <p className="text-sm text-gray-500">{resident.email || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(resident.status)}
                          {resident.roomNumber && (
                            <p className="text-sm text-gray-600 mt-1">
                              Room {resident.roomNumber} - Bed {resident.bedNumber || 'N/A'}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {resident.roomNumber && (
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Building2 className="h-4 w-4 text-gray-400" />
                            <span className="text-sm text-gray-600">
                              Current: {resident.roomNumber}-{resident.bedNumber || 'N/A'}
                            </span>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewHistory(resident._id);
                            }}
                            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                          >
                            View History
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Available Rooms */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Building2 className="h-5 w-5 mr-2 text-green-600" />
                  Available Rooms
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {availableRooms.length} rooms
                </span>
              </div>
              
              {/* Filters */}
              <div className="flex items-center space-x-3">
                <select
                  value={filterSharingType}
                  onChange={(e) => setFilterSharingType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Sharing Types</option>
                  <option value="1-sharing">1-sharing</option>
                  <option value="2-sharing">2-sharing</option>
                  <option value="3-sharing">3-sharing</option>
                  <option value="4-sharing">4-sharing</option>
                </select>
              </div>
            </div>

            <div className="p-6">
              {getFilteredRooms().length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No available rooms found</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {getFilteredRooms().map((room) => (
                    <div
                      key={room._id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 hover:shadow-md ${
                        selectedRoom?._id === room._id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleRoomSelect(room)}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">Room {room.roomNumber || 'N/A'}</h3>
                            <p className="text-sm text-gray-500">{room.floorId?.name || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSharingTypeColor(room.sharingType)}`}>
                            {room.sharingType || 'N/A'}
                          </span>
                          <p className="text-sm text-gray-600 mt-1">₹{room.cost || 0}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-lg font-semibold text-gray-900">{room.availableBedCount || 0}</p>
                          <p className="text-xs text-gray-600">Available Beds</p>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <p className="text-lg font-semibold text-gray-900">{room.occupiedBedCount || 0}</p>
                          <p className="text-xs text-gray-600">Occupied Beds</p>
                        </div>
                      </div>
                      
                      {/* Bed Status Overview */}
                      <div className="mt-3">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Bed Status:</h4>
                        <div className="grid grid-cols-4 gap-2">
                          {room.beds && room.beds.map((bed) => (
                            <div
                              key={bed.bedNumber}
                              className={`p-2 text-xs rounded-lg border text-center ${
                                bed.isOccupied
                                  ? 'border-red-200 bg-red-50 text-red-700'
                                  : 'border-green-200 bg-green-50 text-green-700'
                              }`}
                            >
                              Bed {bed.bedNumber}
                              <div className="text-xs mt-1">
                                {bed.isOccupied ? 'Occupied' : 'Available'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {selectedRoom?._id === room._id && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Select Available Bed:</h4>
                          <div className="grid grid-cols-4 gap-2">
                            {(room.availableBeds || []).map((bed) => (
                              <button
                                key={bed.bedNumber}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleBedSelect(bed.bedNumber);
                                }}
                                className={`p-2 text-sm rounded-lg border transition-all duration-200 ${
                                  selectedBed === bed.bedNumber
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-green-200 bg-green-50 text-green-700 hover:border-green-300'
                                }`}
                              >
                                Bed {bed.bedNumber}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Switch Preview Section */}
        {selectedResident && selectedRoom && selectedBed && (
          <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Room Switch Preview</h3>
              <p className="text-gray-600">Review the switch details before confirming</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Current Room */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <ArrowLeft className="h-4 w-4 text-red-600" />
                  </div>
                  <h4 className="font-medium text-red-800">Current Room</h4>
                </div>
                
                {(() => {
                  const currentInfo = getCurrentRoomInfo(selectedResident);
                  return currentInfo.hasRoom ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-red-700">Room Number:</span>
                        <span className="font-medium text-red-900">Room {currentInfo.roomNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-red-700">Bed Number:</span>
                        <span className="font-medium text-red-900">Bed {currentInfo.bedNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-red-700">Sharing Type:</span>
                        <span className="font-medium text-red-900">{currentInfo.sharingType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-red-700">Current Cost:</span>
                        <span className="font-medium text-red-900">₹{currentInfo.cost}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-red-600 font-medium">Currently Unassigned</p>
                    </div>
                  );
                })()}
              </div>

              {/* New Room */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <ArrowRight className="h-4 w-4 text-green-600" />
                  </div>
                  <h4 className="font-medium text-green-800">New Room</h4>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Room Number:</span>
                    <span className="font-medium text-green-900">Room {selectedRoom.roomNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Bed Number:</span>
                    <span className="font-medium text-green-900">Bed {selectedBed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">Sharing Type:</span>
                    <span className="font-medium text-green-900">{selectedRoom.sharingType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-green-700">New Cost:</span>
                    <span className="font-medium text-green-900">₹{selectedRoom.cost}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Cost Change Warning */}
            {(() => {
              const currentInfo = getCurrentRoomInfo(selectedResident);
              return currentInfo.hasRoom && selectedRoom.sharingType !== currentInfo.sharingType;
            })() && (
              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-600" />
                  <h4 className="font-medium text-yellow-800">Cost Change Notice</h4>
                </div>
                <p className="text-sm text-yellow-700 mt-2">
                  The sharing type is changing from <strong>{getCurrentRoomInfo(selectedResident).sharingType}</strong> to <strong>{selectedRoom.sharingType}</strong>. 
                  This will affect the monthly rent amount from ₹{getCurrentRoomInfo(selectedResident).cost} to ₹{selectedRoom.cost}.
                </p>
              </div>
            )}

            {/* Reason Input */}
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Switch (Optional)
              </label>
              <textarea
                value={switchReason}
                onChange={(e) => setSwitchReason(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter reason for room switch..."
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex items-center justify-center space-x-4">
              <button
                onClick={resetForm}
                className="px-6 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowSwitchModal(true)}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-700 text-white rounded-xl hover:from-blue-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold"
              >
                <ArrowUpDown className="h-5 w-5 inline mr-2" />
                Confirm Room Switch
              </button>
            </div>
          </div>
        )}

        {/* Switch Confirmation Modal */}
        <AnimatePresence>
          {showSwitchModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">Confirm Room Switch</h3>
                  <p className="text-sm text-gray-600 mt-1">Review the switch details before confirming</p>
                </div>

                <div className="p-6 space-y-6">
                  {/* Switch Details */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 mb-3">Switch Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Resident</p>
                        <p className="font-medium text-gray-900">
                          {selectedResident?.firstName || 'N/A'} {selectedResident?.lastName || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Current Location</p>
                        <p className="font-medium text-gray-900">
                          {selectedResident?.roomNumber ? `Room ${selectedResident.roomNumber} - Bed ${selectedResident.bedNumber || 'N/A'}` : 'Unassigned'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">New Location</p>
                        <p className="font-medium text-gray-900">
                          Room {selectedRoom?.roomNumber || 'N/A'} - Bed {selectedBed || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Sharing Type</p>
                        <p className="font-medium text-gray-900">{selectedRoom?.sharingType || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Cost Change Warning */}
                  {selectedResident?.roomId && selectedRoom?.sharingType !== (selectedResident?.sharingType || 'unknown') && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        <h4 className="font-medium text-yellow-800">Cost Change Notice</h4>
                      </div>
                      <p className="text-sm text-yellow-700 mt-2">
                        The sharing type is changing from {selectedResident?.sharingType || 'unknown'} to {selectedRoom?.sharingType}. 
                        This may affect the monthly rent amount.
                      </p>
                    </div>
                  )}

                  {/* Reason Input */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Switch (Optional)
                    </label>
                    <textarea
                      value={switchReason}
                      onChange={(e) => setSwitchReason(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter reason for room switch..."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-4 p-6 border-t border-gray-200">
                  <button
                    onClick={() => setShowSwitchModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSwitchSubmit}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? 'Switching...' : 'Confirm Switch'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Switch History Modal */}
        <AnimatePresence>
          {showHistoryModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold text-gray-900">Room Switch History</h3>
                    <button
                      onClick={() => setShowHistoryModal(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XSquare className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  {switchHistory.length === 0 ? (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No switch history found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {switchHistory.map((record, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <ArrowUpDown className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">
                                  {record.fromRoom} → {record.toRoom}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  Bed {record.fromBed} → Bed {record.toBed}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-gray-500">
                                {new Date(record.switchDate).toLocaleDateString()}
                              </p>
                              <p className="text-xs text-gray-400">
                                {new Date(record.switchDate).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          {record.reason && (
                            <div className="bg-gray-50 rounded p-3">
                              <p className="text-sm text-gray-700">
                                <span className="font-medium">Reason:</span> {record.reason}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default RoomSwitching;
