import React, { useState } from 'react';
import { CreditCard, Building, Smartphone, DollarSign } from 'lucide-react';

const PaymentSetupStep = ({ onComplete, onSkip, data, setData }) => {
  const [formData, setFormData] = useState({
    paymentMethod: data?.paymentMethod || 'cash',
    bankDetails: data?.bankDetails || {
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    },
    upiId: data?.upiId || ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.paymentMethod) {
      newErrors.paymentMethod = 'Payment method is required';
    }

    if (formData.paymentMethod === 'bank_transfer') {
      if (!formData.bankDetails.accountNumber) {
        newErrors.accountNumber = 'Account number is required';
      }
      if (!formData.bankDetails.ifscCode) {
        newErrors.ifscCode = 'IFSC code is required';
      }
      if (!formData.bankDetails.bankName) {
        newErrors.bankName = 'Bank name is required';
      }
    }

    if (formData.paymentMethod === 'upi' && !formData.upiId) {
      newErrors.upiId = 'UPI ID is required';
    }

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
      await onComplete(formData);
    } catch (error) {
      console.error('Error completing payment setup step:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.startsWith('bankDetails.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }));
      setData(prev => ({
        ...prev,
        bankDetails: {
          ...prev.bankDetails,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
      setData(prev => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Set Up Payment Methods
        </h3>
        <p className="text-gray-600">
          Configure how you'd like to receive payments from your residents.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Payment Method Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-4">
            Preferred Payment Method *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'cash', label: 'Cash', icon: DollarSign, description: 'Accept cash payments' },
              { value: 'bank_transfer', label: 'Bank Transfer', icon: Building, description: 'Direct bank transfers' },
              { value: 'upi', label: 'UPI', icon: Smartphone, description: 'UPI payments' },
              { value: 'card', label: 'Card', icon: CreditCard, description: 'Card payments' }
            ].map((method) => (
              <label
                key={method.value}
                className={`relative flex cursor-pointer rounded-lg border p-4 ${
                  formData.paymentMethod === method.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.value}
                  checked={formData.paymentMethod === method.value}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <method.icon className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-3">
                    <span className="block text-sm font-medium text-gray-900">
                      {method.label}
                    </span>
                    <span className="block text-sm text-gray-500">
                      {method.description}
                    </span>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bank Transfer Details */}
        {formData.paymentMethod === 'bank_transfer' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900">Bank Account Details</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="accountNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Account Number *
                </label>
                <input
                  type="text"
                  id="accountNumber"
                  name="bankDetails.accountNumber"
                  value={formData.bankDetails.accountNumber}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.accountNumber ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter account number"
                />
                {errors.accountNumber && (
                  <p className="mt-1 text-sm text-red-600">{errors.accountNumber}</p>
                )}
              </div>

              <div>
                <label htmlFor="ifscCode" className="block text-sm font-medium text-gray-700 mb-2">
                  IFSC Code *
                </label>
                <input
                  type="text"
                  id="ifscCode"
                  name="bankDetails.ifscCode"
                  value={formData.bankDetails.ifscCode}
                  onChange={handleChange}
                  className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                    errors.ifscCode ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter IFSC code"
                />
                {errors.ifscCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.ifscCode}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                id="bankName"
                name="bankDetails.bankName"
                value={formData.bankDetails.bankName}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.bankName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter bank name"
              />
              {errors.bankName && (
                <p className="mt-1 text-sm text-red-600">{errors.bankName}</p>
              )}
            </div>
          </div>
        )}

        {/* UPI Details */}
        {formData.paymentMethod === 'upi' && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-900">UPI Details</h4>
            
            <div>
              <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID *
              </label>
              <input
                type="text"
                id="upiId"
                name="upiId"
                value={formData.upiId}
                onChange={handleChange}
                className={`block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                  errors.upiId ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter UPI ID (e.g., name@bank)"
              />
              {errors.upiId && (
                <p className="mt-1 text-sm text-red-600">{errors.upiId}</p>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t">
          <button
            type="button"
            onClick={onSkip}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            Skip for now
          </button>
          
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : 'Save & Continue'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentSetupStep; 