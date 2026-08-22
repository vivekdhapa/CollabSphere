"use client";

import { useState, useRef } from "react";
import PageShell from "../../components/layout/PageShell";
import ProtectedRoute from "../../components/ProtectedRoute";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";

export default function SettingsPage() {
  const { user, setUser, logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState({ type: "", text: "" });
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const fileInputRef = useRef(null);

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setAvatarError("Please select an image file.");
      return;
    }

    setAvatarError("");
    setIsUploadingAvatar(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await api.patch("/auth/avatar", formData);
      setUser(response.data.data);
    } catch (err) {
      setAvatarError(err.response?.data?.message || "Failed to upload avatar.");
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword || !newPassword) {
      setMessage({ type: "error", text: "Please fill in all fields." });
      return;
    }
    
    setIsSubmitting(true);
    setMessage({ type: "", text: "" });
    
    try {
      await api.post("/auth/change-password", { oldPassword, newPassword });
      setMessage({ type: "success", text: "Password changed successfully." });
      setOldPassword("");
      setNewPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.message || "Failed to change password." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendMessage({ type: "", text: "" });
    try {
      await api.post("/auth/resend-email-verification");
      setResendMessage({ type: "success", text: "Verification email sent!" });
    } catch (err) {
      setResendMessage({ type: "error", text: err.response?.data?.message || "Failed to resend email." });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <ProtectedRoute>
      <PageShell title="Settings">
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6">
          <h1 className="headline-lg text-stone-900 mb-8">Settings</h1>
          
          <div className="flex flex-col gap-8">
            {/* Profile Section */}
            <section className="bg-surface-container-lowest p-6 rounded-xl border border-stone-200">
              <h2 className="headline-sm text-stone-900 mb-6">Profile Information</h2>
              <div className="flex flex-col gap-6">
                
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-start gap-4 pb-4 border-b border-stone-100">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden bg-stone-200 border-2 border-stone-100 shrink-0 shadow-sm">
                    {user?.avatar?.url ? (
                      <img 
                        src={user.avatar.url} 
                        alt="Profile" 
                        className={`w-full h-full object-cover transition-opacity duration-200 ${isUploadingAvatar ? 'opacity-50' : 'opacity-100'}`}
                        crossOrigin="anonymous"
                      />
                    ) : (
                      <div className={`w-full h-full flex items-center justify-center bg-primary text-white text-2xl font-medium transition-opacity duration-200 ${isUploadingAvatar ? 'opacity-50' : 'opacity-100'}`}>
                        {user?.fullName?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {isUploadingAvatar && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="material-symbols-outlined animate-spin text-stone-700 text-2xl drop-shadow-md">progress_activity</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 pt-2">
                    <p className="text-sm font-medium text-stone-900">Profile Photo</p>
                    <p className="text-xs text-stone-500 mb-1">Recommended size: 256x256px. Max 1MB.</p>
                    <div className="flex items-center gap-3">
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        ref={fileInputRef}
                        onChange={handleAvatarChange}
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploadingAvatar}
                        className="px-4 py-2 bg-white border border-stone-300 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors disabled:opacity-50"
                      >
                        Change photo
                      </button>
                    </div>
                    {avatarError && (
                      <p className="text-xs text-error mt-1">{avatarError}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="label-md text-stone-500 block mb-1">Username</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={user?.username || ""} 
                    className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-lg text-stone-700 outline-none"
                  />
                </div>
                <div>
                  <label className="label-md text-stone-500 block mb-1">Full Name</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={user?.fullName || ""} 
                    className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-lg text-stone-700 outline-none"
                  />
                </div>
                <div>
                  <label className="label-md text-stone-500 block mb-1">Email</label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value={user?.email || ""} 
                      className="w-full px-3 py-2 bg-stone-100 border border-stone-200 rounded-lg text-stone-700 outline-none"
                    />
                    {user?.isEmailVerified ? (
                      <span className="bg-success-green/10 text-success-green px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 border border-success-green/20">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Verified
                      </span>
                    ) : (
                      <span className="bg-orange-500/10 text-orange-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shrink-0 border border-orange-500/20">
                        <span className="material-symbols-outlined text-[14px]">warning</span>
                        Unverified
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {user && !user.isEmailVerified && (
                <div className="mt-6 pt-6 border-t border-stone-100">
                  <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-orange-800 mb-1">Verify Your Email</h3>
                    <p className="text-xs text-orange-600 mb-3">Please verify your email address to access all features.</p>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={handleResendEmail}
                        disabled={isResending}
                        className="px-4 py-2 bg-white border border-orange-200 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
                      >
                        Resend verification email
                      </button>
                      {resendMessage.text && (
                        <span className={`text-xs font-medium ${resendMessage.type === 'success' ? 'text-success-green' : 'text-error'}`}>
                          {resendMessage.text}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Change Password */}
            <section className="bg-surface-container-lowest p-6 rounded-xl border border-stone-200">
              <h2 className="headline-sm text-stone-900 mb-6">Change Password</h2>
              <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
                <div>
                  <label className="label-md text-stone-700 block mb-1">Current Password</label>
                  <input 
                    type="password" 
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    placeholder="Enter current password"
                  />
                </div>
                <div>
                  <label className="label-md text-stone-700 block mb-1">New Password</label>
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 outline-none focus:border-stone-900 focus:ring-1 focus:ring-stone-900"
                    placeholder="Enter new password"
                  />
                </div>
                
                {message.text && (
                  <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-success-container text-success-green' : 'bg-error-container text-error'}`}>
                    {message.text}
                  </div>
                )}
                
                <div className="mt-2">
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm disabled:opacity-50"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </section>

            {/* Danger Zone */}
            <section className="bg-surface-container-lowest p-6 rounded-xl border border-error/20">
              <h2 className="headline-sm text-error mb-2">Danger Zone</h2>
              <p className="text-sm text-stone-500 mb-4">Sign out of your account on this device.</p>
              <button 
                onClick={logout}
                className="px-6 py-2 bg-white border-2 border-error text-error rounded-lg hover:bg-error-container transition-colors font-medium text-sm flex items-center gap-2 w-max"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </section>
          </div>
        </div>
      </PageShell>
    </ProtectedRoute>
  );
}
