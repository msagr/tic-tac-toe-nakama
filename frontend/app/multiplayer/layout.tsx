"use client";

import React, { Suspense, useState, type ReactNode } from "react";
import { useUser } from "@/lib/hook/UserContext";
import Link from "next/link";

type Props = { children: ReactNode };

function SignInRequiredModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15,23,42,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#020617",
          borderRadius: 16,
          padding: 24,
          maxWidth: 380,
          width: "100%",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
          border: "1px solid rgba(148,163,184,0.4)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ fontSize: "1.1rem", marginBottom: 8 }}>Sign in required</h2>
        <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: 18 }}>
          You need an account to create or join multiplayer games. Please sign in
          or create a free account to continue.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            marginTop: 8,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 12px",
              borderRadius: 999,
              border: "1px solid rgba(148,163,184,0.5)",
              background: "transparent",
              color: "#e5e7eb",
              fontSize: "0.85rem",
            }}
          >
            Cancel
          </button>
          <Link
            href="/login"
            style={{
              padding: "6px 14px",
              borderRadius: 999,
              background:
                "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "#020617",
              fontSize: "0.85rem",
              fontWeight: 600,
            }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function MultiplayerLayout({ children }: Props) {
  const { user } = useUser();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  // We’ll control `authModalOpen` from child pages via callbacks (see below),
  // or you can lift this to context if you want to reuse globally.

  return (
    <Suspense fallback={<div style={{ padding: 20 }}>Loading multiplayer…</div>}>
      {children}
      <SignInRequiredModal
        open={authModalOpen && !user}
        onClose={() => setAuthModalOpen(false)}
      />
    </Suspense>
  );
}