"use client";
import { useState } from "react";

export default function ApplicantDemo() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-semibold">Sample Applicant Flow</h2>
      <p className="text-slate-600">Demo: fill name and email to start.</p>
      <div className="mt-4 space-y-2">
        <input
          placeholder="Full name"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border rounded p-2"
        />
        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full border rounded p-2"
        />
        <button className="px-4 py-2 bg-slate-800 text-white rounded" onClick={() => alert("Start interview (demo)")}>
          Start Interview (Demo)
        </button>
      </div>
    </div>
  );
}
