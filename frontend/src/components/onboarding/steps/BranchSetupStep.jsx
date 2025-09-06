import React, { useState } from 'react';
import { Building2, MapPin, Phone, Mail, Users, Settings, Star, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const BranchSetupStep = ({ onComplete, onSkip, data, setData, isLoading }) => {
  const [formData, setFormData] = useState({
    name: data?.name || '',
    address: {
      street: data?.address?.street || '',
      city: data?.address?.city || '',
      state: data?.address?.state || '',
      pincode: data?.address?.pincode || '',
      landmark: data?.address?.landmark || ''
    },
    maintainer: {
      name: data?.maintainer?.name || '',
      mobile: data?.maintainer?.mobile || '',
      email: data?.maintainer?.email || ''
    },
    contact: {
      phone: data?.contact?.phone || '',
      email: data?.contact?.email || '',
      alternatePhone: data?.contact?.alternatePhone || ''
    },
    capacity: {
      totalRooms: data?.capacity?.totalRooms || 0,
      totalBeds: data?.capacity?.totalBeds || 0,
      availableRooms: data?.capacity?.availableRooms || 0
    },
    amenities: data?.amenities || []
  });

  const amenitiesList = [
    { name: 'WiFi', icon: '📶', color: 'blue' },
    { name: 'AC', icon: '❄️', color: 'cyan' },
    { name: 'Food', icon: '🍽️', color: 'orange' },
    { name: 'Cleaning', icon: '✨', color: 'green' },
    { name: 'Security', icon: '🛡️', color: 'red' },
    { name: 'Parking', icon: '🚗', color: 'gray' },
    { name: 'Gym', icon: '💪', color: 'pink' },
    { name: 'TV', icon: '📺', color: 'indigo' },
    { name: 'Refrigerator', icon: '🧊', color: 'yellow' },
    { name: 'Geyser', icon: '🚿', color: 'blue' },
    { name: 'Furnished', icon: '🛋️', color: 'brown' }
  ];

  const handleInputChange = (section, field, value) => {
    const newFormData = {
      ...formData,
      [section]: {
        ...formData[section],
        [field]: value
      }
    };
    setFormData(newFormData);
    setData(newFormData);
  };

  const handleAmenityToggle = (amenityName) => {
    const newAmenities = formData.amenities.includes(amenityName)
      ? formData.amenities.filter(a => a !== amenityName)
      : [...formData.amenities, amenityName];
    
    const newFormData = {
      ...formData,
      amenities: newAmenities
    };
    setFormData(newFormData);
    setData(newFormData);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error('Branch name is required');
      return false;
    }
    if (!formData.address.street.trim()) {
      toast.error('Street address is required');
      return false;
    }
    if (!formData.address.city.trim()) {
      toast.error('City is required');
      return false;
    }
    if (!formData.address.state.trim()) {
      toast.error('State is required');
      return false;
    }
    if (!formData.address.pincode.trim()) {
      toast.error('Pincode is required');
      return false;
    }
    if (!formData.contact.phone.trim()) {
      toast.error('Phone number is required');
      return false;
    }
    if (!formData.contact.email.trim()) {
      toast.error('Email is required');
      return false;
    }
    if (!formData.maintainer.name.trim()) {
      toast.error('Maintainer name is required');
      return false;
    }
    if (!formData.maintainer.mobile.trim()) {
      toast.error('Maintainer mobile is required');
      return false;
    }
    if (!formData.maintainer.email.trim()) {
      toast.error('Maintainer email is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const response = await fetch('/api/onboarding/setup-branch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Branch setup completed successfully!');
        onComplete(formData);
      } else {
        toast.error(result.message || 'Failed to setup branch');
      }
    } catch (error) {
      console.error('Branch setup error:', error);
      toast.error('Failed to setup branch. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Building2 className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Setup Your Branch</h2>
        <p className="text-gray-600">
          Create your first branch location. This will be set as your default branch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Building2 className="h-5 w-5 mr-2 text-blue-600" />
            Basic Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter branch name"
                required
              />
            </div>
            <div className="flex items-center space-x-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Star className="h-5 w-5 text-yellow-600" />
              <span className="text-sm text-yellow-800 font-medium">
                This will be your default branch
              </span>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-green-600" />
            Address Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Street Address <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => handleInputChange('address', 'street', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter street address"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => handleInputChange('address', 'city', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter city"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => handleInputChange('address', 'state', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter state"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pincode <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={formData.address.pincode}
                onChange={(e) => handleInputChange('address', 'pincode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter pincode"
                pattern="[0-9]{6}"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Landmark</label>
              <input
                type="text"
                value={formData.address.landmark}
                onChange={(e) => handleInputChange('address', 'landmark', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter landmark (optional)"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Phone className="h-5 w-5 mr-2 text-purple-600" />
              Contact Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={formData.contact.phone}
                  onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter phone number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={formData.contact.email}
                  onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter email address"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Alternate Phone</label>
                <input
                  type="tel"
                  value={formData.contact.alternatePhone}
                  onChange={(e) => handleInputChange('contact', 'alternatePhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter alternate phone"
                  pattern="[0-9]{10}"
                />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2 text-orange-600" />
              Maintainer Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.maintainer.name}
                  onChange={(e) => handleInputChange('maintainer', 'name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter maintainer name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mobile <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={formData.maintainer.mobile}
                  onChange={(e) => handleInputChange('maintainer', 'mobile', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter mobile number"
                  pattern="[0-9]{10}"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  value={formData.maintainer.email}
                  onChange={(e) => handleInputChange('maintainer', 'email', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter maintainer email"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Capacity Information */}
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Users className="h-5 w-5 mr-2 text-indigo-600" />
            Capacity Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Rooms</label>
              <input
                type="number"
                value={formData.capacity.totalRooms}
                onChange={(e) => handleInputChange('capacity', 'totalRooms', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter total rooms"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Total Beds</label>
              <input
                type="number"
                value={formData.capacity.totalBeds}
                onChange={(e) => handleInputChange('capacity', 'totalBeds', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter total beds"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Available Rooms</label>
              <input
                type="number"
                value={formData.capacity.availableRooms}
                onChange={(e) => handleInputChange('capacity', 'availableRooms', parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter available rooms"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Amenities */}
        <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-pink-600" />
            Amenities
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {amenitiesList.map(amenity => {
              const isSelected = formData.amenities.includes(amenity.name);
              return (
                <button
                  key={amenity.name}
                  type="button"
                  onClick={() => handleAmenityToggle(amenity.name)}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 flex flex-col items-center space-y-2 ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-2xl">{amenity.icon}</div>
                  <span className="text-sm font-medium">{amenity.name}</span>
                  {isSelected && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onSkip}
            className="px-6 py-3 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Setting up...</span>
              </>
            ) : (
              <>
                <Building2 className="h-4 w-4" />
                <span>Setup Branch</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BranchSetupStep;
