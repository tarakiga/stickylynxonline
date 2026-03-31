import * as React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Palette } from "lucide-react";
import { ensureUserAccount, getUserPlanSnapshot } from "@/lib/subscription";
import { hasFeature } from "@/lib/plan-rules";
import { normalizeBrandProfile } from "@/lib/branding";
import { BrandingWorkspace } from "@/components/dashboard/BrandingWorkspace";
import { getUserBrandingById } from "@/lib/user-branding";

export default async function BrandingPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) {
    redirect("/login");
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress || "";
  await ensureUserAccount({
    userId,
    email: primaryEmail,
    name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
  });
  const dbUser = await getUserBrandingById(userId);
  const planSnapshot = await getUserPlanSnapshot(userId);
  const hasCustomBranding = hasFeature(planSnapshot.plan, "CUSTOM_BRANDING");
  const initialProfile = normalizeBrandProfile(dbUser?.brandProfile, dbUser?.name || dbUser?.email || primaryEmail);

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Branding</h1>
        <p className="text-text-secondary mt-1">Manage reusable brand identity tokens that flow from the design system into your Lynx pages.</p>
      </div>

      <div className="rounded-3xl border border-primary/20 bg-primary/5 px-6 py-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Palette size={22} />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary mb-1">Design System First</p>
              <h2 className="text-xl font-bold text-text-primary">Brand identity is token-driven</h2>
              <p className="text-sm text-text-secondary mt-1 max-w-3xl">
                This page uses the same foundation as the design system: named color tokens, Asap-based typography presets, and reusable surfaces/buttons instead of one-off page styling.
              </p>
            </div>
          </div>
          <Badge variant={hasCustomBranding ? "success" : "info"}>{hasCustomBranding ? `${planSnapshot.rules.label} Enabled` : "Creator Required"}</Badge>
        </div>
      </div>

      <BrandingWorkspace
        initialProfile={initialProfile}
        planLabel={planSnapshot.rules.label}
        canUseCustomBranding={hasCustomBranding}
      />
    </div>
  );
}
