import Link from "next/link";
import Image from "next/image";
import { Trophy, Users, ArrowRight, User as UserIcon } from "lucide-react";
import { Donation } from "@/types/donation";
import { Creator } from "@/types/creator";

// 1. Fetch Leaderboard
async function getLeaderboard(): Promise<Donation[]> {
  try {
    const res = await fetch("http://127.0.0.1:8080/api/donations/leaderboard", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.leaderboard || [];
  } catch {
    return [];
  }
}

// 2. Fetch Featured Creators from the Database
async function getFeaturedCreators(): Promise<Creator[]> {
  try {
    const res = await fetch("http://127.0.0.1:8080/api/creators/featured", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data = await res.json();
    console.log("data", data);
    return data.creators || [];
  } catch (error) {
    console.error("Failed to fetch creators:", error);
    return [];
  }
}

export default async function Home() {
  const leaderboard = await getLeaderboard();
  const featuredCreators = await getFeaturedCreators();

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <div className="bg-blue-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Empower Your Streams with Real-Time Alerts
          </h1>
          <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto">
            Accept donations easily using QRIS, Virtual Accounts, and E-Wallets.
            Keep your audience engaged with instant on-screen notifications.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Leaderboard Section */}
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="p-6 sm:p-10 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Trophy className="w-6 h-6 text-yellow-500 mr-2" />
                  Global Leaderboard
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Top supporters across all creators
                </p>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {leaderboard.length === 0 ? (
                <div className="p-10 text-center text-gray-500">
                  No donations yet. Be the first to support a creator!
                </div>
              ) : (
                leaderboard.map((donation: Donation, index: number) => (
                  <div
                    key={donation.id}
                    className="p-6 sm:p-8 flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      {/* Rank Number */}
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg
                      ${
                        index === 0
                          ? "bg-yellow-100 text-yellow-700"
                          : index === 1
                            ? "bg-gray-200 text-gray-700"
                            : index === 2
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-50 text-blue-600"
                      }
                    `}
                      >
                        #{index + 1}
                      </div>

                      <div>
                        <p className="text-lg font-semibold text-gray-900">
                          {donation.sender_name}
                        </p>
                        {donation.message && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            &quot;{donation.message}&quot;
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-green-600">
                        Rp {donation.amount.toLocaleString("id-ID")}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(donation.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Database Creators Section */}
        <div className="mt-16">
          <div className="flex items-center mb-8">
            <Users className="w-7 h-7 text-blue-600 mr-3" />
            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Featured Creators
              </h2>
              <p className="text-gray-500 mt-1">
                Discover and support live streamers.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredCreators.map((creator) => {
              // Handle base64 image prefix just like we did in the Navbar
              const imgSrc = creator.profile_picture?.startsWith("data:")
                ? creator.profile_picture
                : creator.profile_picture
                  ? `data:image/png;base64,${creator.profile_picture}`
                  : null;

              return (
                <Link
                  href={`/${creator.username}`}
                  key={creator.id}
                  className="group flex flex-col bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="p-6 flex-1 flex flex-col items-center text-center">
                    {/* Dynamic Profile Picture */}
                    <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-blue-50 border-4 border-white shadow-md overflow-hidden relative">
                      {imgSrc ? (
                        <Image
                          src={imgSrc}
                          alt={creator.username}
                          fill 
                          unoptimized
                          className="object-cover" 
                        />
                      ) : (
                        <UserIcon className="w-8 h-8 text-blue-400" />
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      @{creator.username}
                    </h3>
                    {/* <p className="text-sm text-gray-500 mt-2">
                      StreamFund Creator
                    </p> */}
                  </div>

                  <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between group-hover:bg-blue-50 transition-colors">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-blue-700">
                      Support Streamer
                    </span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}

            {/* Empty State Guard */}
            {featuredCreators.length === 0 && (
              <div className="col-span-3 text-center py-10 bg-gray-50 rounded-xl border border-gray-200">
                <p className="text-gray-500">
                  No creators found in the database.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
