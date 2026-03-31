"use client";

import { useState, useEffect, use } from 'react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/lib/authStore';
import PublicDonationForm from '@/components/profile/PublicDonationForm';
import OwnerDashboard from '@/components/profile/OwnerDashboard';
import Cookies from 'js-cookie';

interface PublicProfile {
  id: string;
  username: string;
  is_anonymous_allowed: boolean;
}

interface PageProps {
  params: Promise<{ username: string }>;
}

export default function CreatorPage({ params }: PageProps) {
  const { username: routeUsername } = use(params);
  
  const { user: currentUser } = useAuthStore();
  const [creator, setCreator] = useState<PublicProfile | null>(null);
  
  // Local states to handle loading safely
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isClientReady, setIsClientReady] = useState(false);

  useEffect(() => {
    // 1. Force a local auth sync to prevent any Zustand race conditions
    const savedUser = localStorage.getItem("user");
    const token = Cookies.get("token");
    if (savedUser && token) {
      useAuthStore.setState({ user: JSON.parse(savedUser), token });
    }
    
    // Signal that the client has mounted and auth is synced
    setIsClientReady(true);

    // 2. Fetch the creator's profile from Go
    const fetchCreator = async () => {
      try {
        const res = await api.get(`/users/${routeUsername}`);
        setCreator(res.data);
      } catch (error) {
        console.error("Creator not found", error);
        setCreator(null);
      } finally {
        setIsLoadingProfile(false);
      }
    };
    
    if (routeUsername) {
      fetchCreator();
    }
  }, [routeUsername]);

  // Prevent hydration mismatch and wait for API
  if (!isClientReady || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  // If the API returned a 404
  if (!creator) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
        <p className="text-gray-500">The creator &quot;{routeUsername}&quot; does not exist.</p>
      </div>
    );
  }

  // Route to the correct view
  const isOwner = currentUser?.username === routeUsername;
  return isOwner ? <OwnerDashboard /> : <PublicDonationForm creator={creator} />;
}