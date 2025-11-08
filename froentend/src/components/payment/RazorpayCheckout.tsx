
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { paymentService } from '@/services/api';
import { Loader2, CreditCard, AlertCircle, Wallet } from 'lucide-react';

interface RazorpayCheckoutProps {
  appointmentId: string;
  amount: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

// Declare Razorpay on window object
declare global {
  interface Window {
    Razorpay: any;
  }
}

const RazorpayCheckout: React.FC<RazorpayCheckoutProps> = ({
  appointmentId,
  amount,
  onSuccess,
  onCancel,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load Razorpay script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => {
      setError('Failed to load Razorpay. Please check your internet connection.');
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: CreditCard },
    { id: 'netbanking', name: 'Net Banking', icon: Wallet },
    { id: 'upi', name: 'UPI', icon: Wallet },
    { id: 'wallet', name: 'Wallet', icon: Wallet },
  ];

  const handlePayment = async (method: string) => {
    if (!scriptLoaded) {
      setError('Payment system is still loading. Please try again.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSelectedMethod(method);
      
      if (method === 'offline') {
        // Handle offline payment
        const response = await paymentService.createPayment(appointmentId, 'offline');
        
        if (response.success) {
          toast({
            title: 'Appointment Confirmed',
            description: 'Please pay at the hospital on your appointment day.',
          });
          
          if (onSuccess) {
            onSuccess();
          } else {
            navigate('/patient-dashboard');
          }
        } else {
          throw new Error('Failed to confirm appointment');
        }
      } else {
        // Create Razorpay order
        const response = await paymentService.createPayment(appointmentId, 'online');
        
        if (!response.success || !response.data) {
          throw new Error('Failed to create payment order');
        }

        const { orderId, amount, currency, key } = response.data;

        // Configure Razorpay options
        const options = {
          key: key,
          amount: amount,
          currency: currency,
          name: 'HealthCare App',
          description: 'Doctor Consultation Fee',
          order_id: orderId,
          handler: async (response: any) => {
            try {
              // Verify payment
              const verifyResponse = await paymentService.verifyPayment(
                appointmentId,
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );

              if (verifyResponse.success) {
                toast({
                  title: 'Payment Successful',
                  description: 'Your appointment has been confirmed.',
                });
                
                if (onSuccess) {
                  onSuccess();
                } else {
                  navigate('/patient-dashboard');
                }
              } else {
                throw new Error('Payment verification failed');
              }
            } catch (verifyError: any) {
              console.error('Payment verification error:', verifyError);
              setError(verifyError.message || 'Payment verification failed');
              toast({
                title: 'Payment Verification Failed',
                description: 'Please contact support if amount was deducted.',
                variant: 'destructive'
              });
            }
          },
          prefill: {
            name: 'Patient',
            email: 'patient@example.com',
            contact: '9999999999'
          },
          theme: {
            color: '#3B82F6'
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setSelectedMethod(null);
              toast({
                title: 'Payment Cancelled',
                description: 'You can complete payment later from your dashboard.',
                variant: 'destructive'
              });
            }
          }
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      }
    } catch (err: any) {
      console.error('Payment error:', err);
      setError(err.message || 'An error occurred during payment processing');
      toast({
        title: 'Payment Error',
        description: err.message || 'An error occurred during payment processing',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
      setSelectedMethod(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200 text-red-700 flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}
      
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-lg">
          <span>Consultation Fee:</span>
          <span className="font-semibold">₹{(amount / 100).toFixed(2)}</span>
        </div>
        <div className="border-t border-gray-200 my-4"></div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-semibold mb-4">Choose Payment Method</h3>
        
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <button
              key={method.id}
              onClick={() => handlePayment(method.id)}
              disabled={loading || !scriptLoaded}
              className={`w-full p-4 border-2 rounded-lg font-medium transition-all flex items-center justify-center ${
                selectedMethod === method.id
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-gray-200 hover:border-primary/50 hover:bg-gray-50'
              } ${(!scriptLoaded || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading && selectedMethod === method.id ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Icon className="h-5 w-5 mr-2" />
              )}
              {method.name}
            </button>
          );
        })}
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={() => handlePayment('offline')}
            disabled={loading}
            className="w-full p-4 border-2 border-gray-200 rounded-lg font-medium transition-all flex items-center justify-center hover:border-primary/50 hover:bg-gray-50"
          >
            <Wallet className="h-5 w-5 mr-2" />
            Pay at Hospital
          </button>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <button
            onClick={onCancel}
            disabled={loading}
            className="w-full py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            Cancel & Pay Later
          </button>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg text-sm text-blue-800">
        <p className="font-medium mb-1">Secure Payment</p>
        <p>Your payment is processed securely through Razorpay. You will receive a confirmation after successful payment.</p>
      </div>
    </div>
  );
};

export default RazorpayCheckout;
