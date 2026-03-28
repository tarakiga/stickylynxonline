import * as React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Wrench } from "lucide-react";
import { getUserPlanSnapshot } from "@/lib/subscription";
import { hasFeature } from "@/lib/plan-rules";

export default async function AnalyticsPage() {
  const { userId } = await auth();
  const user = await currentUser();
  if (!userId || !user) {
    redirect("/login");
  }
  const planSnapshot = await getUserPlanSnapshot(userId);
  const hasAdvancedAnalytics = hasFeature(planSnapshot.plan, "ADVANCED_ANALYTICS");

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Analytics</h1>
        <p className="text-text-secondary mt-1">View performance insights and engagement metrics.</p>
      </div>

      <Card className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-divider p-0">
        <div className="p-8 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Wrench size={28} />
          </div>
          <h2 className="text-xl font-bold text-text-primary">Under Development</h2>
          <p className="text-text-secondary max-w-md">
            This section is being built. Soon you&apos;ll be able to track views, referrers, and trends across all your Lynx pages.
          </p>
          <Badge variant="info">{hasAdvancedAnalytics ? "Studio Enabled" : "Studio Required"}</Badge>
          {!hasAdvancedAnalytics ? (
            <p className="text-xs text-text-secondary max-w-md">
              Advanced Analytics is reserved for Studio. Payments are not live yet, so higher tiers remain locked.
            </p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
