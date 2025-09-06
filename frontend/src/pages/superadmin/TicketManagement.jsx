import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  User,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  MoreVertical,
  Users,
  MessageSquare,
  Star,
  ChevronDown,
  ChevronUp,
  Building2,
  Calendar,
  Phone,
  MapPin,
  AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import ticketService from '../../services/ticket.service';
// Modals removed in favor of a dedicated details page with inline sections

const TicketManagement = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    category: '',
    pg: '',
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const navigate = useNavigate();
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'table'

  // Load tickets and stats
  useEffect(() => {
    loadTickets();
    loadStats();
  }, [filters]);

  // Auto-refresh to reflect status changes across clients
  useEffect(() => {
    const intervalId = setInterval(() => {
      loadTickets();
      loadStats();
    }, 15000); // refresh every 15s
    return () => clearInterval(intervalId);
  }, []);

  const loadTickets = async () => {
    try {
      setLoading(true);
      const response = await ticketService.getTickets(filters);
      if (response.success) {
        const formattedTickets = response.data.map(ticket => 
          ticketService.formatTicketData(ticket)
        );
        setTickets(formattedTickets);
      }
    } catch (error) {
      toast.error('Failed to load tickets');
      console.error('Error loading tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await ticketService.getTicketStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };



  const handleViewTicket = (ticket) => {
    setSelectedTicket(ticket);
    navigate(`/superadmin/tickets/${ticket._id}?section=overview`);
  };

  const handleAssignTicket = (ticket) => {
    setSelectedTicket(ticket);
    navigate(`/superadmin/tickets/${ticket._id}?section=assign`);
  };

  const handleResolveTicket = (ticket) => {
    setSelectedTicket(ticket);
    setShowResolveModal(true);
  };

  const handleUpdatePriority = (ticket) => {
    setSelectedTicket(ticket);
    navigate(`/superadmin/tickets/${ticket._id}?section=priority`);
  };

  const handleCloseTicket = async (ticketId) => {
    try {
      setActionLoading(true);
      const response = await ticketService.closeTicket(ticketId);
      if (response.success) {
        toast.success('Ticket closed successfully');
        loadTickets();
        loadStats();
      } else {
        toast.error(response.message || 'Failed to close ticket');
      }
    } catch (error) {
      toast.error('Failed to close ticket');
      console.error('Error closing ticket:', error);
    } finally {
      setActionLoading(false);
    }
  };



  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      category: '',
      pg: '',
      search: ''
    });
  };

  const getStatusIcon = (status) => {
    const icons = {
      open: <AlertCircle className="h-4 w-4 text-blue-600" />,
      in_progress: <Clock className="h-4 w-4 text-yellow-600" />,
      resolved: <CheckCircle className="h-4 w-4 text-green-600" />,
      closed: <CheckCircle className="h-4 w-4 text-gray-600" />,
      cancelled: <XCircle className="h-4 w-4 text-red-600" />
    };
    return icons[status] || <AlertCircle className="h-4 w-4 text-gray-600" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      resolved: 'bg-green-50 text-green-700 border-green-200',
      closed: 'bg-gray-50 text-gray-700 border-gray-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[status] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-green-50 text-green-700 border-green-200',
      medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      high: 'bg-orange-50 text-orange-700 border-orange-200',
      urgent: 'bg-red-50 text-red-700 border-red-200'
    };
    return colors[priority] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const TicketCard = ({ ticket }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 overflow-hidden transform hover:-translate-y-1"
    >
      {/* Status Indicator Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${getStatusColor(ticket.status).replace('border', 'bg').replace('text', 'bg').replace('bg-gray', 'bg-blue').replace('bg-red', 'bg-red').replace('bg-green', 'bg-green').replace('bg-yellow', 'bg-yellow').replace('bg-orange', 'bg-orange')}`} />
      
      <div className="p-6">
        {/* Header with Gradient Background */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl opacity-50" />
          <div className="relative flex items-start justify-between">
            <div className="flex-1 pr-4">
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                {ticket.title}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
                {ticket.description}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getStatusColor(ticket.status)}`}>
                {getStatusIcon(ticket.status)}
                <span className="ml-1.5 capitalize">{ticket.status.replace('_', ' ')}</span>
              </span>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${getPriorityColor(ticket.priority)}`}>
                <span className="w-2 h-2 rounded-full bg-current mr-2" />
                {ticket.priority}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Details Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Building2 className="h-4 w-4 mr-3 text-indigo-500" />
            <div>
              <p className="text-xs text-gray-500 font-medium">PG Property</p>
              <p className="text-sm font-semibold text-gray-900">{ticket.pg?.name || 'N/A'}</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <User className="h-4 w-4 mr-3 text-purple-500" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Created By</p>
              <p className="text-sm font-semibold text-gray-900">{ticket.user?.firstName} {ticket.user?.lastName}</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <Calendar className="h-4 w-4 mr-3 text-green-500" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Created</p>
              <p className="text-sm font-semibold text-gray-900">{ticket.formattedCreatedAt}</p>
            </div>
          </div>
          <div className="flex items-center p-3 bg-gray-50 rounded-lg">
            <MapPin className="h-4 w-4 mr-3 text-orange-500" />
            <div>
              <p className="text-xs text-gray-500 font-medium">Location</p>
              <p className="text-sm font-semibold text-gray-900">
                {ticket.location?.room && `Room ${ticket.location.room}`}
                {ticket.location?.floor && ` | Floor ${ticket.location.floor}`}
              </p>
            </div>
          </div>
        </div>

        {/* Enhanced Assigned To Section */}
        {ticket.assignedTo && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-blue-600 font-semibold">ASSIGNED TO</p>
                <p className="text-sm font-bold text-blue-900">
                  {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleViewTicket(ticket)}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 hover:text-blue-700 transition-all duration-200 shadow-sm"
            >
              <Eye className="h-4 w-4 mr-2" />
              View
            </button>
            
            <button
              onClick={() => handleUpdatePriority(ticket)}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 shadow-sm"
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              Priority
            </button>
            
            {ticket.status === 'open' && (
              <button
                onClick={() => handleAssignTicket(ticket)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 rounded-xl hover:bg-green-100 hover:text-green-700 transition-all duration-200 shadow-sm"
              >
                <User className="h-4 w-4 mr-2" />
                Assign
              </button>
            )}
            
            {ticket.status === 'in_progress' && (
              <button
                onClick={() => handleResolveTicket(ticket)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-orange-600 bg-orange-50 rounded-xl hover:bg-orange-100 hover:text-orange-700 transition-all duration-200 shadow-sm"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Resolve
              </button>
            )}
            
            {ticket.status === 'resolved' && (
              <button
                onClick={() => handleCloseTicket(ticket._id)}
                disabled={actionLoading}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl hover:bg-gray-100 hover:text-gray-700 transition-all duration-200 shadow-sm disabled:opacity-50"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Close
              </button>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-1 rounded">
              #{ticket._id.slice(-6)}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Ticket Management</h1>
          <p className="text-gray-600 mt-1">Manage all support tickets from different PGs</p>
        </div>
        <div className="flex items-center space-x-3 mt-4 sm:mt-0">
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'cards' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-500 rounded-xl">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-blue-700">Total Tickets</p>
              <p className="text-2xl font-bold text-blue-900">{stats.total || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-6 rounded-xl border border-yellow-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-yellow-500 rounded-xl">
              <AlertCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-yellow-700">Open</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.open || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-orange-500 rounded-xl">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-orange-700">In Progress</p>
              <p className="text-2xl font-bold text-orange-900">{stats.inProgress || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-green-500 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-green-700">Resolved</p>
              <p className="text-2xl font-bold text-green-900">{stats.resolved || 0}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-gray-50 to-gray-100 p-6 rounded-xl border border-gray-200"
        >
          <div className="flex items-center">
            <div className="p-3 bg-gray-500 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-700">Closed</p>
              <p className="text-2xl font-bold text-gray-900">{stats.closed || 0}</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search tickets..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filters
              {showFilters ? <ChevronUp className="h-4 w-4 ml-2" /> : <ChevronDown className="h-4 w-4 ml-2" />}
            </button>
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors"
            >
              Clear
            </button>
            <button className="flex items-center px-4 py-3 text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors">
              <Download className="h-5 w-5 mr-2" />
              Export
            </button>
          </div>
        </div>

        {/* Filter Options */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 pt-6 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Status</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={filters.priority}
                    onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Categories</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="billing">Billing</option>
                    <option value="complaint">Complaint</option>
                    <option value="suggestion">Suggestion</option>
                    <option value="emergency">Emergency</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PG</label>
                  <select
                    value={filters.pg}
                    onChange={(e) => setFilters({ ...filters, pg: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All PGs</option>
                    {/* This would be populated with actual PG data */}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tickets List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Tickets Found</h3>
            <p className="text-gray-600 mb-4">No tickets match your current filters.</p>
          </div>
        ) : viewMode === 'cards' ? (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tickets.map((ticket) => (
                <TicketCard key={ticket._id} ticket={ticket} />
              ))}
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ticket Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    PG
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {tickets.map((ticket) => (
                  <motion.tr
                    key={ticket._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{ticket.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{ticket.description}</div>
                        <div className="text-xs text-gray-400">
                          {ticket.location?.room && `Room: ${ticket.location.room}`}
                          {ticket.location?.floor && ` | Floor: ${ticket.location.floor}`}
                          {ticket.location?.building && ` | Building: ${ticket.location.building}`}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.pg?.name || 'N/A'}</div>
                      <div className="text-xs text-gray-500">{ticket.user?.firstName} {ticket.user?.lastName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(ticket.status)}
                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ticket.statusColor}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${ticket.priorityColor}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.formattedCreatedAt}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewTicket(ticket)}
                          className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleUpdatePriority(ticket)}
                          className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                          title="Update Priority"
                        >
                          <AlertTriangle className="h-4 w-4" />
                        </button>
                        {ticket.status === 'open' && (
                          <button 
                            onClick={() => handleAssignTicket(ticket)}
                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 transition-colors"
                            title="Assign Ticket"
                          >
                            <User className="h-4 w-4" />
                          </button>
                        )}
                        {ticket.status === 'in_progress' && (
                          <button 
                            onClick={() => handleResolveTicket(ticket)}
                            className="text-orange-600 hover:text-orange-900 p-1 rounded hover:bg-orange-50 transition-colors"
                            title="Resolve Ticket"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        {ticket.status === 'resolved' && (
                          <button 
                            onClick={() => handleCloseTicket(ticket._id)}
                            disabled={actionLoading}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded hover:bg-gray-50 transition-colors disabled:opacity-50"
                            title="Close Ticket"
                          >
                            <XCircle className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details now handled in dedicated page at /superadmin/tickets/:id */}
    </div>
  );
};

export default TicketManagement; 