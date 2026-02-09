"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [goal, setGoal] = useState("");
  const [persona, setPersona] = useState("end_user");
  const [mode, setMode] = useState("before_release");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function onRun() {
    setError("");
    if (!url.startsWith("http")) {
      setError("URL must start with http:// or https://");
      return;
    }
    if (goal.trim().length < 5) {
      setError("Write a clear user goal (at least 5 characters).");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/run-simulation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, goal, persona, mode }),
      });

      const data = await res.json();
      // For MVP: fake id
      const id = "123";
      // Store in session storage so /result can read it
      sessionStorage.setItem(`report_${id}`, JSON.stringify(data));
      router.push(`/result/${id}`);
    } catch (e) {
      setError("Failed to run simulation. Check console.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-white text-black">
      <div className="max-w-2xl mx-auto p-6">
        <h1 className="text-3xl font-bold">AI User Simulator</h1>
        <p className="mt-2 text-gray-600">
          Simulate real user behavior to catch UX friction before release and during continuous checks.
        </p>

        <div className="mt-8 space-y-4">
          <div>
            <label className="block text-sm font-medium">Product URL</label>
            <input
              className="mt-1 w-full rounded border p-3"
              placeholder="https://your-staging.app"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Critical user goal</label>
            <textarea
              className="mt-1 w-full rounded border p-3"
              rows={4}
              placeholder="Example: Sign up, create a project, invite a teammate."
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Persona</label>
              <select
                className="mt-1 w-full rounded border p-3"
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
              >
                <option value="end_user">End user</option>
                <option value="admin">Admin</option>
                <option value="pm">PM</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium">Mode</label>
              <select
                className="mt-1 w-full rounded border p-3"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="before_release">Before release</option>
                <option value="continuous">Continuous checks</option>
              </select>
            </div>
          </div>

          {error && <div className="text-red-600 text-sm">{error}</div>}

          <button
            onClick={onRun}
            disabled={loading}
            className="w-full rounded bg-black text-white p-3 font-semibold disabled:opacity-50"
          >
            {loading ? "Running..." : "Run user simulation"}
          </button>
        </div>
      </div>
    </main>
  );
}