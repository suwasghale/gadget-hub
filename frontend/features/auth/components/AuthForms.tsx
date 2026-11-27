"use client";
import React, { useState } from "react";

import { ApiError } from "@/lib/api/client";
import { useAuth } from "@/features/auth/AuthProvider";

interface AuthFormsProps {
  initialMode?: "login" | "signup";
  /** Called after a successful login. */
  onSuccess?: () => void;
}

const inputClass = "w-full px-4 py-2 border rounded-lg";

const emptySignup = { first_name: "", last_name: "", username: "", email: "", password: "" };

const AuthForms: React.FC<AuthFormsProps> = ({ initialMode = "login", onSuccess }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [signup, setSignup] = useState(emptySignup);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const switchMode = (next: "login" | "signup") => {
    setMode(next);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(identifier.trim(), password);
        setPassword("");
        onSuccess?.();
      } else {
        const message = await register({ ...signup, email: signup.email.trim() });
        setNotice(`${message} Then sign in.`);
        setIdentifier(signup.email.trim());
        setSignup(emptySignup);
        setMode("login");
      }
    } catch (err) {
      setError(
        err instanceof ApiError || err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const updateSignup =
    (field: keyof typeof emptySignup) => (event: React.ChangeEvent<HTMLInputElement>) =>
      setSignup((prev) => ({ ...prev, [field]: event.target.value }));

  return (
    <div className="w-full max-w-sm">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {mode === "login" ? "Sign In" : "Sign Up"}
      </h2>

      {notice && (
        <p role="status" className="mb-4 rounded-lg bg-green-50 px-4 py-2 text-sm text-green-800">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="First name"
                autoComplete="given-name"
                value={signup.first_name}
                onChange={updateSignup("first_name")}
                className={inputClass}
              />
              <input
                type="text"
                placeholder="Last name"
                autoComplete="family-name"
                value={signup.last_name}
                onChange={updateSignup("last_name")}
                className={inputClass}
              />
            </div>
            <input
              type="text"
              placeholder="Username"
              autoComplete="username"
              required
              value={signup.username}
              onChange={updateSignup("username")}
              className={inputClass}
            />
            <input
              type="email"
              placeholder="Email"
              autoComplete="email"
              required
              value={signup.email}
              onChange={updateSignup("email")}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="new-password"
              required
              value={signup.password}
              onChange={updateSignup("password")}
              className={inputClass}
            />
          </>
        ) : (
          <>
            <input
              type="text"
              placeholder="Email or username"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition disabled:opacity-60"
        >
          {submitting ? "Please wait…" : mode === "login" ? "Login" : "Create Account"}
        </button>
      </form>

      <p className="text-center text-sm mt-4">
        {mode === "login" ? (
          <>
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("signup")}
              className="text-red-600 hover:underline"
            >
              Sign Up
            </button>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => switchMode("login")}
              className="text-red-600 hover:underline"
            >
              Login
            </button>
          </>
        )}
      </p>
    </div>
  );
};

export default AuthForms;
