
import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { CreditCard, Wallet, Check, Loader2 } from 'lucide-react';
import useAppointmentStore from '@/stores/appointmentStore';
import PaymentButton, { PaymentSuccessPayload } from './PaymentButton';

interface PaymentOptionsProps {
  appointmentId: string;
  amount: number;
  onSuccess?: (appointmentId: string, paymentMethod: string) => void;
}

const PaymentOptions: React.FC<PaymentOptionsProps> = ({ appointmentId, amount, onSuccess }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [paymentMethod, setPaymentMethod] = useState<
    'online' | 'gpay' | 'paytm' | 'phonepe' | 'offline' | null
  >(null);
  const { processPayment, processingPayment } = useAppointmentStore(state => ({
    processPayment: state.processPayment,
    processingPayment: state.processingPayment,
  }));

  const payableAmountRupees = useMemo(() => (amount && amount > 0 ? amount / 100 : 0), [amount]);
  const isDigitalWallet = paymentMethod === 'gpay' || paymentMethod === 'paytm' || paymentMethod === 'phonepe';

  const handlePaymentSelect = (method: 'online' | 'gpay' | 'paytm' | 'phonepe' | 'offline') => {
    setPaymentMethod(method);
  };

  const handleOfflineConfirmation = async () => {
    if (!paymentMethod) {
      toast({
        title: "Payment Method Required",
        description: "Please select a payment method to continue.",
        variant: "destructive"
      });
      return;
    }

    try {
      await processPayment(appointmentId, paymentMethod, {
        amount,
        currency: 'INR',
      });
      
      toast({
        title: "Payment Successful",
        description: paymentMethod === 'offline' 
          ? "Your appointment has been confirmed. Please pay at the hospital."
          : "Your payment has been processed. Your appointment is confirmed.",
      });
      
      if (onSuccess) {
        onSuccess(appointmentId, paymentMethod);
      } else {
        navigate('/patient-dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Payment Failed",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOnlinePaymentSuccess = async (payload: PaymentSuccessPayload) => {
    console.info('Razorpay payment confirmed:', payload);
    if (!paymentMethod) {
      return;
    }

    try {
      await processPayment(appointmentId, paymentMethod, {
        amount,
        currency: payload.order.currency ?? 'INR',
        razorpay: {
          orderId: payload.razorpay.razorpay_order_id,
          paymentId: payload.razorpay.razorpay_payment_id,
          signature: payload.razorpay.razorpay_signature,
        },
        order: payload.order,
        verification: payload.verification,
      });

      toast({
        title: "Payment Successful",
        description: "Your payment has been processed. Your appointment is confirmed.",
      });

      if (onSuccess) {
        onSuccess(appointmentId, paymentMethod);
      } else {
        navigate('/patient-dashboard');
      }
    } catch (error: any) {
      toast({
        title: "Payment Update Failed",
        description: error.message || "We could not update your appointment status. Please contact support.",
        variant: "destructive",
      });
    }
  };

  const handleOnlinePaymentError = (error: Error) => {
    const userDismissed = /closed/i.test(error.message);
    toast({
      title: userDismissed ? "Payment Cancelled" : "Payment Not Completed",
      description: error.message,
      variant: userDismissed ? "default" : "destructive",
    });
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold mb-4">Select Payment Method</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => handlePaymentSelect('gpay')}
          className={`p-6 rounded-xl border-2 flex flex-col items-center transition-all ${
            paymentMethod === 'gpay' 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <CreditCard className={`h-8 w-8 mb-3 ${paymentMethod === 'gpay' ? 'text-primary' : ''}`} />
          <h4 className="font-medium">Google Pay</h4>
          {paymentMethod === 'gpay' && (
            <Check className="h-4 w-4 text-primary mt-2" />
          )}
        </button>
        
        <button
          onClick={() => handlePaymentSelect('paytm')}
          className={`p-6 rounded-xl border-2 flex flex-col items-center transition-all ${
            paymentMethod === 'paytm' 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <CreditCard className={`h-8 w-8 mb-3 ${paymentMethod === 'paytm' ? 'text-primary' : ''}`} />
          <h4 className="font-medium">Paytm</h4>
          {paymentMethod === 'paytm' && (
            <Check className="h-4 w-4 text-primary mt-2" />
          )}
        </button>
        
        <button
          onClick={() => handlePaymentSelect('phonepe')}
          className={`p-6 rounded-xl border-2 flex flex-col items-center transition-all ${
            paymentMethod === 'phonepe' 
              ? 'border-primary bg-primary/10' 
              : 'border-border hover:border-primary/50'
          }`}
        >
          <CreditCard className={`h-8 w-8 mb-3 ${paymentMethod === 'phonepe' ? 'text-primary' : ''}`} />
          <h4 className="font-medium">PhonePe</h4>
          {paymentMethod === 'phonepe' && (
            <Check className="h-4 w-4 text-primary mt-2" />
          )}
        </button>
      </div>
      
      <div className="text-center pt-4 border-t border-border">
        <p className="text-muted-foreground mb-3">Or pay at the hospital</p>
        <button
          onClick={() => handlePaymentSelect('offline')}
          className={`flex items-center justify-center mx-auto ${
            paymentMethod === 'offline' 
              ? 'btn-primary' 
              : 'btn-outline'
          }`}
        >
          <Wallet className="h-4 w-4 mr-2" />
          Pay at Hospital
          {paymentMethod === 'offline' && (
            <Check className="h-4 w-4 ml-2 text-white" />
          )}
        </button>
      </div>
      
      <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="font-medium">Total Amount:</span>
          <span className="text-xl font-bold">₹{payableAmountRupees.toFixed(2)}</span>
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          {paymentMethod === 'offline'
            ? 'Please bring your payment on the day of your appointment.'
            : isDigitalWallet
              ? `Payment will be processed via ${
                  paymentMethod === 'gpay' ? 'Google Pay' : paymentMethod === 'paytm' ? 'Paytm' : 'PhonePe'
                } using Razorpay secure checkout.`
              : 'Select a payment method to continue.'}
        </p>
      </div>
      
      <div className="flex justify-end mt-6">
        {paymentMethod === 'offline' ? (
          <button
            onClick={handleOfflineConfirmation}
            disabled={!paymentMethod || processingPayment}
            className="btn-primary"
          >
            {processingPayment ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Processing...
              </>
            ) : (
              'Confirm Appointment'
            )}
          </button>
        ) : isDigitalWallet ? (
          <PaymentButton
            amountInPaise={amount}
            label={processingPayment ? 'Finalising...' : 'Proceed to Payment'}
            className="btn-primary"
            onSuccess={handleOnlinePaymentSuccess}
            onError={handleOnlinePaymentError}
            disabled={processingPayment}
          />
        ) : (
          <button
            onClick={() => toast({
              title: "Payment Method Required",
              description: "Please choose a payment option before continuing.",
              variant: "destructive",
            })}
            className="btn-primary"
          >
            Select a payment method
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentOptions;
