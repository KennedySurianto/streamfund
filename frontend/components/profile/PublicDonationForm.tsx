"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';

// You can move this to your types/index.ts file later!
interface PublicProfile {
  id: string;
  username: string;
  is_anonymous_allowed: boolean;
}

interface Props {
  creator: PublicProfile;
}

export default function PublicDonationForm({ creator }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState(10000);
  const [senderName, setSenderName] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await api.post('/donations', {
        receiver_id: creator.id,
        sender_name: senderName || 'Anonymous',
        amount: Number(amount),
        message: message,
      });

      const donationId = response.data.donation.id;
      router.push(`/checkout/${donationId}`);
    } catch (error) {
      console.error("Failed to initiate donation", error);
      alert("Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Support {creator.username}</h1>
          <p className="text-gray-500">Leave a message and it will appear on stream!</p>
        </div>

        <form onSubmit={handleDonate} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (Rp)</label>
            <input 
              type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
              required min="1000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Your Name (Optional)</label>
            <input 
              type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Anonymous"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea 
              value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Keep up the great work!" rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <button 
            type="submit" disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isSubmitting ? 'Processing...' : 'Continue to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}