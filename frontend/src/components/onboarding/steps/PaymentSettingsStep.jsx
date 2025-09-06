import React, { useState } from 'react';
import { CreditCard, Smartphone, DollarSign, Settings, Check, AlertCircle, Banknote } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentSettingsStep = ({ onComplete, onSkip, data, setData, isLoading }) => {
  const [formData, setFormData] = useState({
    upiId: data?.upiId || '',
    upiName: data?.upiName || '',
    accountHolderName: data?.accountHolderName || '',
    bankName: data?.bankName || '',
    accountNumber: data?.accountNumber || '',
    ifscCode: data?.ifscCode || '',
    gpayNumber: data?.gpayNumber || '',
    paytmNumber: data?.paytmNumber || '',
    phonepeNumber: data?.phonepeNumber || '',
    paymentInstructions: data?.paymentInstructions || 'Please make payment and upload screenshot for verification.',
    perDayCost: data?.perDayCost || 0,
    advanceAmount: data?.advanceAmount || 0,
    pgRules: data?.pgRules || []
  });

  const pgRulesList = [
    'No smoking inside the premises',
    'No alcohol consumption',
    'No loud music after 10 PM',
    'Visitors allowed only during day time',
    'Maintain cleanliness in common areas',
    'No cooking in rooms',
    'Respect other residents privacy',
    'Follow COVID-19 safety guidelines',
    'No pets allowed',
    'Monthly rent to be paid in advance'
  ];

  const handleInputChange = (field, value) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
    setData(newFormData);
  };

  const handleRuleToggle = (rule) => {
    const newRules = formData.pgRules.includes(rule)
      ? formData.pgRules.filter(r => r !== rule)
      : [...formData.pgRules, rule];
    
    const newFormData = { ...formData, pgRules: newRules };
    setFormData(newFormData);
    setData(newFormData);
  };

  const validateForm = () => {
    if (!formData.upiId.trim()) {
      toast.error('UPI ID is required');
      return false;
    }
    if (!formData.upiName.trim()) {
      toast.error('UPI Name is required');
      return false;
    }
    if (!formData.accountHolderName.trim()) {
      toast.error('Account Holder Name is required');
      return false;
    }
    if (formData.perDayCost <= 0) {
      toast.error('Per day cost must be greater than 0');
      return false;
    }
    if (formData.advanceAmount < 0) {
      toast.error('Advance amount cannot be negative');
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
      const response = await fetch('/api/onboarding/setup-payment-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Payment settings configured successfully!');
        onComplete(formData);
      } else {
        toast.error(result.message || 'Failed to setup payment settings');
      }
    } catch (error) {
      console.error('Payment settings error:', error);
      toast.error('Failed to setup payment settings. Please try again.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Settings</h2>
        <p className="text-gray-600">
          Configure payment methods and PG rules for your branch.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* UPI Information */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Smartphone className="h-5 w-5 mr-2 text-green-600" />
            UPI Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.upiId}
                onChange={(e) => handleInputChange('upiId', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="e.g., yourname@paytm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                UPI Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.upiName}
                onChange={(e) => handleInputChange('upiName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter UPI display name"
                required
              />
            </div>
          </div>
        </div>

        {/* Bank Account Information */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Banknote className="h-5 w-5 mr-2 text-blue-600" />
            Bank Account Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Holder Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountHolderName}
                onChange={(e) => handleInputChange('accountHolderName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter account holder name"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bank Name</label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter bank name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Account Number</label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter account number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">IFSC Code</label>
              <input
                type="text"
                value={formData.ifscCode}
                onChange={(e) => handleInputChange('ifscCode', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter IFSC code"
              />
            </div>
          </div>
        </div>

        {/* Mobile Payment Apps */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Smartphone className="h-5 w-5 mr-2 text-purple-600" />
            Mobile Payment Apps
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Google Pay Number</label>
              <input
                type="tel"
                value={formData.gpayNumber}
                onChange={(e) => handleInputChange('gpayNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter Google Pay number"
                pattern="[0-9]{10}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Paytm Number</label>
              <input
                type="tel"
                value={formData.paytmNumber}
                onChange={(e) => handleInputChange('paytmNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter Paytm number"
                pattern="[0-9]{10}"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">PhonePe Number</label>
              <input
                type="tel"
                value={formData.phonepeNumber}
                onChange={(e) => handleInputChange('phonepeNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter PhonePe number"
                pattern="[0-9]{10}"
              />
            </div>
          </div>
        </div>

        {/* Pricing Information */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <DollarSign className="h-5 w-5 mr-2 text-yellow-600" />
            Pricing Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Per Day Cost (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.perDayCost}
                onChange={(e) => handleInputChange('perDayCost', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter per day cost"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Advance Amount (₹)</label>
              <input
                type="number"
                value={formData.advanceAmount}
                onChange={(e) => handleInputChange('advanceAmount', parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                placeholder="Enter advance amount"
                min="0"
                step="0.01"
              />
            </div>
          </div>
        </div>

        {/* PG Rules */}
        <div className="bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2 text-red-600" />
            PG Rules & Regulations
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Select the rules that apply to your PG. You can add more later.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pgRulesList.map(rule => {
              const isSelected = formData.pgRules.includes(rule);
              return (
                <button
                  key={rule}
                  type="button"
                  onClick={() => handleRuleToggle(rule)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex items-center space-x-3 text-left ${
                    isSelected
                      ? 'border-red-500 bg-red-50 text-red-700 shadow-sm'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    isSelected ? 'border-red-500 bg-red-500' : 'border-gray-300'
                  }`}>
                    {isSelected && <Check className="h-3 w-3 text-white" />}
                  </div>
                  <span className="text-sm font-medium">{rule}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Instructions */}
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-gray-600" />
            Payment Instructions
          </h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Instructions for Residents</label>
            <textarea
              value={formData.paymentInstructions}
              onChange={(e) => handleInputChange('paymentInstructions', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
              placeholder="Enter payment instructions for residents"
              rows="3"
            />
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
            className="flex items-center space-x-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Configuring...</span>
              </>
            ) : (
              <>
                <CreditCard className="h-4 w-4" />
                <span>Configure Payment</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentSettingsStep;
