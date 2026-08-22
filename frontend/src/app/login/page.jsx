"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      
      const { accessToken } = response.data.data;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }
      
      // Force a full page reload so AuthContext picks up the new token
      window.location.href = "/dashboard";
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
            <span className="material-symbols-outlined text-white text-[20px]">dashboard</span>
          </div>
          <h1 className="headline-md text-stone-900">Sign in</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-container text-error rounded text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="email">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px] pointer-events-none">
                mail
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
                placeholder="you@example.com"
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
              <label className="label-md text-stone-900" htmlFor="password">Password</label>
              <Link href="/forgot-password" className="label-md text-stone-600 hover:text-stone-900 transition-colors">
                Forgot your password?
              </Link>
            </div>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px] pointer-events-none">
                lock
              </span>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-4 w-full py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-stone-600">
          Don't have an account?{" "}
          <Link href="/register" className="text-stone-900 font-medium hover:underline">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
}
