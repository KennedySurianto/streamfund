"use client";

import { useEffect, useState, use } from "react";
import { Donation } from "@/types/donation";

interface OverlayProps {
  params: Promise<{ username: string }>;
}

export default function OverlayPage({ params }: OverlayProps) {
  const { username } = use(params);
  const [activeDonation, setActiveDonation] = useState<Donation | null>(null);

  const triggerTTS = (donation: Donation) => {
    if (!window.speechSynthesis) return;

    const text = `${donation.sender_name} donated Rp ${donation.amount.toLocaleString('id-ID')}. ${donation.message}`;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'id-ID'; // Set to Indonesian
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    // 1. Connect to the Go SSE Stream
    const eventSource = new EventSource(`http://localhost:8080/api/stream/${username}`);

    eventSource.addEventListener("donation_alert", (event) => {
      const donation: Donation = JSON.parse(event.data);
      
      // 2. Trigger the Alert UI
      setActiveDonation(donation);

      // 3. Trigger Text-to-Speech (TTS)
      triggerTTS(donation);

      // 4. Hide alert after 8 seconds
      setTimeout(() => {
        setActiveDonation(null);
      }, 8000);
    });

    return () => {
      eventSource.close();
    };
  }, [username]);

  if (!activeDonation) return <div className="bg-transparent h-screen w-screen" />;

  return (
    <div className="h-screen w-screen bg-transparent flex items-start justify-center p-10">
      {/* Alert Animation Container */}
      <div className="bg-white border-4 border-blue-600 rounded-2xl shadow-2xl p-6 w-96 animate-in fade-in zoom-in slide-in-from-top-10 duration-500">
        <div className="text-center">
          <div className="bg-blue-600 text-white py-1 px-4 rounded-full text-xs font-bold uppercase tracking-widest inline-block mb-3">
            New Donation!
          </div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">
            {activeDonation.sender_name}
          </h2>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            Rp {activeDonation.amount.toLocaleString('id-ID')}
          </p>
          
          {activeDonation.message && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 italic text-gray-700 text-lg">
              &quot;{activeDonation.message}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}