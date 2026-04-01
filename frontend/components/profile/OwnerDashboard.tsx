"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Upload, Save } from "lucide-react";
import axios from "axios";
import Cookies from "js-cookie";
import { api } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";

export default function OwnerDashboard() {
  const router = useRouter();
  const { user: currentUser, login: updateAuthStore } = useAuthStore();

  const [formData, setFormData] = useState({
    username: currentUser?.username || "",
    old_password: "",
    new_password: "",
    confirm_password: "",
    profile_picture: currentUser?.profile_picture || "",
  });

  const [updateError, setUpdateError] = useState("");
  const [updateSuccess, setUpdateSuccess] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profile_picture: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateError("");
    setUpdateSuccess("");

    try {
      const res = await api.put("/users/profile", formData);

      const token = Cookies.get("token") || "";
      updateAuthStore(token, res.data.user);

      setUpdateSuccess("Profile updated successfully!");

      // If username changed, redirect to the new URL route
      if (res.data.user.username !== currentUser?.username) {
        router.push(`/${res.data.user.username}`);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setUpdateError(err.response?.data?.error || "Failed to update profile");
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const isValidImageSrc = (src: string) => {
    if (!src) return false;
    return (
      src.startsWith("http://") ||
      src.startsWith("https://") ||
      src.startsWith("/") ||
      src.startsWith("data:image/")
    );
  };

  if (!currentUser) return null; // Safety fallback

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-md overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <p className="text-sm text-gray-500">
            Manage your account details and stream settings.
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="p-8 space-y-8">
          {updateError && (
            <div className="p-3 bg-red-50 text-red-600 rounded-md text-sm">
              {updateError}
            </div>
          )}
          {updateSuccess && (
            <div className="p-3 bg-green-50 text-green-600 rounded-md text-sm">
              {updateSuccess}
            </div>
          )}

          {/* Avatar Upload */}
          <div className="flex items-center space-x-6">
            <div className="relative w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-white shadow-lg">
              {formData.profile_picture &&
              isValidImageSrc(formData.profile_picture) ? (
                <Image
                  src={formData.profile_picture}
                  alt="Avatar"
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
            <div>
              <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center transition-colors">
                <Upload className="w-4 h-4 mr-2" />
                Change Picture
                <input
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleImageChange}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">
                JPG, GIF or PNG. Max 2MB.
              </p>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Basic Info */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={currentUser.email || ""}
                disabled
                className="w-full rounded-md border-gray-200 bg-gray-50 text-gray-500 shadow-sm p-2.5 border cursor-not-allowed"
              />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Change Password */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Change Password
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Old Password
                </label>
                <input
                  type="password"
                  value={formData.old_password}
                  onChange={(e) =>
                    setFormData({ ...formData, old_password: e.target.value })
                  }
                  placeholder="Leave blank to keep current"
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={formData.new_password}
                    onChange={(e) =>
                      setFormData({ ...formData, new_password: e.target.value })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirm_password}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        confirm_password: e.target.value,
                      })
                    }
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2.5 border"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="inline-flex justify-center items-center py-2.5 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition-colors"
            >
              {isUpdating ? (
                "Saving..."
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
