"use client";

import { useEffect, useState, use } from "react";
import { Donation } from "@/types/donation";

interface OverlayProps {
  params: Promise<{ username: string }>;
}

export default function OverlayPage({ params }: OverlayProps) {
  const { username } = use(params);
  const [activeDonation, setActiveDonation] = useState<Donation | null>(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);

  // A trick to unlock audio context. In OBS, browser sources usually allow autoplay,
  // but if testing in a regular browser, you might need to click the screen once.
  useEffect(() => {
    const unlockAudio = () => {
      if (!audioUnlocked && window.speechSynthesis) {
        const silentUtterance = new SpeechSynthesisUtterance("");
        window.speechSynthesis.speak(silentUtterance);
        setAudioUnlocked(true);
      }
    };

    window.addEventListener("click", unlockAudio);
    return () => window.removeEventListener("click", unlockAudio);
  }, [audioUnlocked]);

  const triggerTTS = (donation: Donation) => {
    const ttsText = `${donation.sender_name} berdonasi ${donation.amount} rupiah. Pesannya: ${donation.message}`;
    const encodedText = encodeURIComponent(ttsText);

    // Swap to the 'gtx' client endpoint, which strictly enforces the 'tl=id' parameter
    const ttsUrl = `https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&hl=id&tl=id&q=${encodedText}`;

    const audio = new Audio(ttsUrl);
    audio.volume = 0.8;

    audio.play().catch((err) => {
      console.error("Audio playback failed:", err);
    });
  };

  useEffect(() => {
    // 1. Connect to the Go SSE Stream
    const eventSource = new EventSource(
      `${process.env.NEXT_PUBLIC_API_URL}/stream/${username}`,
    );

    eventSource.addEventListener("donation_alert", (event) => {
      const donation: Donation = JSON.parse(event.data);

      // 2. Trigger the Alert UI
      setActiveDonation(donation);

      // 3. Trigger Text-to-Speech (TTS)
      triggerTTS(donation);

      // 4. Hide alert after 8 seconds (adjust this based on how long messages take to read)
      setTimeout(() => {
        setActiveDonation(null);
      }, 8000);
    });

    // Handle connection errors
    eventSource.onerror = (err) => {
      console.error("SSE connection error:", err);
      // EventSource auto-reconnects by default, but you can add custom logic here
    };

    return () => {
      eventSource.close();
      // Ensure we stop speaking if the component unmounts
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, [username]);

  // Ensure voices are loaded (Chrome sometimes loads them asynchronously)
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = () => {
        // Voices are now loaded, ready for TTS
      };
    }
  }, []);

  if (!activeDonation)
    return <div className="bg-transparent h-screen w-screen" />;

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
            Rp {activeDonation.amount.toLocaleString("id-ID")}
          </p>

          {activeDonation.message && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 italic text-gray-700 text-lg break-words">
              &quot;{activeDonation.message}&quot;
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
