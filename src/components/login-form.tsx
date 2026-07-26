"use client";
import { useState } from "react";

export default function LoginForm() {
  const [key, setKey] = useState(""); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: React.FormEvent) { event.preventDefault(); setLoading(true); setError(""); const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ apiKey: key }) }); if (response.ok) location.assign("/canvas"); else { const body = await response.json(); setError(body.error ?? "Sign-in failed."); setLoading(false); } }
  return <form onSubmit={submit} className="login-panel"><p className="panel-kicker">SECURE ACCOUNT CHECK</p><h2>Sign in with Torn</h2><p className="muted">Use a separate Limited API key for this community project.</p><input required minLength={16} value={key} onChange={event => setKey(event.target.value)} type="password" autoComplete="off" placeholder="Limited Torn API Key" /><button disabled={loading} className="button">{loading ? "Checking key…" : "Sign in"}</button>{error && <p className="notice">{error}</p>}<div className="api-notice"><b>Torn API transparency</b><dl><dt>Stored data</dt><dd>Player ID, display name, claimed pixels</dd><dt>Shared data</dt><dd>Public pixel ownership</dd><dt>Key storage</dt><dd>Not stored</dd><dt>Required access</dt><dd>Limited</dd></dl></div></form>;
}
