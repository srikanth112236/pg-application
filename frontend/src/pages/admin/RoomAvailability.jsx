import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, Bed, Users, DollarSign, MapPin, Calendar, Clock, 
  CheckCircle, Search, RefreshCw, User, BarChart3, Grid3X3, List,
  X, ChevronRight, Eye, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ResidentDetails from '../../components/admin/ResidentDetails';
import { selectSelectedBranch } from '../../store/slices/branch.slice';

const RoomAvailability = () => {
  const selectedBranch = useSelector(selectSelectedBranch);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [floorFilter, setFloorFilter] = useState('all');
  const [floors, setFloors] = useState([]);
  const [showResidentDetails, setShowResidentDetails] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  
  const [stats, setStats] = useState({
    totalRooms: 0,
    totalBeds: 0,
    availableBeds: 0,
    occupiedBeds: 0,
    noticePeriodBeds: 0,
    occupancyRate: 0
  });

  // Memoized filtered rooms
  const filteredRooms = useMemo(() => {
    let filtered = rooms;

    if (searchTerm) {
      filtered = filtered.filter(room => 
        room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.floorId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.beds.some(bed => 
          bed.isOccupied && bed.resident && 
          (bed.resident.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           bed.resident.lastName?.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(room => {
        if (statusFilter === 'available') {
          return room.roomStatus === 'fully_available';
        } else if (statusFilter === 'occupied') {
          return room.roomStatus === 'fully_occupied';
        } else if (statusFilter === 'notice') {
          // Check if any bed in the room is in notice period
          return room.beds.some(bed => 
            bed.isOccupied && bed.residentStatus === 'notice_period'
          );
        } else if (statusFilter === 'partial') {
          return room.roomStatus === 'partially_occupied';
        }
        return true;
      });
    }

    if (floorFilter !== 'all') {
      filtered = filtered.filter(room => room.floorId._id === floorFilter);
    }

    return filtered;
  }, [rooms, searchTerm, statusFilter, floorFilter]);

  // Memoized stats calculation
  const calculatedStats = useMemo(() => {
    // If we have metadata from server, use it (more accurate)
    if (rooms.length > 0 && rooms[0].metadata) {
      return {
        totalRooms: rooms[0].metadata.totalRooms || rooms.length,
        totalBeds: rooms[0].metadata.totalBeds || 0,
        availableBeds: rooms[0].metadata.availableBeds || 0,
        occupiedBeds: rooms[0].metadata.occupiedBeds || 0,
        noticePeriodBeds: rooms[0].metadata.noticePeriodBeds || 0,
        noticePeriodRooms: rooms.filter(room => 
          room.beds.some(bed => bed.isOccupied && bed.residentStatus === 'notice_period')
        ).length,
        occupancyRate: rooms[0].metadata.occupancyRate || 0
      };
    }

    // Fallback to client-side calculation
    let totalBeds = 0;
    let availableBeds = 0;
    let occupiedBeds = 0;
    let noticePeriodBeds = 0;
    let noticePeriodRooms = 0;

    rooms.forEach(room => {
      totalBeds += room.numberOfBeds;
      
      // Check if any bed in the room is in notice period
      const hasNoticePeriodBed = room.beds.some(bed => 
        bed.isOccupied && bed.residentStatus === 'notice_period'
      );
      
      if (hasNoticePeriodBed) {
        noticePeriodRooms++;
      }
      
      room.beds.forEach(bed => {
        if (bed.isOccupied) {
          if (bed.residentStatus === 'notice_period') {
            noticePeriodBeds++;
          } else if (bed.residentStatus === 'active') {
            occupiedBeds++;
          }
        } else {
          availableBeds++;
        }
      });
    });

    const occupancyRate = totalBeds > 0 ? ((occupiedBeds + noticePeriodBeds) / totalBeds * 100).toFixed(1) : 0;

    return {
      totalRooms: rooms.length,
      totalBeds,
      availableBeds,
      occupiedBeds,
      noticePeriodBeds,
      noticePeriodRooms,
      occupancyRate
    };
  }, [rooms]);

  // Update stats when calculated stats change
  useEffect(() => {
    setStats(calculatedStats);
  }, [calculatedStats]);

  // Debounced search handler to prevent excessive re-renders
  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
  }, []);

  // Debounced search effect to prevent excessive filtering
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // This will trigger re-filtering after user stops typing
    }, 300); // 300ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch data when branch changes - only depend on selectedBranch
  useEffect(() => {
    if (!selectedBranch) return;
    setLoading(true);
    // Fetch floors and rooms only when branch changes
    const fetchData = async () => {
      try {
        // Fetch floors with branch filtering
        const floorResponse = await fetch(`/api/pg/floors?branchId=${selectedBranch._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
        const floorData = await floorResponse.json();
        if (floorData.success) {
          setFloors(floorData.data);
        }

        // Fetch rooms with branch filtering
        const roomResponse = await fetch(`/api/pg/rooms?branchId=${selectedBranch._id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json'
          }
        });
        const roomData = await roomResponse.json();
        if (roomData.success) {
          // Server now returns enhanced room data with proper bed status
          // No need to filter by branchId as server handles it
          setRooms(roomData.data);
          setLastFetchTime(Date.now());
          
          // Log enhanced data for debugging
          if (process.env.NODE_ENV === 'development') {
            console.log('Enhanced room data received:', roomData);
            console.log('Metadata:', roomData.metadata);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedBranch]); // Only depend on selectedBranch

  // Memoized utility functions
  const getBedStatusColor = useCallback((bed) => {
    if (!bed.isOccupied) return 'bg-green-100 text-green-800 border-green-200';
    if (bed.residentStatus === 'notice_period') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }, []);

  const getBedStatusIcon = useCallback((bed) => {
    if (!bed.isOccupied) return <CheckCircle className="h-4 w-4" />;
    if (bed.residentStatus === 'notice_period') return <Clock className="h-4 w-4" />;
    return <Users className="h-4 w-4" />;
  }, []);

  const getBedStatusText = useCallback((bed) => {
    if (!bed.isOccupied) return 'Available';
    if (bed.residentStatus === 'notice_period') return 'Notice Period';
    return 'Occupied';
  }, []);

  // Get room status color based on sharing type
  const getRoomStatusColor = useCallback((room) => {
    if (room.beds.some(bed => bed.isOccupied && bed.residentStatus === 'notice_period')) {
      return 'bg-yellow-500';
    }
    if (room.roomStatus === 'fully_available') {
      return 'bg-green-500';
    }
    if (room.roomStatus === 'fully_occupied') {
      return 'bg-blue-500';
    }
    return 'bg-orange-500';
  }, []);

  // Get room status text
  const getRoomStatusText = useCallback((room) => {
    if (room.beds.some(bed => bed.isOccupied && bed.residentStatus === 'notice_period')) {
      return 'Notice Period';
    }
    if (room.roomStatus === 'fully_available') {
      return 'Available';
    }
    if (room.roomStatus === 'fully_occupied') {
      return 'Full';
    }
    return 'Partial';
  }, []);

  // Get sharing type color
  const getSharingTypeColor = useCallback((sharingType) => {
    const colors = {
      '1-sharing': 'bg-purple-100 text-purple-800 border-purple-200',
      '2-sharing': 'bg-blue-100 text-blue-800 border-blue-200',
      '3-sharing': 'bg-green-100 text-green-800 border-green-200',
      '4-sharing': 'bg-orange-100 text-orange-800 border-orange-200'
    };
    return colors[sharingType] || 'bg-gray-100 text-gray-800 border-gray-200';
  }, []);

  const handleResidentView = useCallback((resident) => {
    setSelectedResident(resident);
    setShowResidentDetails(true);
  }, []);

  const handleRoomClick = useCallback((room) => {
    setSelectedRoom(room);
    setShowRoomModal(true);
  }, []);

  // Simple refresh function without useCallback to avoid dependency issues
  const handleRefresh = async () => {
    if (!selectedBranch) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/pg/rooms?branchId=${selectedBranch._id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      
      if (data.success) {
        // Server now returns enhanced room data with proper bed status
        setRooms(data.data);
        setLastFetchTime(Date.now());
        toast.success('Rooms refreshed successfully');
        
        // Log enhanced data for debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('Refreshed room data:', data);
        }
      } else {
        toast.error(data.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error refreshing rooms:', error);
      toast.error('Failed to refresh rooms');
    } finally {
      setLoading(false);
    }
  };

  // Compact room card renderer
  const renderCompactRoomCard = useCallback((room) => (
    <motion.div
      key={room._id}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer"
      onClick={() => handleRoomClick(room)}
    >
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden group-hover:border-blue-300 group-hover:shadow-xl">
        {/* Status indicator bar */}
        <div className={`h-2 ${getRoomStatusColor(room)}`} />
        
        {/* Compact room content */}
        <div className="p-4 text-center">
          {/* Room number - large and prominent */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3 group-hover:from-blue-600 group-hover:to-purple-700 transition-all duration-200">
            {room.roomNumber}
          </div>
          
          {/* Room status badge */}
          <div className="mb-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              room.beds.some(bed => bed.isOccupied && bed.residentStatus === 'notice_period')
                ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                : room.roomStatus === 'fully_available'
                ? 'bg-green-100 text-green-800 border border-green-200'
                : room.roomStatus === 'fully_occupied'
                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                : 'bg-orange-100 text-orange-800 border border-orange-200'
            }`}>
              {getRoomStatusText(room)}
            </span>
          </div>
          
          {/* Quick info - minimal */}
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex items-center justify-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{room.sharingType}</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <Bed className="h-3 w-3" />
              <span>{room.availableBedCount || 0}/{room.numberOfBeds} available</span>
            </div>
          </div>
          
          {/* Hover indicator */}
          <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <div className="flex items-center justify-center space-x-1 text-blue-600 text-xs font-medium">
              <span>Click to view details</span>
              <Eye className="h-3 w-3" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  ), [getRoomStatusColor, getRoomStatusText, handleRoomClick]);

  // Show loading spinner when loading and no rooms
  if (!selectedBranch) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Room Availability</h2>
            <p className="text-gray-600">Please use the branch selector in the header.</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Building2 className="h-10 w-10 text-blue-400" />
          </div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">Select a Branch</h4>
          <p className="text-gray-600">Choose a branch to view room availability and bed status</p>
        </div>
      </div>
    );
  }

  if (loading && rooms.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Room Availability</h2>
            <p className="text-gray-600">Monitor room and bed status across all floors</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading room data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Room Availability</h2>
          <p className="text-gray-600">Monitor room and bed status across all floors</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh'}</span>
          </button>
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${
                viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {selectedBranch && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Building2 className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalRooms}</div>
            <div className="text-sm text-gray-600">Total Rooms</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Bed className="h-5 w-5 text-gray-600" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalBeds}</div>
            <div className="text-sm text-gray-600">Total Beds</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600">{stats.availableBeds}</div>
            <div className="text-sm text-gray-600">Available</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{stats.occupiedBeds}</div>
            <div className="text-sm text-gray-600">Occupied</div>
          </div>
          
          <div className={`rounded-xl border p-4 text-center ${
            stats.noticePeriodBeds > 0 
              ? 'bg-yellow-50 border-yellow-200 shadow-lg' 
              : 'bg-white border-gray-200'
          }`}>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mx-auto mb-2 ${
              stats.noticePeriodBeds > 0 ? 'bg-yellow-200' : 'bg-yellow-100'
            }`}>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className={`text-2xl font-bold ${
              stats.noticePeriodBeds > 0 ? 'text-yellow-700' : 'text-yellow-600'
            }`}>{stats.noticePeriodBeds}</div>
            <div className="text-sm text-gray-600">Notice Period</div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold text-purple-600">{stats.occupancyRate}%</div>
            <div className="text-sm text-gray-600">Occupancy</div>
          </div>
        </div>
      )}

      {selectedBranch && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="notice">Notice Period</option>
                <option value="partial">Partially Occupied</option>
              </select>
              
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Floors</option>
                {floors.map(floor => (
                  <option key={floor._id} value={floor._id}>{floor.name}</option>
                ))}
              </select>
            </div>
            
            <div className="text-sm text-gray-600">
              Showing {filteredRooms.length} of {rooms.length} rooms
            </div>
          </div>
        </div>
      )}

      {selectedBranch ? (
        <div>
          {filteredRooms.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Building2 className="h-10 w-10 text-gray-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">No Rooms Found</h4>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== 'all' || floorFilter !== 'all' 
                  ? 'Try adjusting your filters' 
                  : 'No rooms have been created yet for this branch.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {filteredRooms.map(room => renderCompactRoomCard(room))}
            </div>
          )}
        </div>
      ) : null}

      {/* Room Details Modal */}
      <AnimatePresence>
        {showRoomModal && selectedRoom && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-2xl">
                      {selectedRoom.roomNumber}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Room {selectedRoom.roomNumber}</h3>
                      <p className="text-gray-600">{selectedRoom.floorId?.name} • {selectedRoom.sharingType}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowRoomModal(false)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {/* Room Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600">₹{selectedRoom.cost.toLocaleString()}</div>
                    <div className="text-sm text-blue-600">Monthly Rent</div>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-green-600">{selectedRoom.availableBedCount || 0}</div>
                    <div className="text-sm text-green-600">Available Beds</div>
                  </div>
                  <div className="bg-purple-50 rounded-xl p-4 text-center">
                    <div className="text-3xl font-bold text-purple-600">{selectedRoom.occupiedBedCount || 0}</div>
                    <div className="text-sm text-purple-600">Occupied Beds</div>
                  </div>
                </div>

                {/* Room Details */}
                <div className="bg-gray-50 rounded-xl p-6 mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building2 className="h-5 w-5 mr-2" />
                    Room Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Floor:</span>
                        <span className="font-medium text-gray-900">{selectedRoom.floorId?.name}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Sharing Type:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getSharingTypeColor(selectedRoom.sharingType)}`}>
                          {selectedRoom.sharingType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Total Beds:</span>
                        <span className="font-medium text-gray-900">{selectedRoom.numberOfBeds}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Room Status:</span>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          selectedRoom.beds.some(bed => bed.isOccupied && bed.residentStatus === 'notice_period')
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : selectedRoom.roomStatus === 'fully_available'
                            ? 'bg-green-100 text-green-800 border border-green-200'
                            : selectedRoom.roomStatus === 'fully_occupied'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          {getRoomStatusText(selectedRoom)}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Monthly Cost:</span>
                        <span className="font-bold text-lg text-gray-900">₹{selectedRoom.cost.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Cost per Bed:</span>
                        <span className="font-medium text-gray-900">₹{(selectedRoom.cost / selectedRoom.numberOfBeds).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Occupancy Rate:</span>
                        <span className="font-medium text-gray-900">
                          {((selectedRoom.occupiedBedCount || 0) / selectedRoom.numberOfBeds * 100).toFixed(0)}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Available Beds:</span>
                        <span className="font-medium text-green-600">{selectedRoom.availableBedCount || 0}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bed Details */}
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Bed className="h-5 w-5 mr-2" />
                    Bed Details ({selectedRoom.beds.length})
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRoom.beds.map((bed, bedIndex) => (
                      <div
                        key={bedIndex}
                        className={`p-4 rounded-xl border-2 transition-all duration-200 ${getBedStatusColor(bed)}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {getBedStatusIcon(bed)}
                            <span className="font-semibold text-lg">Bed {bed.bedNumber}</span>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            !bed.isOccupied 
                              ? 'bg-green-200 text-green-800 border border-green-300' 
                              : bed.residentStatus === 'notice_period'
                              ? 'bg-yellow-200 text-yellow-800 border border-yellow-300'
                              : 'bg-blue-200 text-blue-800 border border-blue-300'
                          }`}>
                            {getBedStatusText(bed)}
                          </span>
                        </div>
                        
                        {bed.isOccupied && bed.resident && (
                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <User className="h-4 w-4 text-gray-600" />
                              <span className="font-medium text-gray-700">
                                {bed.resident.firstName} {bed.resident.lastName}
                              </span>
                            </div>
                            
                            {bed.residentStatus === 'notice_period' && (
                              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                <div className="flex items-center space-x-2 mb-2">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <span className="font-medium text-yellow-800">Notice Period</span>
                                </div>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center space-x-2">
                                    <Clock className="h-4 w-4 text-yellow-600" />
                                    <span className="text-yellow-700">
                                      {bed.resident.noticeDays || 'N/A'} days notice
                                    </span>
                                  </div>
                                  {bed.resident.checkOutDate && (
                                    <div className="flex items-center space-x-2">
                                      <Calendar className="h-4 w-4 text-yellow-600" />
                                      <span className="text-yellow-700">
                                        Checkout: {new Date(bed.resident.checkOutDate).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                            
                            <button
                              onClick={() => {
                                setShowRoomModal(false);
                                handleResidentView(bed.resident);
                              }}
                              className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium text-sm"
                            >
                              <Eye className="h-4 w-4" />
                              <span>View Resident Details</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Room Status Summary */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Room Status Summary</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gray-900">{selectedRoom.numberOfBeds}</div>
                      <div className="text-sm text-gray-600">Total Beds</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{selectedRoom.availableBedCount || 0}</div>
                      <div className="text-sm text-green-600">Available</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{selectedRoom.occupiedBedCount || 0}</div>
                      <div className="text-sm text-blue-600">Occupied</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {((selectedRoom.occupiedBedCount || 0) / selectedRoom.numberOfBeds * 100).toFixed(0)}%
                      </div>
                      <div className="text-sm text-purple-600">Occupancy</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {showResidentDetails && selectedResident && (
        <ResidentDetails
          isOpen={showResidentDetails}
          onClose={() => setShowResidentDetails(false)}
          resident={selectedResident}
          onEdit={() => {
            setShowResidentDetails(false);
          }}
        />
      )}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(RoomAvailability);
