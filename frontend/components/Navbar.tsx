"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/lib/authStore";
import { User as UserIcon, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function Navbar() {
  const pathname = usePathname();
  
  // 1. BEST PRACTICE: Select individual pieces of state.
  // This forces React to notice the update when 'user' changes.
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    try {
      const token = Cookies.get("token");
      const savedUserStr = localStorage.getItem("user");

      // 2. SAFETY CHECK: Ensure it's not the literal string "undefined"
      if (savedUserStr && savedUserStr !== "undefined" && savedUserStr !== "null") {
        const parsedUser = JSON.parse(savedUserStr);
        
        // Sync the store
        useAuthStore.setState({
          token: token || null,
          user: parsedUser,
          hasHydrated: true,
        });
      } else {
        useAuthStore.setState({ hasHydrated: true });
      }
    } catch (error) {
      console.error("Session restore failed, clearing corrupted data:", error);
      localStorage.removeItem("user");
      Cookies.remove("token");
    } finally {
      // Tell the UI it is safe to render the auth section
      setIsMounted(true);
    }
  }, []);

  if (pathname.startsWith("/overlay")) return null;

  const renderProfileImage = () => {
    if (user?.profile_picture) {
      const src = user.profile_picture.startsWith('data:') 
        ? user.profile_picture 
        : `data:image/png;base64,${user.profile_picture}`;

      return (
        <div className="relative w-10 h-10">
          <Image
            src={src}
            alt={user.username || "Profile"}
            fill
            unoptimized
            className="rounded-full object-cover border-2 border-blue-100"
          />
        </div>
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
        <UserIcon size={20} />
      </div>
    );
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-extrabold text-blue-600 tracking-tight">
              StreamFund
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {isMounted && (
              <>
                {user ? (
                  // Authenticated View
                  <div className="flex items-center space-x-4">
                    <Link
                      href={`/${user.username}`}
                      className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                    >
                      <span className="text-sm font-semibold text-gray-700 hidden md:block">
                        {user.username}
                      </span>
                      {renderProfileImage()}
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        window.location.href = "/";
                      }}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={20} />
                    </button>
                  </div>
                ) : (
                  // Guest View
                  <>
                    <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-blue-600">
                      Login
                    </Link>
                    <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-bold hover:bg-blue-700 transition-colors">
                      Get Started
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}