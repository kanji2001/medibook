
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { paymentService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const razorpay_payment_id = searchParams.get('razorpay_payment_id');
        const razorpay_order_id = searchParams.get('razorpay_order_id');
        const razorpay_signature = searchParams.get('razorpay_signature');
        const appointmentId = searchParams.get('appointment_id');

        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !appointmentId) {
          throw new Error('Missing payment verification parameters');
        }

        // Verify payment with all required parameters
        const response = await paymentService.verifyPayment(
          appointmentId,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature
        );

        if (response.success) {
          setSuccess(true);
          toast({
            title: 'Payment Successful',
            description: 'Your appointment has been confirmed.',
          });
        } else {
          throw new Error('Payment verification failed');
        }
      } catch (err: any) {
        console.error('Payment verification error:', err);
        setError(err.message || 'Payment verification failed');
        toast({
          title: 'Payment Verification Failed',
          description: 'Please contact support if amount was deducted.',
          variant: 'destructive'
        });
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, toast]);

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h2 className="text-xl font-semibold mb-2">Verifying Payment</h2>
          <p className="text-muted-foreground">Please wait while we confirm your payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Payment Verification Failed</h1>
          <p className="text-muted-foreground mb-6">{error}</p>
          <div className="space-y-4">
            <button
              onClick={() => navigate('/patient-dashboard')}
              className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full border border-border px-6 py-2 rounded-md hover:bg-accent"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-4">Payment Successful!</h1>
        <p className="text-muted-foreground mb-6">
          Your appointment has been confirmed. You will receive a confirmation email shortly.
        </p>
        <div className="space-y-4">
          <button
            onClick={() => navigate('/patient-dashboard')}
            className="w-full bg-primary text-primary-foreground px-6 py-2 rounded-md hover:bg-primary/90"
          >
            View My Appointments
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full border border-border px-6 py-2 rounded-md hover:bg-accent"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
