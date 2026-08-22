"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "../../lib/api";

export default function RegisterPage() {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "username") {
      setFormData((prev) => ({ ...prev, [name]: value.toLowerCase() }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    
    // Client-side validation
    if (formData.username.length < 3) {
      setError("Username must be at least 3 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      // Omit optional fields if they are empty
      const payload = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      };
      if (formData.fullName.trim()) {
        payload.fullName = formData.fullName;
      }

      const response = await api.post("/auth/register", payload);
      setSuccessMsg(response.data?.message || "Check your email to verify your account.");
      
      // Short delay before redirecting to login
      setTimeout(() => {
        router.push("/login");
      }, 3000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-elevated p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white text-[20px]">person_add</span>
          </div>
          <h1 className="headline-md text-stone-900">Create an account</h1>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-error-container text-error rounded text-sm font-medium">
            {error}
          </div>
        )}
        
        {successMsg && (
          <div className="mb-6 p-3 bg-stone-50 text-success-green border border-stone-200 rounded text-sm font-medium flex flex-col gap-2">
            <div>{successMsg}</div>
            <div className="text-stone-600 text-xs">Redirecting to login...</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="fullName">Full Name (Optional)</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px] pointer-events-none">
                badge
              </span>
              <input
                id="fullName"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
                placeholder="Jane Doe"
                disabled={isLoading || successMsg}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="username">Username</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px] pointer-events-none">
                alternate_email
              </span>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                required
                minLength={3}
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
                placeholder="janedoe"
                disabled={isLoading || successMsg}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="email">Email</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px] pointer-events-none">
                mail
              </span>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
                placeholder="you@example.com"
                disabled={isLoading || successMsg}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="label-md text-stone-900" htmlFor="password">Password</label>
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-[20px] pointer-events-none">
                lock
              </span>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-lg focus:bg-white focus:border-stone-900 focus:ring-2 focus:ring-stone-100 outline-none transition-all text-body-md"
                placeholder="••••••••"
                disabled={isLoading || successMsg}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none flex items-center justify-center"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || successMsg}
            className="mt-4 w-full py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors active:scale-[0.98] font-medium text-sm flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isLoading ? "Creating account..." : "Register"}
          </button>
        </form>

        <div className="mt-8 text-center text-sm text-stone-600">
          Already have an account?{" "}
          <Link href="/login" className="text-stone-900 font-medium hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
