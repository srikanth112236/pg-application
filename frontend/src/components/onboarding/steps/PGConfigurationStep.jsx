import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Building2, Plus, Trash2, DollarSign, Users, Sparkles } from 'lucide-react';

const PGConfigurationStep = ({ onComplete, data, setData, isLoading }) => {
  const { user } = useSelector((state) => state.auth);
  const [formData, setFormData] = useState({
    // Basic PG Info
    name: data?.name || '',
    
    // Room Sharing Types and Costs
    sharingTypes: data?.sharingTypes || [
      {
        type: '1-sharing',
        name: 'Single Occupancy',
        description: 'One person per room',
        cost: 0
      },
      {
        type: '2-sharing',
        name: 'Double Sharing',
        description: 'Two persons per room',
        cost: 0
      },
      {
        type: '3-sharing',
        name: 'Triple Sharing',
        description: 'Three persons per room',
        cost: 0
      },
      {
        type: '4-sharing',
        name: 'Quadruple Sharing',
        description: 'Four persons per room',
        cost: 0
      }
    ]
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (data) {
      setFormData(prev => ({ ...prev, ...data }));
    }
  }, [data]);

  // Auto-populate data from user registration
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.firstName ? `${user.firstName}'s PG` : ''
      }));
    }
  }, [user]);

  const validateForm = () => {
    const newErrors = {};

    // Basic validation
    if (!formData.name.trim()) {
      newErrors.name = 'PG name is required';
    }

    // Sharing types validation
    formData.sharingTypes.forEach((sharing, index) => {
      if (sharing.cost < 0) {
        newErrors[`sharing${index}Cost`] = 'Cost cannot be negative';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Only send the required fields to match backend validation
      const submitData = {
        name: formData.name,
        sharingTypes: formData.sharingTypes
      };
      
      await onComplete(submitData);
    } catch (error) {
      console.error('Error completing PG configuration step:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);
    
    if (setData) {
      setData(newFormData);
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSharingChange = (index, field, value) => {
    const newSharingTypes = [...formData.sharingTypes];
    newSharingTypes[index] = { ...newSharingTypes[index], [field]: value };
    
    const newFormData = { ...formData, sharingTypes: newSharingTypes };
    setFormData(newFormData);
    
    if (setData) {
      setData(newFormData);
    }
    
    // Clear sharing-specific errors
    const errorKey = `sharing${index}${field.charAt(0).toUpperCase() + field.slice(1)}`;
    if (errors[errorKey]) {
      setErrors(prev => ({ ...prev, [errorKey]: '' }));
    }
  };

  const addSharingType = () => {
    const newSharingTypes = [...formData.sharingTypes, {
      type: `custom-sharing-${Date.now()}`,
      name: '',
      description: '',
      cost: 0
    }];
    
    const newFormData = { ...formData, sharingTypes: newSharingTypes };
    setFormData(newFormData);
    
    if (setData) {
      setData(newFormData);
    }
  };

  const removeSharingType = (index) => {
    if (formData.sharingTypes.length > 1) {
      const newSharingTypes = formData.sharingTypes.filter((_, i) => i !== index);
      const newFormData = { ...formData, sharingTypes: newSharingTypes };
      setFormData(newFormData);
      
      if (setData) {
        setData(newFormData);
      }
    }
  };

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">Configure Your PG</h3>
            <p className="text-gray-600">Set up your PG name and room sharing options with costs</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* PG Name Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <h4 className="text-lg font-semibold text-gray-900">PG Name</h4>
          </div>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              PG Name *
            </label>
            <div className="relative">
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={`block w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter your PG name"
              />
            </div>
            {errors.name && (
              <p className="mt-2 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
        </div>

        {/* Bed Occupancy Costs Section */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-100">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Room Sharing & Costs</h4>
                <p className="text-sm text-gray-600">Configure different room sharing options and their monthly costs</p>
              </div>
            </div>
            <button
              type="button"
              onClick={addSharingType}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Sharing Type</span>
            </button>
          </div>
          
          <div className="space-y-4">
            {formData.sharingTypes.map((sharing, index) => (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{index + 1}</span>
                    </div>
                    <h5 className="text-md font-medium text-gray-900">
                      {sharing.name || `Sharing Type ${index + 1}`}
                    </h5>
                  </div>
                  {formData.sharingTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSharingType(index)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Sharing Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Name
                    </label>
                    <input
                      type="text"
                      value={sharing.name}
                      onChange={(e) => handleSharingChange(index, 'name', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Single Occupancy"
                    />
                  </div>
                  
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <input
                      type="text"
                      value={sharing.description}
                      onChange={(e) => handleSharingChange(index, 'description', e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., One person per room"
                    />
                  </div>
                  
                  {/* Cost */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Monthly Cost (₹)
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <DollarSign className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="number"
                        value={sharing.cost}
                        onChange={(e) => handleSharingChange(index, 'cost', parseFloat(e.target.value) || 0)}
                        className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          errors[`sharing${index}Cost`] ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    {errors[`sharing${index}Cost`] && (
                      <p className="mt-1 text-sm text-red-600">{errors[`sharing${index}Cost`]}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-between pt-6">
          <div className="text-sm text-gray-500">
            * Required fields
          </div>
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Save & Continue</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default PGConfigurationStep; 