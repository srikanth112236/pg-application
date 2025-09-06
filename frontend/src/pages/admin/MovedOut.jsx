import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Trash2, 
  Eye, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Building2, 
  Bed, 
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  LogOut,
  Star,
  Crown,
  Shield,
  Heart,
  Zap,
  TrendingUp,
  MoreVertical,
  ExternalLink,
  Copy,
  MessageCircle,
  CreditCard,
  FileText,
  Camera,
  Wifi,
  Car,
  Dumbbell,
  Tv,
  Coffee,
  Home,
  Briefcase,
  GraduationCap,
  MapPin as LocationIcon,
  UserPlus,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import ResidentDetails from '../../components/admin/ResidentDetails';
import DeleteConfirmModal from '../../components/common/DeleteConfirmModal';
import { selectSelectedBranch } from '../../store/slices/branch.slice';

const MovedOut = () => {
  const { user } = useSelector((state) => state.auth);
  const selectedBranch = useSelector(selectSelectedBranch);
  const [movedOutResidents, setMovedOutResidents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [stats, setStats] = useState({
    total: 0,
    inactive: 0,
    movedOut: 0,
    thisMonth: 0
  });

  const navigate = useNavigate();

  // Fetch moved out residents
  const fetchMovedOutResidents = async () => {
    if (!selectedBranch) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        branchId: selectedBranch._id,
        status: 'inactive,moved_out'
      });
      
      if (genderFilter !== 'all') params.append('gender', genderFilter);

      console.log('🔍 Fetching moved out residents with params:', params.toString());

      const response = await fetch(`/api/residents?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      console.log('📊 Moved out residents response:', data);
      
      if (data.success) {
        console.log(`✅ Found ${data.data.residents.length} moved out residents`);
        setMovedOutResidents(data.data.residents || []);
        setTotalPages(data.data.pagination.totalPages);
      } else {
        console.error('❌ Failed to fetch moved out residents:', data.message);
        toast.error(data.message || 'Failed to fetch moved out residents');
      }
    } catch (error) {
      console.error('❌ Error fetching moved out residents:', error);
      toast.error('Failed to fetch moved out residents');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    if (!selectedBranch) return;
    try {
      const params = new URLSearchParams({
        branchId: selectedBranch._id
      });
      const response = await fetch(`/api/residents/stats/overview?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      const data = await response.json();
      if (data.success) {
        const statsData = data.data;
        setStats({
          total: statsData.total || 0,
          inactive: statsData.inactive || 0,
          movedOut: statsData.movedOut || 0,
          thisMonth: statsData.thisMonth || 0
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    if (selectedBranch) {
      fetchMovedOutResidents();
      fetchStats();
    }
  }, [selectedBranch, currentPage, genderFilter]);

  const handleResidentView = (resident) => {
    setSelectedResident(resident);
    setShowDetails(true);
  };

  const handleResidentEdit = (resident) => {
    navigate(`/admin/residents/edit/${resident._id}`);
  };

  const handleResidentDelete = (resident) => {
    setResidentToDelete(resident);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!residentToDelete) return;
    
    try {
      const response = await fetch(`/api/residents/${residentToDelete._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Resident deleted successfully');
        fetchMovedOutResidents();
        fetchStats();
      } else {
        toast.error(data.message || 'Failed to delete resident');
      }
    } catch (error) {
      console.error('Error deleting resident:', error);
      toast.error('Failed to delete resident');
    } finally {
      setShowDeleteModal(false);
      setResidentToDelete(null);
    }
  };

  const handleReOnboard = (resident) => {
    navigate('/admin/onboarding', { 
      state: { 
        preSelectedResident: resident,
        mode: 're-onboard'
      }
    });
  };

  const filteredResidents = movedOutResidents.filter(resident => {
    const searchLower = searchTerm.toLowerCase();
    return (
      resident.firstName?.toLowerCase().includes(searchLower) ||
      resident.lastName?.toLowerCase().includes(searchLower) ||
      resident.phone?.includes(searchTerm) ||
      resident.email?.toLowerCase().includes(searchLower)
    );
  });

  console.log('🔍 Debug - movedOutResidents:', movedOutResidents.length);
  console.log('🔍 Debug - filteredResidents:', filteredResidents.length);
  console.log('🔍 Debug - searchTerm:', searchTerm);

  const getResidentAvatar = (resident) => {
    const initials = `${resident.firstName?.charAt(0) || ''}${resident.lastName?.charAt(0) || ''}`.toUpperCase();
    const colors = ['bg-blue-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-green-500'];
    const colorIndex = (resident.firstName?.length || 0) % colors.length;
    
    return (
      <div className={`w-12 h-12 rounded-full ${colors[colorIndex]} flex items-center justify-center text-white font-semibold text-lg`}>
        {initials || '?'}
      </div>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      inactive: { color: 'bg-red-100 text-red-800', icon: LogOut },
      moved_out: { color: 'bg-gray-100 text-gray-800', icon: LogOut }
    };
    
    const config = statusConfig[status] || statusConfig.inactive;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Admin privileges required to access moved out residents.</p>
        </div>
      </div>
    );
  }

  if (!selectedBranch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Moved Out Residents</h1>
          <p className="text-gray-600">Please select a branch from the header to continue.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/admin/residents')}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl shadow-lg">
                  <LogOut className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Moved Out Residents</h1>
                  <p className="text-gray-600">Manage residents who have vacated from {selectedBranch?.name || 'your PG'}</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  fetchMovedOutResidents();
                  fetchStats();
                }}
                className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Moved Out</p>
                <p className="text-3xl font-bold text-gray-900">{stats.movedOut}</p>
                <p className="text-sm text-gray-500">All time</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl">
                <LogOut className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Month Moved Out</p>
                <p className="text-3xl font-bold text-gray-900">{stats.thisMonth}</p>
                <p className="text-sm text-gray-500">Recent departures</p>
              </div>
              <div className="p-3 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl">
                <Calendar className="h-6 w-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search moved out residents by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
              
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'table'
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Table
                </button>
              </div>
              
              <button className="flex items-center px-4 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Residents Display */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredResidents.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center"
          >
            <div className="w-20 h-20 bg-gradient-to-br from-gray-400 to-slate-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <LogOut className="h-10 w-10 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No moved out residents found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm ? 'No residents match your search criteria.' : 'All residents are currently active.'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear Search
              </button>
            )}
          </motion.div>
        ) : viewMode === 'grid' ? (
          // Grid View
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResidents.map((resident, index) => (
              <motion.div
                key={resident._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-2xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    {getResidentAvatar(resident)}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-900 text-lg">
                          {resident.firstName} {resident.lastName}
                        </h4>
                      </div>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        <Mail className="w-3 h-3" />
                        {resident.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(resident.status)}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleResidentView(resident)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 hover:scale-110"
                        title="View details"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleResidentEdit(resident)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Edit resident"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleResidentDelete(resident)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:scale-110"
                        title="Delete resident"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                        <Phone className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Phone</p>
                        <p className="text-sm font-semibold text-gray-900">{resident.phone}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-green-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Last Room</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {resident.roomNumber ? `Room ${resident.roomNumber}` : 'Not assigned'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-xs text-gray-500 font-medium">Check-out Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {resident.checkOutDate ? new Date(resident.checkOutDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <button 
                    onClick={() => handleReOnboard(resident)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                  >
                    <UserPlus className="w-3 h-3" />
                    Re-onboard
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200">
                    <MessageCircle className="w-3 h-3" />
                    Contact
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          // Table View
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Resident
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredResidents.map((resident, index) => (
                    <motion.tr
                      key={resident._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {getResidentAvatar(resident)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {resident.firstName} {resident.lastName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {resident.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{resident.phone}</div>
                        <div className="text-sm text-gray-500">{resident.gender}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {resident.roomNumber ? `Room ${resident.roomNumber}` : 'Not assigned'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {resident.bedNumber ? `Bed ${resident.bedNumber}` : 'No bed'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {resident.checkOutDate ? new Date(resident.checkOutDate).toLocaleDateString() : 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {resident.checkOutDate ? new Date(resident.checkOutDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(resident.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleResidentView(resident)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResidentEdit(resident)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                            title="Edit resident"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResidentDelete(resident)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete resident"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleReOnboard(resident)}
                            className="text-indigo-600 hover:text-indigo-900 p-1 rounded hover:bg-indigo-50"
                            title="Re-onboard"
                          >
                            <UserPlus className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <span className="px-3 py-2 text-sm font-medium text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resident Details Modal */}
      <AnimatePresence>
        {showDetails && selectedResident && (
          <ResidentDetails
            resident={selectedResident}
            onClose={() => {
              setShowDetails(false);
              setSelectedResident(null);
            }}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && residentToDelete && (
          <DeleteConfirmModal
            isOpen={showDeleteModal}
            title="Delete Resident"
            message={`Are you sure you want to permanently delete ${residentToDelete.firstName} ${residentToDelete.lastName}? This action cannot be undone.`}
            onConfirm={confirmDelete}
            onCancel={() => {
              setShowDeleteModal(false);
              setResidentToDelete(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MovedOut; 