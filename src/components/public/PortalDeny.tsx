"use client";
import * as React from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export function PortalDeny({ handle, pinEnabled, ownerEmail }: { handle: string; pinEnabled: boolean; ownerEmail?: string }) {
  const [pin, setPin] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const url = new URL(window.location.href);
    const access = url.searchParams.get("access");
    if (access) {
      (async () => {
        try {
          const u = `/api/portal/${handle}/auth?access=${encodeURIComponent(access)}`;
          const res = await fetch(u, { method: "GET" });
          if (res.ok) {
            window.location.href = `/${handle}`;
          } else {
            setError("Access link invalid or expired. Try PIN or contact owner.");
          }
        } catch {
          setError("Network error verifying access link.");
        }
      })();
    }
  }, [handle]);

  async function submitPin() {
    setLoading(true);
    setError(null);
    try {
      const u = `/api/portal/${handle}/auth?pin=${encodeURIComponent(pin)}`;
      const res = await fetch(u, { method: "GET" });
      if (res.ok) {
        window.location.href = `/${handle}`;
      } else {
        setError("Invalid PIN. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-screen-sm mx-auto px-4 py-10">
      <Card className="rounded-[2rem] border border-divider shadow-premium p-8 bg-surface space-y-5 text-center">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20 shadow-sm">
          <div className="w-2 h-2 rounded-full bg-current" />
          Private Project Portal
        </div>
        <h1 className="text-2xl font-bold text-text-primary">Access Restricted</h1>
        <p className="text-text-secondary">This page is only visible to the project owner and the client.</p>
        {pinEnabled ? (
          <div className="space-y-3">
            <Badge variant="neutral">PIN Required</Badge>
            <div className="max-w-xs mx-auto">
              <Input labelInside="Enter 6-digit PIN" value={pin} onChange={(e) => setPin(e.target.value)} />
              <Button variant="primary" onClick={submitPin} disabled={loading || pin.length === 0} className="mt-3 w-full">
                {loading ? "Verifying…" : "Continue"}
              </Button>
              {error && <p className="text-xs text-error mt-2">{error}</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">Use the secure invitation link sent to your email to access this portal.</p>
          </div>
        )}
        {ownerEmail && (
          <p className="text-xs text-text-secondary">Need help? <a href={`mailto:${ownerEmail}`} className="text-primary underline">Contact the project owner</a>.</p>
        )}
        <p className="text-[10px] text-text-secondary opacity-60 font-bold tracking-widest uppercase">Powered by Stickylynx</p>
      </Card>
    </div>
  );
}
