"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import api from "../../../lib/api";

export default function VerifyEmailPage({ params }) {
  const unwrappedParams = use(params);
  const verificationToken = unwrappedParams.verificationToken;

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  const fetchPromise = useRef(null);

  useEffect(() => {
    let isMounted = true;

    if (!fetchPromise.current && verificationToken) {
      fetchPromise.current = api.get(`/auth/verify-email/${verificationToken}`);
    }

    if (fetchPromise.current) {
      fetchPromise.current
        .then(response => {
          if (isMounted) {
            setStatus("success");
            setMessage(response.data?.message || "Your email has been verified.");
          }
        })
        .catch(err => {
          if (isMounted) {
            setStatus("error");
            setMessage(err.response?.data?.message || "Verification failed. The link might be invalid or expired.");
          }
        });
    }

    return () => {
      isMounted = false;
    };
  }, [verificationToken]);

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-xl shadow-elevated p-8 text-center">
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 bg-stone-900 rounded-lg flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-white text-[20px]">mark_email_read</span>
          </div>
          <h1 className="headline-md text-stone-900">Email Verification</h1>
        </div>

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <span className="material-symbols-outlined animate-spin text-stone-400 text-3xl">refresh</span>
            <p className="text-stone-600 body-md">Verifying your email...</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-6">
            <div className="p-4 bg-stone-100 text-stone-900 rounded text-sm font-medium w-full flex items-center justify-center gap-2">
              <span className="material-symbols-outlined text-success-green text-[20px]">check_circle</span>
              {message}
            </div>
            <Link href="/login" className="w-full py-2.5 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors font-medium text-sm inline-flex justify-center items-center">
              Go to Login
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col gap-6">
            <div className="p-4 bg-error-container text-error rounded text-sm font-medium text-left">
              <p>{message}</p>
              <p className="mt-2 text-stone-600 text-xs">
                If your link has expired, you can request a new verification email from your account settings once logged in.
              </p>
            </div>
            <Link href="/login" className="w-full py-2.5 bg-white border border-stone-200 text-stone-900 rounded-lg hover:bg-stone-50 hover:border-stone-300 transition-colors font-medium text-sm inline-flex justify-center items-center">
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
