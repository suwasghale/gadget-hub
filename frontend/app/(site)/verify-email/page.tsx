import { Suspense } from "react";

import VerifyEmail from "@/features/auth/components/VerifyEmail";

export const metadata = { title: "Verify email | Gadget Hub" };

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<p className="p-12 text-center">Verifying…</p>}>
      <VerifyEmail />
    </Suspense>
  );
}
