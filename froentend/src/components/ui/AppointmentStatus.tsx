
import React from 'react';
import { Check, Clock, Calendar, X } from 'lucide-react';

export type AppointmentStatusType = 'pending' | 'booked' | 'confirmed' | 'completed' | 'cancelled' | 'paid' | 'unpaid' | 'approved';

interface AppointmentStatusProps {
  status: AppointmentStatusType;
  className?: string;
}

const AppointmentStatus: React.FC<AppointmentStatusProps> = ({ status, className = '' }) => {
  const getStatusConfig = () => {
    switch (status.toLowerCase()) {
      case 'pending':
        return {
          icon: Clock,
          label: 'Pending Confirmation',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          borderColor: 'border-yellow-200'
        };
      case 'booked':
        return {
          icon: Calendar,
          label: 'Booked - Payment Required',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      case 'confirmed':
        return {
          icon: Check,
          label: 'Confirmed',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'completed':
        return {
          icon: Check,
          label: 'Completed',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'cancelled':
        return {
          icon: X,
          label: 'Cancelled',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200'
        };
      case 'paid':
        return {
          icon: Check,
          label: 'Paid',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200'
        };
      case 'unpaid':
        return {
          icon: Clock,
          label: 'Payment Pending',
          bgColor: 'bg-orange-100',
          textColor: 'text-orange-800',
          borderColor: 'border-orange-200'
        };
      case 'approved':
        return {
          icon: Check,
          label: 'Approved',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          borderColor: 'border-blue-200'
        };
      default:
        return {
          icon: Clock,
          label: status,
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          borderColor: 'border-gray-200'
        };
    }
  };

  const { icon: Icon, label, bgColor, textColor, borderColor } = getStatusConfig();

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${bgColor} ${textColor} border ${borderColor} ${className}`}>
      <Icon className="w-3.5 h-3.5 mr-1" />
      <span>{label}</span>
    </div>
  );
};

export default AppointmentStatus;
