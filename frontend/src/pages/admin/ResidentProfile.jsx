import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  FileText, 
  CreditCard, 
  ArrowLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Bed,
  Building2,
  Download,
  Eye,
  Edit,
  Trash2,
  Star,
  Clock,
  Home,
  CreditCard as PaymentIcon,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  FileDown,
  Receipt,
  DollarSign,
  X,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/auth.service';

const ResidentProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  
  const [resident, setResident] = useState(null);
  const [allocationLetters, setAllocationLetters] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [downloadingLetter, setDownloadingLetter] = useState(false);

  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);

  useEffect(() => {
    console.log('🔍 ResidentProfile: Component mounted with ID:', id);
    if (id) {
      fetchResidentDetails();
      fetchAllocationLetters();
      fetchPayments();
    } else {
      console.error('❌ ResidentProfile: No ID provided in URL parameters');
    }
  }, [id]);

  // Auto-refresh payments when payments tab is selected
  useEffect(() => {
    if (activeTab === 'payments' && id) {
      refreshPaymentData();
    }
  }, [activeTab, id]);

  // Real-time refresh function
  const refreshPaymentData = async () => {
    try {
      // First update payment status from backend
      await api.put(`/residents/${id}/payment-status`);
      
      // Then refresh payment data and resident details
      await fetchPayments();
      await fetchResidentDetails(); // Also refresh resident details to get updated payment status
    } catch (error) {
      console.error('Error refreshing payment data:', error);
      // Still try to fetch data even if status update fails
      await fetchPayments();
      await fetchResidentDetails();
    }
  };

  const fetchResidentDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/residents/${id}/details`);
      
      if (response.data.success) {
        const residentData = response.data.data;
        
        // Get current month and year for payment status check
        const currentDate = new Date();
        const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' });
        const currentYear = currentDate.getFullYear();
        
        // Check if there's already a payment for current month
        try {
          const paymentResponse = await api.get(`/payments/resident/${id}`);
          if (paymentResponse.data.success) {
            const payments = paymentResponse.data.data || [];
            const hasCurrentMonthPayment = payments.some(payment => 
              payment.month === currentMonth && 
              payment.year === currentYear && 
              payment.isActive === true
            );
            
            // Add current month payment status to resident data
            residentData.hasCurrentMonthPayment = hasCurrentMonthPayment;
          }
        } catch (error) {
          console.error('Error checking current month payment:', error);
          residentData.hasCurrentMonthPayment = false;
        }
        
        setResident(residentData);
      } else {
        toast.error(response.data.message || 'Failed to fetch resident details');
      }
    } catch (error) {
      console.error('Error fetching resident details:', error);
      toast.error('Failed to fetch resident details');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllocationLetters = async () => {
    try {
      const response = await api.get(`/residents/${id}/allocation-letters`);
      
      if (response.data.success) {
        setAllocationLetters(response.data.data || []);
      }
    } catch (error) {
      console.error('Error fetching allocation letters:', error);
    }
  };

  const fetchDocuments = async () => {
    // For now, we'll only show allocation letters
    // Later we can integrate with the document system
    setDocuments([]);
  };

  // Get allocation letters for display
  const getAllocationLetters = () => {
    if (!allocationLetters || allocationLetters.length === 0) {
      return [];
    }
    
    return allocationLetters.map(letter => ({
      _id: letter._id,
      originalName: `Allocation Letter - ${resident?.firstName} ${resident?.lastName}`,
      documentType: 'allocation_letter',
      fileSize: 1024 * 50, // 50KB dummy size
      createdAt: letter.createdAt || new Date(),
      downloadCount: letter.downloadCount || 0,
      metadata: {
        description: 'Room allocation letter generated during onboarding'
      },
      isPreviewAvailable: true,
      previewData: letter.previewData,
      isAllocationLetter: true
    }));
  };



  const fetchPayments = async () => {
    try {
      const response = await api.get(`/payments/resident/${id}`);
      
      if (response.data.success) {
        const paymentData = response.data.data || [];
        
        // Transform the payment data to match our UI format
        const transformedPayments = paymentData.map(payment => ({
          _id: payment._id,
          month: `${payment.month} ${payment.year}`,
          amount: payment.amount,
          status: payment.status,
          dueDate: payment.paymentDate, // Using payment date as due date for now
          paidDate: payment.status === 'paid' ? payment.paymentDate : null,
          paymentMethod: payment.paymentMethod || 'Not specified',
          receiptNumber: payment._id.slice(-6).toUpperCase(), // Using last 6 chars of ID as receipt number
          markedBy: payment.markedBy,
          markedAt: payment.markedAt,
          receiptImage: payment.receiptImage
        }));
        
        setPayments(transformedPayments);
      } else {
        console.error('Failed to fetch payments:', response.data.message);
        // Fallback to empty array if API fails
        setPayments([]);
      }
    } catch (error) {
      console.error('Error fetching payments:', error);
      // Fallback to empty array if API fails
      setPayments([]);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'notice_period':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'inactive':
        return 'Inactive';
      case 'notice_period':
        return 'Notice Period';
      default:
        return 'Unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', text: 'Active' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      inactive: { color: 'bg-gray-100 text-gray-800', text: 'Inactive' },
      moved_out: { color: 'bg-red-100 text-red-800', text: 'Moved Out' },
      notice_period: { color: 'bg-orange-100 text-orange-800', text: 'Notice Period' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentStatusBadge = (status) => {
    const statusConfig = {
      paid: { color: 'bg-green-100 text-green-800', text: 'Paid' },
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      overdue: { color: 'bg-red-100 text-red-800', text: 'Overdue' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };



  const handleDocumentPreview = async (documentId) => {
    try {
      // Find the allocation letter by ID
      const letter = allocationLetters.find(l => l._id === documentId);
      
      if (letter && letter.previewData) {
        setPreviewDocument({
          fileName: `Allocation Letter - ${resident?.firstName} ${resident?.lastName}.pdf`,
          mimeType: 'application/pdf',
          previewData: letter.previewData
        });
        setShowDocumentPreview(true);
      } else {
        toast.error('Preview not available for this document');
      }
    } catch (error) {
      console.error('Error loading document preview:', error);
      toast.error('Failed to load document preview');
    }
  };

  const handleDocumentDownload = async (documentId) => {
    try {
      // Find the allocation letter by ID
      const letter = allocationLetters.find(l => l._id === documentId);
      
      if (letter && letter.previewData) {
        // Convert base64 to blob
        const byteCharacters = atob(letter.previewData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `Allocation Letter - ${resident?.firstName} ${resident?.lastName}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
        
        toast.success('Document downloaded successfully');
      } else {
        toast.error('Document not found');
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handlePaymentReceiptPreview = (payment) => {
    if (payment.receiptImage) {
      setPreviewDocument({
        fileName: payment.receiptImage.originalName || 'Payment Receipt',
        mimeType: payment.receiptImage.mimeType || 'image/jpeg',
        previewData: null, // We'll use the file path for images
        filePath: payment.receiptImage.filePath
      });
      setShowDocumentPreview(true);
    } else {
      toast.error('Receipt not available');
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 py-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 py-4">
        <div className="max-w-7xl mx-auto px-2 sm:px-4">
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Resident not found</h2>
            <p className="text-gray-500 mb-4">The resident you're looking for doesn't exist.</p>
            <button
              onClick={() => navigate('/admin/residents')}
              className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-500 text-white rounded-lg hover:from-sky-600 hover:to-blue-600 transition-all"
            >
              Back to Residents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 to-blue-50 py-4">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/admin/residents')}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Residents</span>
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
            {[
              { id: 'profile', label: 'Profile', icon: User },
              { id: 'documents', label: 'Documents', icon: FileText },
              { id: 'payments', label: 'Payments', icon: PaymentIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all ${
                    activeTab === tab.id
                      ? 'bg-white text-sky-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {activeTab === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Basic Information */}
                  <div className="space-y-6">
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2 text-sky-600" />
                        Basic Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Full Name:</span>
                          <span className="text-sm text-gray-900">{resident.firstName} {resident.lastName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Email:</span>
                          <span className="text-sm text-gray-900">{resident.email || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Phone:</span>
                          <span className="text-sm text-gray-900">{resident.phone}</span>
                        </div>
                        {resident.alternatePhone && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Alternate Phone:</span>
                            <span className="text-sm text-gray-900">{resident.alternatePhone}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Date of Birth:</span>
                          <span className="text-sm text-gray-900">{formatDate(resident.dateOfBirth)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Gender:</span>
                          <span className="text-sm text-gray-900 capitalize">{resident.gender}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Status:</span>
                          <span>{getStatusBadge(resident.status)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Address Information */}
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-5 w-5 mr-2 text-sky-600" />
                        Permanent Address
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Street:</span>
                          <span className="text-sm text-gray-900">{resident.permanentAddress?.street || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">City:</span>
                          <span className="text-sm text-gray-900">{resident.permanentAddress?.city || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">State:</span>
                          <span className="text-sm text-gray-900">{resident.permanentAddress?.state || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Pincode:</span>
                          <span className="text-sm text-gray-900">{resident.permanentAddress?.pincode || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Work Details */}
                    {resident.workDetails && (
                      <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                          <Building2 className="h-5 w-5 mr-2 text-sky-600" />
                          Work Details
                        </h3>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Company:</span>
                            <span className="text-sm text-gray-900">{resident.workDetails?.company || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Designation:</span>
                            <span className="text-sm text-gray-900">{resident.workDetails?.designation || 'Not provided'}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Work Address:</span>
                            <span className="text-sm text-gray-900">{resident.workDetails?.workAddress || 'Not provided'}</span>
                          </div>
                          {resident.workDetails?.workPhone && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Work Phone:</span>
                              <span className="text-sm text-gray-900">{resident.workDetails.workPhone}</span>
                            </div>
                          )}
                          {resident.workDetails?.workEmail && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Work Email:</span>
                              <span className="text-sm text-gray-900">{resident.workDetails.workEmail}</span>
                            </div>
                          )}
                          {resident.workDetails?.salary && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Salary:</span>
                              <span className="text-sm text-gray-900">₹{resident.workDetails.salary.toLocaleString()}</span>
                            </div>
                          )}
                          {resident.workDetails?.joiningDate && (
                            <div className="flex justify-between">
                              <span className="text-sm font-medium text-gray-600">Joining Date:</span>
                              <span className="text-sm text-gray-900">{formatDate(resident.workDetails.joiningDate)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Emergency Contact */}
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Phone className="h-5 w-5 mr-2 text-sky-600" />
                        Emergency Contact
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Name:</span>
                          <span className="text-sm text-gray-900">{resident.emergencyContact?.name || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Relationship:</span>
                          <span className="text-sm text-gray-900">{resident.emergencyContact?.relationship || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Phone:</span>
                          <span className="text-sm text-gray-900">{resident.emergencyContact?.phone || 'Not provided'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Address:</span>
                          <span className="text-sm text-gray-900">{resident.emergencyContact?.address || 'Not provided'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Room Assignment */}
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Building2 className="h-5 w-5 mr-2 text-sky-600" />
                        Room Assignment
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Room Number:</span>
                          <span className="text-sm text-gray-900">{resident.roomNumber || 'Unassigned'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Bed Number:</span>
                          <span className="text-sm text-gray-900">{resident.bedNumber || 'Not assigned'}</span>
                        </div>
                        {resident.roomId && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Room Type:</span>
                            <span className="text-sm text-gray-900">{resident.roomId?.sharingType || 'N/A'}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <PaymentIcon className="h-5 w-5 mr-2 text-sky-600" />
                        Payment Status
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Current Status:</span>
                          <span>{getPaymentStatusBadge(resident.paymentStatus === 'paid' || resident.hasCurrentMonthPayment ? 'paid' : resident.paymentStatus)}</span>
                        </div>
                        {resident.lastPaymentDate && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Last Payment:</span>
                            <span className="text-sm text-gray-900">{formatDate(resident.lastPaymentDate)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Rent Amount:</span>
                          <span className="text-sm text-gray-900">₹{resident.rentAmount || 8000}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Total Payments:</span>
                          <span className="text-sm text-gray-900">{payments.filter(p => p.status === 'paid').length} months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Pending Payments:</span>
                          <span className="text-sm text-gray-900">{payments.filter(p => p.status === 'pending').length} months</span>
                        </div>
                        {resident.hasCurrentMonthPayment && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">This Month:</span>
                            <span className="text-sm text-green-600 font-medium">✓ Paid</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Dates */}
                    <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                        <Calendar className="h-5 w-5 mr-2 text-sky-600" />
                        Important Dates
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Check-in Date:</span>
                          <span className="text-sm text-gray-900">{formatDate(resident.checkInDate)}</span>
                        </div>
                        {resident.checkOutDate && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Check-out Date:</span>
                            <span className="text-sm text-gray-900">{formatDate(resident.checkOutDate)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-gray-600">Contract Start:</span>
                          <span className="text-sm text-gray-900">{formatDate(resident.contractStartDate)}</span>
                        </div>
                        {resident.contractEndDate && (
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-600">Contract End:</span>
                            <span className="text-sm text-gray-900">{formatDate(resident.contractEndDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Additional Information */}
                    {(resident.dietaryRestrictions || resident.medicalConditions || resident.specialRequirements || resident.notes) && (
                      <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                        <div className="space-y-3">
                          {resident.dietaryRestrictions && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Dietary Restrictions:</span>
                              <p className="text-sm text-gray-900 mt-1">{resident.dietaryRestrictions}</p>
                            </div>
                          )}
                          {resident.medicalConditions && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Medical Conditions:</span>
                              <p className="text-sm text-gray-900 mt-1">{resident.medicalConditions}</p>
                            </div>
                          )}
                          {resident.specialRequirements && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Special Requirements:</span>
                              <p className="text-sm text-gray-900 mt-1">{resident.specialRequirements}</p>
                            </div>
                          )}
                          {resident.notes && (
                            <div>
                              <span className="text-sm font-medium text-gray-600">Notes:</span>
                              <p className="text-sm text-gray-900 mt-1">{resident.notes}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
                          {activeTab === 'documents' && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Allocation Letters Section */}
                  <div className="bg-gradient-to-br from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Allocation Letters</h3>
                    </div>
                    
                    {getAllocationLetters().length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No allocation letters found</p>
                        <p className="text-sm text-gray-400 mt-2">Allocation letters will appear here after onboarding</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {getAllocationLetters().map((letter) => (
                          <motion.div
                            key={letter._id}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-white p-4 rounded-xl border border-sky-200"
                          >
                            <div className="flex items-center space-x-3 mb-3">
                              <div className="text-2xl">📄</div>
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">{letter.originalName}</h4>
                                <p className="text-sm text-gray-500">Allocation Letter</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Size:</span>
                                <span className="font-medium">{Math.round(letter.fileSize / 1024)} KB</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Generated:</span>
                                <span className="font-medium">
                                  {new Date(letter.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Downloads:</span>
                                <span className="font-medium">{letter.downloadCount}</span>
                              </div>
                              {letter.metadata?.description && (
                                <div className="text-sm text-gray-600">
                                  {letter.metadata.description}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleDocumentPreview(letter._id)}
                                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-all text-sm"
                              >
                                <Eye className="h-4 w-4" />
                                <span>Preview</span>
                              </button>
                              <button
                                onClick={() => handleDocumentDownload(letter._id)}
                                className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all text-sm"
                              >
                                <Download className="h-4 w-4" />
                                <span>Download</span>
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Document Preview Modal */}
                  {showDocumentPreview && previewDocument && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                      <div className="bg-white rounded-xl p-6 max-w-4xl max-h-[90vh] overflow-auto">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900">Document Preview</h3>
                          <button
                            onClick={() => setShowDocumentPreview(false)}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <X className="h-6 w-6" />
                          </button>
                        </div>
                        
                                                 <div className="space-y-4">
                           <div className="text-sm text-gray-600">
                             <p><strong>File:</strong> {previewDocument.fileName}</p>
                             <p><strong>Type:</strong> {previewDocument.mimeType}</p>
                           </div>
                           
                           {previewDocument.mimeType === 'application/pdf' ? (
                             <div className="w-full h-96 border rounded-lg overflow-hidden">
                               <iframe
                                 src={`data:application/pdf;base64,${previewDocument.previewData}`}
                                 className="w-full h-full"
                                 title="PDF Preview"
                               />
                             </div>
                           ) : previewDocument.mimeType.startsWith('image/') ? (
                             <img
                               src={`data:${previewDocument.mimeType};base64,${previewDocument.previewData}`}
                               alt="Document preview"
                               className="max-w-full h-auto rounded-lg border"
                             />
                           ) : (
                             <div className="bg-gray-100 p-8 rounded-lg text-center">
                               <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                               <p className="text-gray-500">Preview not available for this file type</p>
                               <p className="text-sm text-gray-400 mt-2">Please download the file to view it</p>
                             </div>
                           )}
                         </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            {activeTab === 'payments' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Payment Statistics */}
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <PaymentIcon className="h-4 w-4 text-green-600" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900">Payment Statistics</h3>
                    </div>
                    <button
                      onClick={refreshPaymentData}
                      className="flex items-center space-x-2 px-3 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all text-sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                      <span>Refresh</span>
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="p-3 bg-white rounded-lg border border-sky-200">
                      <span className="text-sm font-medium text-gray-600">Total Paid</span>
                      <p className="text-2xl font-bold text-green-600">
                        ₹{payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-sky-200">
                      <span className="text-sm font-medium text-gray-600">Pending</span>
                      <p className="text-2xl font-bold text-yellow-600">
                        ₹{payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-sky-200">
                      <span className="text-sm font-medium text-gray-600">Overdue</span>
                      <p className="text-2xl font-bold text-red-600">
                        ₹{payments.filter(p => p.status === 'overdue').reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                      </p>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-sky-200">
                      <span className="text-sm font-medium text-gray-600">Total Months</span>
                      <p className="text-2xl font-bold text-gray-900">{payments.length}</p>
                    </div>
                  </div>
                </div>

                {/* Payment History */}
                <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 rounded-xl border border-sky-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                      <Receipt className="h-4 w-4 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Payment History</h3>
                  </div>
                  
                  {payments.length === 0 ? (
                    <div className="text-center py-8">
                      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500">No payment history found</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {payments.map((payment) => (
                        <motion.div
                          key={payment._id}
                          whileHover={{ scale: 1.02, y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="bg-white p-4 rounded-xl border border-sky-200"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-900">{payment.month}</h4>
                              <p className="text-sm text-gray-500">Due: {formatDate(payment.dueDate)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">₹{payment.amount.toLocaleString()}</p>
                              {getPaymentStatusBadge(payment.status)}
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Payment Method:</span>
                              <p className="font-medium capitalize">{payment.paymentMethod || 'Not specified'}</p>
                            </div>
                            {payment.paymentDate && (
                              <div>
                                <span className="text-gray-600">Payment Date:</span>
                                <p className="font-medium">{formatDate(payment.paymentDate)}</p>
                              </div>
                            )}
                            {payment.markedBy && (
                              <div>
                                <span className="text-gray-600">Marked By:</span>
                                <p className="font-medium">{payment.markedBy.firstName} {payment.markedBy.lastName}</p>
                              </div>
                            )}
                            {payment.markedAt && (
                              <div>
                                <span className="text-gray-600">Marked At:</span>
                                <p className="font-medium">{formatDate(payment.markedAt)}</p>
                              </div>
                            )}
                          </div>
                          
                          {/* Receipt Image Preview */}
                          {payment.receiptImage && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-600">Payment Receipt:</span>
                                <button
                                  onClick={() => handlePaymentReceiptPreview(payment)}
                                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                                >
                                  View Receipt
                                </button>
                              </div>
                              {payment.receiptImage && (
                                <div className="mt-2">
                                  <img
                                    src={`/uploads/payments/${payment.receiptImage.fileName}`}
                                    alt="Payment receipt"
                                    className="w-full h-32 object-cover rounded-lg border border-gray-200"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'block';
                                    }}
                                  />
                                  <div className="hidden text-sm text-gray-500 mt-1">
                                    Receipt image not available
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentProfile; 