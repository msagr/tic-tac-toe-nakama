"use client"

import client from "../../lib/nakamajs"
import { useState } from "react";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  async function registerUser(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(username, email, password);
    try {
        const session = await client.authenticateEmail(
            email,
            password,
            true,
            username
        )
        console.log('Successfully created: ', session)
    } catch (err) {
        console.error('Error creating user: ', err)
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#020617",
      }}
    >
      <div
        style={{
          padding: 24,
          borderRadius: 16,
          background: "#020617",
          border: "1px solid #1f2937",
          width: 360,
          boxShadow: "0 24px 60px rgba(15,23,42,0.9)",
        }}
      >
        <h1
          style={{
            fontSize: 22,
            marginBottom: 18,
            color: "#e5e7eb",
            fontWeight: 700,
          }}
        >
          Create account
        </h1>

        <form
          onSubmit={
            registerUser
          }
          style={{ display: "flex", flexDirection: "column", gap: 12 }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label
              htmlFor="username"
              style={{
                fontSize: 13,
                color: "#9ca3af",
                fontWeight: 500,
              }}
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label
              htmlFor="email"
              style={{
                fontSize: 13,
                color: "#9ca3af",
                fontWeight: 500,
              }}
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label
              htmlFor="password"
              style={{
                fontSize: 13,
                color: "#9ca3af",
                fontWeight: 500,
              }}
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                padding: "8px 10px",
                borderRadius: 8,
                border: "1px solid #1f2937",
                background: "#020617",
                color: "#e5e7eb",
                fontSize: 14,
                outline: "none",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              marginTop: 8,
              padding: "10px 12px",
              borderRadius: 999,
              border: "none",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              background:
                "linear-gradient(90deg, #7c3aed, #22d3ee)",
              color: "#020617",
              boxShadow: "0 16px 40px rgba(15,23,42,0.9)",
            }}
          >
            Register
          </button>
        </form>
      </div>
    </main>
  );
}