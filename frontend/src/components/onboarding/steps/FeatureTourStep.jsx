import React, { useState } from 'react';
import { Play, Users, CreditCard, Building2, BarChart3, Settings } from 'lucide-react';

const FeatureTourStep = ({ onComplete, onSkip }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const features = [
    {
      icon: Building2,
      title: 'PG Management',
      description: 'Manage your PG details, rooms, and property information all in one place.',
      color: 'bg-blue-500'
    },
    {
      icon: Users,
      title: 'Resident Management',
      description: 'Add, edit, and manage resident information, track occupancy, and handle check-ins/check-outs.',
      color: 'bg-green-500'
    },
    {
      icon: CreditCard,
      title: 'Payment Tracking',
      description: 'Track rent payments, generate invoices, and manage payment history for all residents.',
      color: 'bg-purple-500'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'View occupancy rates, revenue reports, and detailed analytics to optimize your PG business.',
      color: 'bg-orange-500'
    },
    {
      icon: Settings,
      title: 'Maintenance Requests',
      description: 'Handle maintenance requests, track repairs, and ensure your PG stays in top condition.',
      color: 'bg-red-500'
    }
  ];

  const handleNext = () => {
    if (currentSlide < features.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    try {
      await onComplete();
    } catch (error) {
      console.error('Error completing feature tour:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentFeature = features[currentSlide];

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Welcome to PG Management System
        </h3>
        <p className="text-gray-600">
          Let's take a quick tour of the key features that will help you manage your PG effectively.
        </p>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg p-8">
        <div className="text-center mb-8">
          <div className={`inline-flex p-4 rounded-full ${currentFeature.color} text-white mb-4`}>
            <currentFeature.icon className="h-8 w-8" />
          </div>
          <h4 className="text-2xl font-bold text-gray-900 mb-2">
            {currentFeature.title}
          </h4>
          <p className="text-gray-600 max-w-md mx-auto">
            {currentFeature.description}
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex justify-center space-x-2 mb-8">
          {features.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentSlide === 0}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-4">
            <button
              onClick={onSkip}
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
            >
              Skip Tour
            </button>
            
            <button
              onClick={handleNext}
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentSlide === features.length - 1 
                ? (isSubmitting ? 'Completing...' : 'Complete Tour')
                : 'Next'
              }
            </button>
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-yellow-900 mb-2">💡 Quick Tips:</h4>
        <ul className="text-sm text-yellow-800 space-y-1">
          <li>• You can access all features from the left sidebar menu</li>
          <li>• Use the dashboard to get a quick overview of your PG</li>
          <li>• Set up notifications to stay updated on important events</li>
          <li>• Contact support if you need help with any feature</li>
        </ul>
      </div>
    </div>
  );
};

export default FeatureTourStep; 