"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import NavTop from "@/components/layout/TopNav";
import AuthModal from "@/features/auth/components/AuthModal";
import { useAuth } from "@/features/auth/AuthProvider";

/** Connects the top navigation to the signed-in user, search and the auth modal. */
export default function SiteHeader() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup" | null>(null);

  const userName = user?.display_name || user?.first_name || user?.username;

  const handleAccountAction = async (action: string) => {
    switch (action) {
      case "signin":
        setAuthMode("login");
        break;
      case "signup":
        setAuthMode("signup");
        break;
      case "logout":
        await logout();
        router.refresh();
        break;
      default:
        // profile / orders / wishlist / settings pages are not built yet.
        break;
    }
  };

  return (
    <>
      <NavTop
        isLoggedIn={Boolean(user)}
        userName={userName}
        onAccountAction={handleAccountAction}
        onAccountClick={() => (user ? undefined : setAuthMode("login"))}
        onSearch={(query) => router.push(`/products?q=${encodeURIComponent(query)}`)}
      />
      <AuthModal
        key={authMode ?? "closed"}
        isOpen={authMode !== null}
        initialMode={authMode ?? "login"}
        onClose={() => {
          setAuthMode(null);
          router.refresh();
        }}
      />
    </>
  );
}
