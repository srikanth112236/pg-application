import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Users, 
  Bed, 
  MapPin,
  DollarSign,
  Search,
  Filter,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { api } from '../../services/auth.service';

const RoomManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const [rooms, setRooms] = useState([]);
  const [floors, setFloors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSharingType, setFilterSharingType] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    roomNumber: '',
    floorId: '',
    numberOfBeds: 1,
    sharingType: '',
    cost: '',
    description: '',
    bedNumbers: [] // Array to store custom bed numbers
  });

  useEffect(() => {
    fetchRooms();
    fetchFloors();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await api.get('/pg/rooms');
      
      if (response.data.success) {
        setRooms(response.data.data || []);
      } else {
        toast.error(response.data.message || 'Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
      toast.error('Failed to fetch rooms');
    } finally {
      setLoading(false);
    }
  };

  const fetchFloors = async () => {
    try {
      const response = await api.get('/pg/floors');
      
      if (response.data.success) {
        setFloors(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching floors:', error);
    }
  };

  const handleCreateRoom = async () => {
    try {
      setLoading(true);
      
      // Prepare room data with bed numbers
      const roomData = {
        ...formData,
        bedNumbers: formData.bedNumbers.filter(bed => bed.trim() !== '') // Only send non-empty bed numbers
      };
      
      const response = await api.post('/pg/rooms', roomData);
      
      if (response.data.success) {
        toast.success('Room created successfully!');
        setShowCreateModal(false);
        resetForm();
        fetchRooms();
      } else {
        toast.error(response.data.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      toast.error('Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = async () => {
    try {
      setLoading(true);
      
      // Prepare room data with bed numbers
      const roomData = {
        ...formData,
        bedNumbers: formData.bedNumbers.filter(bed => bed.trim() !== '') // Only send non-empty bed numbers
      };
      
      const response = await api.put(`/pg/rooms/${selectedRoom._id}`, roomData);
      
      if (response.data.success) {
        toast.success('Room updated successfully!');
        setShowEditModal(false);
        resetForm();
        fetchRooms();
      } else {
        toast.error(response.data.message || 'Failed to update room');
      }
    } catch (error) {
      console.error('Error updating room:', error);
      toast.error('Failed to update room');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.delete(`/pg/rooms/${roomId}`);
      
      if (response.data.success) {
        toast.success('Room deleted successfully!');
        fetchRooms();
      } else {
        toast.error(response.data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      toast.error('Failed to delete room');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roomNumber: '',
      floorId: '',
      numberOfBeds: 1,
      sharingType: '',
      cost: '',
      description: '',
      bedNumbers: []
    });
    setSelectedRoom(null);
  };

  const openEditModal = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      floorId: room.floorId._id,
      numberOfBeds: room.numberOfBeds,
      sharingType: room.sharingType,
      cost: room.cost,
      description: room.description || '',
      bedNumbers: room.beds?.map(bed => bed.bedNumber) || []
    });
    setShowEditModal(true);
  };

  // Handle bed number changes
  const handleBedNumberChange = (index, value) => {
    const newBedNumbers = [...formData.bedNumbers];
    newBedNumbers[index] = value;
    setFormData({ ...formData, bedNumbers: newBedNumbers });
  };

  // Add bed number field
  const addBedNumber = () => {
    if (formData.bedNumbers.length < formData.numberOfBeds) {
      setFormData({
        ...formData,
        bedNumbers: [...formData.bedNumbers, '']
      });
    }
  };

  // Remove bed number field
  const removeBedNumber = (index) => {
    const newBedNumbers = formData.bedNumbers.filter((_, i) => i !== index);
    setFormData({ ...formData, bedNumbers: newBedNumbers });
  };

  // Update bed numbers when numberOfBeds changes
  const handleNumberOfBedsChange = (value) => {
    const newNumberOfBeds = parseInt(value);
    setFormData({
      ...formData,
      numberOfBeds: newNumberOfBeds,
      bedNumbers: formData.bedNumbers.slice(0, newNumberOfBeds)
    });
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = !filterSharingType || room.sharingType === filterSharingType;
    return matchesSearch && matchesFilter;
  });

  const sharingTypes = [
    { id: '1-sharing', name: 'Single Occupancy', description: 'One person per room' },
    { id: '2-sharing', name: 'Double Sharing', description: 'Two people per room' },
    { id: '3-sharing', name: 'Triple Sharing', description: 'Three people per room' },
    { id: '4-sharing', name: 'Quad Sharing', description: 'Four people per room' }
  ];

  const renderBedStatus = (room) => {
    const availableBeds = room.availableBedsCount || 0;
    const occupiedBeds = room.occupiedBedsCount || 0;
    const totalBeds = room.numberOfBeds;

    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <Bed className="h-4 w-4 text-blue-600" />
          <span className="text-sm font-medium">{availableBeds}/{totalBeds}</span>
        </div>
        <span className="text-xs text-gray-500">available</span>
      </div>
    );
  };

  const renderBedNumbers = (room) => {
    if (!room.beds || room.beds.length === 0) {
      return <span className="text-sm text-gray-500">No beds configured</span>;
    }

    const bedNumbers = room.beds.map(bed => bed.bedNumber).join(', ');
    return (
      <div className="text-sm text-gray-600">
        <span className="font-medium">Beds:</span> {bedNumbers}
      </div>
    );
  };

  const renderRoomCard = (room) => (
    <motion.div
      key={room._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Room {room.roomNumber}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                Floor {room.floorId?.floorNumber || 'N/A'}
              </span>
              <span className="flex items-center">
                <Users className="h-4 w-4 mr-1" />
                {sharingTypes.find(t => t.id === room.sharingType)?.name || room.sharingType}
              </span>
            </div>
            {renderBedNumbers(room)}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {room.isOccupied ? (
            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
              Occupied
            </span>
          ) : (
            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
              Available
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Monthly Rent:</span>
            <span className="font-semibold text-green-600">₹{room.cost?.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Total Beds:</span>
            <span className="font-medium">{room.numberOfBeds}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Available Beds:</span>
            {renderBedStatus(room)}
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Occupied Beds:</span>
            <span className="font-medium text-red-600">{room.occupiedBedsCount || 0}</span>
          </div>
        </div>
      </div>

      {room.description && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700">{room.description}</p>
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openEditModal(room)}
            className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => handleDeleteRoom(room._id)}
            className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </button>
        </div>
        <button
          onClick={() => {/* TODO: View room details */}}
          className="flex items-center px-3 py-1 text-sm text-gray-600 hover:text-gray-700 transition-colors"
        >
          View Details
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </motion.div>
  );

  const renderCreateModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Create New Room</h2>
          <button
            onClick={() => setShowCreateModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 101"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
            <select
              value={formData.floorId}
              onChange={(e) => setFormData({ ...formData, floorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Floor</option>
              {floors.map(floor => (
                <option key={floor._id} value={floor._id}>
                  Floor {floor.floorNumber} - {floor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Beds</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.numberOfBeds}
              onChange={(e) => handleNumberOfBedsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bed Numbers Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bed Numbers (Optional)
              <span className="text-xs text-gray-500 ml-1">
                Leave empty to auto-generate (1, 2, 3...)
              </span>
            </label>
            
            <div className="space-y-2">
              {Array.from({ length: formData.numberOfBeds }, (_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-sm text-gray-600 w-8">Bed {index + 1}:</span>
                    <input
                      type="text"
                      value={formData.bedNumbers[index] || ''}
                      onChange={(e) => handleBedNumberChange(index, e.target.value)}
                      placeholder={`Auto: ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  {formData.bedNumbers[index] && (
                    <button
                      type="button"
                      onClick={() => handleBedNumberChange(index, '')}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              💡 Tip: You can use custom names like "A", "B", "Upper", "Lower", or numbers like "1A", "1B"
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sharing Type</label>
            <select
              value={formData.sharingType}
              onChange={(e) => setFormData({ ...formData, sharingType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Sharing Type</option>
              {sharingTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 8000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Room description..."
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowCreateModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateRoom}
            disabled={loading || !formData.roomNumber || !formData.floorId || !formData.sharingType || !formData.cost}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Creating...' : 'Create Room'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderEditModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">Edit Room</h2>
          <button
            onClick={() => setShowEditModal(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Room Number</label>
            <input
              type="text"
              value={formData.roomNumber}
              onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Floor</label>
            <select
              value={formData.floorId}
              onChange={(e) => setFormData({ ...formData, floorId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Floor</option>
              {floors.map(floor => (
                <option key={floor._id} value={floor._id}>
                  Floor {floor.floorNumber} - {floor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Number of Beds</label>
            <input
              type="number"
              min="1"
              max="10"
              value={formData.numberOfBeds}
              onChange={(e) => handleNumberOfBedsChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Bed Numbers Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bed Numbers (Optional)
              <span className="text-xs text-gray-500 ml-1">
                Leave empty to auto-generate (1, 2, 3...)
              </span>
            </label>
            
            <div className="space-y-2">
              {Array.from({ length: formData.numberOfBeds }, (_, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 flex-1">
                    <span className="text-sm text-gray-600 w-8">Bed {index + 1}:</span>
                    <input
                      type="text"
                      value={formData.bedNumbers[index] || ''}
                      onChange={(e) => handleBedNumberChange(index, e.target.value)}
                      placeholder={`Auto: ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                  </div>
                  {formData.bedNumbers[index] && (
                    <button
                      type="button"
                      onClick={() => handleBedNumberChange(index, '')}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Clear
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <div className="mt-2 text-xs text-gray-500">
              💡 Tip: You can use custom names like "A", "B", "Upper", "Lower", or numbers like "1A", "1B"
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sharing Type</label>
            <select
              value={formData.sharingType}
              onChange={(e) => setFormData({ ...formData, sharingType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Sharing Type</option>
              {sharingTypes.map(type => (
                <option key={type.id} value={type.id}>
                  {type.name} - {type.description}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Monthly Rent (₹)</label>
            <input
              type="number"
              min="0"
              value={formData.cost}
              onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
            />
          </div>
        </div>

        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={() => setShowEditModal(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleEditRoom}
            disabled={loading || !formData.roomNumber || !formData.floorId || !formData.sharingType || !formData.cost}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Updating...' : 'Update Room'}
          </button>
        </div>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Room Management</h1>
              <p className="text-gray-600">Manage rooms, beds, and occupancy</p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Room
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <select
                value={filterSharingType}
                onChange={(e) => setFilterSharingType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Sharing Types</option>
                {sharingTypes.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center justify-end">
              <span className="text-sm text-gray-600">
                {filteredRooms.length} room{filteredRooms.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading rooms...</p>
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No rooms found</h3>
              <p className="text-gray-600 mb-4">Get started by creating your first room</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add First Room
              </button>
            </div>
          ) : (
            <AnimatePresence>
              {filteredRooms.map(renderRoomCard)}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showCreateModal && renderCreateModal()}
        {showEditModal && renderEditModal()}
      </AnimatePresence>
    </div>
  );
};

export default RoomManagement; 