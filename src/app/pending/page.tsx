"use client";

import { StudioLogo } from "@/components/StudioLogo";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function PendingPage() {
  const { signOut } = useAuth();
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#F8F5EE] text-neutral-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="flex justify-center">
          <StudioLogo className="text-black/70" />
        </div>
        <div className="rounded-2xl border border-neutral-200 bg-white p-8 shadow-sm space-y-4">
          <h1 className="font-[var(--font-playfair)] text-xl">Access Pending</h1>
          <p className="text-sm text-black/70 leading-relaxed">
            Your account has been created, but access hasn&apos;t been granted yet.
            We&apos;ll let you know once your account is activated.
          </p>
          <p className="text-xs text-black/50">
            If you believe this is an error, please contact us.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            await signOut();
            router.push("/login");
          }}
          className="text-sm font-medium text-black/60 hover:text-black"
        >
          Sign out
        </button>
      </div>
    </main>
  );
}
