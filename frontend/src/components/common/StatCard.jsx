import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, Building2, Users, MessageSquare } from 'lucide-react';

/**
 * Modern Statistical Card Component
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {string} props.subtitle - Optional subtitle
 * @param {React.Component} props.icon - Icon component
 * @param {string} props.iconColor - Icon background color
 * @param {string} props.link - Optional link URL
 * @param {Object} props.trend - Trend data {value, direction}
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.loading - Loading state
 * @param {function} props.onClick - Click handler
 */
const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = 'bg-blue-500',
  link,
  trend,
  className = '',
  loading = false,
  onClick
}) => {
  const formatValue = (val) => {
    if (loading) return '...';
    if (typeof val === 'number') {
      if (val >= 1000000) return (val / 1000000).toFixed(1) + 'M';
      if (val >= 1000) return (val / 1000).toFixed(1) + 'K';
      return val.toLocaleString();
    }
    return val || '0';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    switch (trend.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      default:
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-500';
    
    switch (trend.direction) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const cardContent = (
    <div className={`
      bg-white rounded-xl shadow-sm border border-gray-200 p-6 
      hover:shadow-lg hover:border-gray-300 transition-all duration-300
      ${onClick ? 'cursor-pointer' : ''}
      ${loading ? 'animate-pulse' : ''}
      ${className}
    `}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            {Icon && (
              <div className={`p-3 rounded-lg ${iconColor} text-white shadow-sm`}>
                <Icon className="h-6 w-6" />
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-2xl font-bold text-gray-900">
                  {formatValue(value)}
                </span>
                {trend && (
                  <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
                    {getTrendIcon()}
                    <span className="text-sm font-medium">
                      {Math.abs(trend.value)}%
                    </span>
                  </div>
                )}
              </div>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Progress bar for percentage values */}
      {typeof value === 'number' && value <= 100 && title.toLowerCase().includes('rate') && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-500 ${
                value >= 80 ? 'bg-green-500' :
                value >= 60 ? 'bg-yellow-500' :
                'bg-red-500'
              }`}
              style={{ width: `${Math.min(value, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}
    </div>
  );

  if (link) {
    return (
      <Link to={link} className="block">
        {cardContent}
      </Link>
    );
  }

  if (onClick) {
    return (
      <div onClick={onClick}>
        {cardContent}
      </div>
    );
  }

  return cardContent;
};

/**
 * Grid container for stat cards
 */
export const StatCardGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Loading skeleton for stat cards
 */
export const StatCardSkeleton = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
      <div className="flex items-center space-x-3 mb-3">
        <div className="p-3 rounded-lg bg-gray-200 w-12 h-12"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded mb-2 w-24"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
};

/**
 * Predefined stat card variants
 */
export const RevenueCard = ({ value, trend, link }) => (
  <StatCard
    title="Total Revenue"
    value={`₹${formatValue(value)}`}
    icon={TrendingUp}
    iconColor="bg-green-500"
    trend={trend}
    link={link}
    subtitle="All time"
  />
);

export const PGCountCard = ({ value, link }) => (
  <StatCard
    title="Total PGs"
    value={value}
    icon={Building2}
    iconColor="bg-blue-500"
    link={link}
    subtitle="Active properties"
  />
);

export const UserCountCard = ({ value, link }) => (
  <StatCard
    title="Total Users"
    value={value}
    icon={Users}
    iconColor="bg-purple-500"
    link={link}
    subtitle="Registered users"
  />
);

export const TicketCountCard = ({ value, urgent, link }) => (
  <StatCard
    title="Support Tickets"
    value={value}
    icon={MessageSquare}
    iconColor="bg-orange-500"
    link={link}
    subtitle={urgent > 0 ? `${urgent} urgent` : 'All resolved'}
  />
);

export default StatCard;
