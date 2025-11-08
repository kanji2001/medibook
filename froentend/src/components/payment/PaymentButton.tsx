import { useState, useCallback } from 'react';

type CustomerInfo = {
  name?: string;
  email?: string;
  contact?: string;
};

type RazorpayHandlerResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, callback: (response: unknown) => void) => void;
    };
  }
}

const normalizeBaseUrl = (value: string) => {
  let normalized = value.trim();
  normalized = normalized.replace(/\/+$/, '');

  if (!/^https?:\/\//i.test(normalized)) {
    throw new Error('VITE_API_BASE_URL must include protocol (e.g. http://localhost:5000)');
  }

  return normalized.toLowerCase().endsWith('/api') ? normalized.slice(0, -4) : normalized;
};

const resolveBackendBaseUrl = () => {
  const configuredBase = import.meta.env.VITE_API_BASE_URL;

  if (configuredBase && typeof configuredBase === 'string') {
    return normalizeBaseUrl(configuredBase);
  }

  throw new Error(
    'VITE_API_BASE_URL is not configured. Please set it to your backend origin, e.g. http://localhost:5000',
  );
};

const getPaymentApiBase = () => `${resolveBackendBaseUrl()}/api`;

const loadRazorpayScript = () =>
  new Promise<void>((resolve, reject) => {
    if (typeof window === 'undefined') {
      reject(new Error('Window is undefined'));
      return;
    }

    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });

type PaymentVerificationResult = {
  success: boolean;
  message: string;
  data?: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  };
};

type RazorpayOrder = {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  status?: string;
  notes?: Record<string, unknown>;
};

type PaymentSuccessPayload = {
  razorpay: RazorpayHandlerResponse;
  verification: PaymentVerificationResult;
  order: RazorpayOrder;
};

interface PaymentButtonProps {
  amountInPaise: number;
  customer?: CustomerInfo;
  label?: string;
  className?: string;
  onSuccess?: (payload: PaymentSuccessPayload) => void;
  onError?: (error: Error) => void;
  disabled?: boolean;
}

const PaymentButton = ({
  amountInPaise,
  customer,
  label = 'Pay',
  className = 'btn-primary',
  onSuccess,
  onError,
  disabled = false,
}: PaymentButtonProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      await loadRazorpayScript();

      const normalizedAmount = Math.round(Number(amountInPaise));

      if (!normalizedAmount || Number.isNaN(normalizedAmount) || normalizedAmount <= 0) {
        throw new Error('A valid amount (in paise) is required.');
      }

      const paymentApiBase = getPaymentApiBase();

      const orderResponse = await fetch(`${paymentApiBase}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: normalizedAmount }),
      });

      if (!orderResponse.ok) {
        const errorPayload = (await orderResponse.json().catch(async () => ({
          raw: await orderResponse.text().catch(() => null),
        }))) as { message?: string; raw?: string } | null;
        const fallbackMessage =
          errorPayload?.message ||
          (errorPayload?.raw ? `Unable to create payment order: ${errorPayload.raw}` : null) ||
          `Unable to create payment order (status ${orderResponse.status})`;

        console.error('Razorpay order request failed:', {
          status: orderResponse.status,
          statusText: orderResponse.statusText,
          payload: errorPayload,
        });

        throw new Error(fallbackMessage);
      }

      const { order, key } = (await orderResponse.json()) as {
        order?: RazorpayOrder;
        key?: string;
      };

      if (!order?.id || !key) {
        throw new Error('Invalid order response from server.');
      }

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK is not available.');
      }

      const { name, email, contact } = customer ?? {};

      const paymentObject = new window.Razorpay({
        key,
        name: 'Health Scheduling Hub',
        currency: order.currency ?? 'INR',
        description: 'Consultation Fee',
        order_id: order.id,
        amount: order.amount,
        prefill: {
          name: name ?? '',
          email: email ?? '',
          contact: contact ?? '',
        },
        handler: async (response: RazorpayHandlerResponse) => {
          try {
            const verifyResponse = await fetch(`${paymentApiBase}/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(response),
            });

            const verifyResult = await verifyResponse.json();

            if (!verifyResponse.ok || !verifyResult?.success) {
              const verificationError = new Error(
                verifyResult?.message ?? 'Payment verification failed. Please contact support.',
              );
              setError(verificationError.message);
              onError?.(verificationError);
            } else {
              setError(null);
              await Promise.resolve(
                onSuccess?.({
                  razorpay: response,
                  verification: verifyResult as PaymentVerificationResult,
                  order: order as RazorpayOrder,
                }),
              );
            }
          } catch (verifyError) {
            const err =
              verifyError instanceof Error ? verifyError : new Error('Verification request failed. Please retry.');
            setError(err.message);
            onError?.(err);
          }
          setLoading(false);
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            const cancelError = new Error('Payment window closed before completion.');
            setError(cancelError.message);
            onError?.(cancelError);
          },
        },
        theme: {
          color: '#2563EB',
        },
      });

      paymentObject.on('payment.failed', (response) => {
        const description =
          (response as { error?: { description?: string } })?.error?.description ?? 'Payment was not completed.';
        const paymentError = new Error(description);
        setError(paymentError.message);
        setLoading(false);
        onError?.(paymentError);
      });

      paymentObject.open();
    } catch (paymentError) {
      const message = paymentError instanceof Error ? paymentError.message : 'Unable to initiate payment.';
      console.error('Payment initiation error:', paymentError);
      setError(message);
      setLoading(false);
      onError?.(paymentError instanceof Error ? paymentError : new Error(message));
    }
  }, [amountInPaise, customer, onError, onSuccess]);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading || disabled}
        className={`${className} ${loading || disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
      >
        {loading ? 'Processing...' : label}
      </button>
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

export default PaymentButton;

export type { PaymentSuccessPayload, PaymentVerificationResult };


