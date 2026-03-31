"use client";

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { QrCode, CreditCard, Smartphone } from 'lucide-react';

interface CheckoutProps {
  params: Promise<{ id: string }>;
}

export default function CheckoutPage({ params }: CheckoutProps) {
  const unwrappedParams = use(params);
  const donationId = unwrappedParams.id;
  
  const router = useRouter();

  const [isSimulating, setIsSimulating] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleSimulatePayment = async () => {
    setIsSimulating(true);
    try {
      // Hit the Go backend to mark as success and trigger the SSE broadcast!
      await api.post(`/donations/${donationId}/complete`);
      
      setPaymentSuccess(true);
      
      // Redirect back home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (error) {
      console.error("Payment simulation failed", error);
      alert("Failed to process mock payment.");
      setIsSimulating(false);
    }
  };

  if (paymentSuccess) {
    return (
      <div className="min-h-screen bg-green-50 flex flex-col items-center justify-center">
        <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-green-800">Payment Successful!</h2>
        <p className="text-green-600 mt-2">Your alert is playing on stream right now.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Select Payment Method</h2>
          <p className="mt-2 text-gray-500">This is a simulated portfolio environment.</p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Mock QRIS Option */}
            <div className="border-2 border-blue-500 rounded-lg p-6 flex flex-col items-center cursor-pointer bg-blue-50">
              <QrCode className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="font-semibold text-gray-900">QRIS</h3>
              <p className="text-sm text-gray-500 mt-1">Gopay, OVO, Dana</p>
            </div>

            {/* Mock VA Option */}
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center opacity-60">
              <CreditCard className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="font-semibold text-gray-500">Virtual Account</h3>
              <p className="text-sm text-gray-400 mt-1">BCA, Mandiri, BNI</p>
            </div>

            {/* Mock E-Wallet Option */}
            <div className="border border-gray-200 rounded-lg p-6 flex flex-col items-center opacity-60">
              <Smartphone className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="font-semibold text-gray-500">E-Wallet</h3>
              <p className="text-sm text-gray-400 mt-1">Direct App Link</p>
            </div>
          </div>

          <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col items-center">
            <div className="bg-gray-100 p-8 rounded-lg mb-6 flex flex-col items-center">
              {/* Fake QR Code Block */}
              <div className="w-48 h-48 bg-gray-300 rounded mb-4 flex items-center justify-center">
                <span className="text-gray-500 font-mono">[ STATIC MOCK QR ]</span>
              </div>
              <p className="text-sm text-gray-500 font-mono">Scan with any supported app</p>
            </div>

            <button
              onClick={handleSimulatePayment}
              disabled={isSimulating}
              className="w-full max-w-md flex justify-center py-4 px-4 border border-transparent rounded-md shadow-sm text-lg font-bold text-white bg-green-600 hover:bg-green-700 disabled:bg-green-300 transition-colors"
            >
              {isSimulating ? 'Processing...' : 'Simulate Successful Payment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}