"use client";

import { useState, use } from "react";
import Link from "next/link";
import api from "../../../lib/api";

export default function ResetPasswordPage({ params }) {
  const unwrappedParams = use(params);
  const resetToken = unwrappedParams.resetToken;

  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post(`/auth/reset-password/${resetToken}`, { newPassword });
      setSuccessMessage(response.data?.message || "Password has been successfully reset.");
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-elevated p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white text-[20px]">password</span>
          </div>
          <h1 className="headline-md text-stone-900">Reset Password</h1>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-error-container text-error rounded text-sm font-medium flex flex-col gap-2">
            <span>{error}</span>
            <Link href="/forgot-password" className="underline font-medium hover:text-stone-900">
              Request a new reset link
            </Link>
          </div>
        )}

        {successMessage ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 p-3 bg-stone-100 text-stone-900 rounded text-sm font-medium w-full flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-success-green">check_circle</span>
              {successMessage}
            </div>
            <Link href="/login" className="w-full py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm inline-flex justify-center items-center">
              Go to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="label-md text-stone-900" htmlFor="newPassword">New Password</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3 text-stone-400 text-[20px] pointer-events-none">
                  lock
                </span>
                <input
                  id="newPassword"
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-2 bg-stone-50 border border-stone-200 rounded focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-stone-400 hover:text-stone-600 focus:outline-none flex items-center justify-center"
                  tabIndex="-1"
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
            >
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
