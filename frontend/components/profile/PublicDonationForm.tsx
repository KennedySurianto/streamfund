"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { PublicProfile } from '@/types/publicProfile';

interface Props {
  creator: PublicProfile;
}

export default function PublicDonationForm({ creator }: Props) {
  const router = useRouter();
  const [amount, setAmount] = useState(10000);
  
  // Default to the user's name if they are logged in (using "Kennedy" as placeholder)
  const [senderName, setSenderName] = useState('Kennedy');
  const [message, setMessage] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Determine the final name to send based on the toggle
    const finalSenderName = isAnonymous ? 'Anonymous' : (senderName || 'Anonymous');

    try {
      const response = await api.post('/donations', {
        receiver_id: creator.id,
        sender_name: finalSenderName,
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
          {/* Amount Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Amount (Rp)</label>
            <input 
              type="number" 
              value={amount} 
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
              required 
              min="1000"
            />
          </div>

          {/* Anonymous Toggle */}
          {creator.is_anonymous_allowed && (
            <div className="flex items-center space-x-3">
              <input
                id="anonymous-toggle"
                type="checkbox"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="anonymous-toggle" className="text-sm font-medium text-gray-700">
                Donate Anonymously
              </label>
            </div>
          )}

          {/* Sender Name Field (Hidden if Anonymous) */}
          {!isAnonymous && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Your Name</label>
              <input 
                type="text" 
                value={senderName} 
                onChange={(e) => setSenderName(e.target.value)} 
                placeholder="Enter your name"
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500 cursor-not-allowed"
                required={!isAnonymous}
                disabled
              />
            </div>
          )}

          {/* Message Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Message</label>
            <textarea 
              value={message} 
              onChange={(e) => setMessage(e.target.value)} 
              placeholder="Keep up the great work!" 
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-3 border focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 transition-colors"
          >
            {isSubmitting ? 'Processing...' : 'Continue to Payment'}
          </button>
        </form>
      </div>
    </div>
  );
}