"use client";
import { signIn } from "next-auth/react";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    const res = await signIn("credentials", { email, password, redirect: true, callbackUrl: "/dashboard/positions" });
    console.log(res);
  };

  return (
    <div className="max-w-sm mx-auto mt-12 space-y-4">
      <h1 className="text-2xl font-semibold">Manager Login</h1>
      <input
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="Email"
        className="border rounded w-full p-2"
      />
      <input
        type="password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        placeholder="Password"
        className="border rounded w-full p-2"
      />
      <button onClick={handleLogin} className="px-4 py-2 bg-slate-800 text-white rounded">
        Login
      </button>
    </div>
  );
}
