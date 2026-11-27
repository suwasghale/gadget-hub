"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { api } from "@/lib/api/client";
import AuthModal from "./AuthModal";

type Status = "verifying" | "done" | "failed";

/** Opened from the link in the verification email: /verify-email?uid=...&token=... */
export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const uid = searchParams.get("uid");
  const token = searchParams.get("token");
  const [status, setStatus] = useState<Status>(uid && token ? "verifying" : "failed");
  const [message, setMessage] = useState(uid && token ? "" : "This verification link is incomplete.");
  const [showLogin, setShowLogin] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!uid || !token || started.current) return;
    started.current = true;
    const query = new URLSearchParams({ uid, token }).toString();
    api<{ message?: string }>(`auth/verify-email/?${query}`)
      .then((data) => {
        setStatus("done");
        setMessage(data.message ?? "Email verified.");
      })
      .catch((err: Error) => {
        setStatus("failed");
        setMessage(err.message || "This link is invalid or has expired.");
      });
  }, [uid, token]);

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-md mx-auto px-4 text-center bg-white rounded-xl shadow p-8">
        <h1 className="text-2xl font-bold mb-4">Email verification</h1>
        {status === "verifying" && <p className="text-gray-600">Verifying your email…</p>}
        {status === "done" && (
          <>
            <p className="text-green-700 mb-6">{message} You can now sign in.</p>
            <button
              type="button"
              onClick={() => setShowLogin(true)}
              className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700"
            >
              Sign in
            </button>
          </>
        )}
        {status === "failed" && <p className="text-red-700">{message}</p>}
      </div>
      <AuthModal isOpen={showLogin} onClose={() => setShowLogin(false)} initialMode="login" />
    </section>
  );
}
