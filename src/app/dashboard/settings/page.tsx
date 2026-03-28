import * as React from "react";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { User, Mail, CreditCard, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { CurrencySettings } from "@/components/dashboard/CurrencySettings";
import { ensureUserAccount, getUserPlanSnapshot } from "@/lib/subscription";
import { formatFoodMenuLimit, hasFeature } from "@/lib/plan-rules";

export default async function SettingsPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) {
    redirect("/login");
  }

  const primaryEmail = user.emailAddresses[0]?.emailAddress || "";
  const firstName = user.firstName || "";
  const lastName = user.lastName || "";
  const imageUrl = user.imageUrl;

  const dbUser = await ensureUserAccount({
    userId,
    email: primaryEmail,
    name: `${firstName} ${lastName}`.trim(),
  });
  const planSnapshot = await getUserPlanSnapshot(userId);
  const planLabel = planSnapshot.rules.label;
  
  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your account preferences and billing.</p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-divider p-0">
          <div className="p-6 md:p-8 border-b border-divider bg-background/50">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <User className="text-primary" size={24} />
              Personal Information
            </h2>
            <p className="text-sm text-text-secondary mt-1">Update your basic profile details.</p>
          </div>
          
          <div className="p-6 md:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-24 h-24 rounded-full border-4 border-background shadow-premium overflow-hidden bg-divider flex items-center justify-center flex-shrink-0 relative group cursor-pointer">
                {imageUrl ? (
                  <img src={imageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-text-secondary" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImageIcon className="text-white" size={24} />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-bold text-text-primary">Profile Avatar</p>
                <p className="text-sm text-text-secondary mb-3">Click on the image to update your avatar through Clerk.</p>
                <Button variant="secondary" className="py-2 px-4 text-sm rounded-xl cursor-pointer">Change Avatar</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-divider">
              <div>
                <Input 
                  labelInside="First Name" 
                  defaultValue={firstName} 
                  icon={<User size={18} />} 
                />
              </div>
              <div>
                <Input 
                  labelInside="Last Name" 
                  defaultValue={lastName} 
                  icon={<User size={18} />} 
                />
              </div>
              <div className="md:col-span-2">
                <Input 
                  labelInside="Email Address" 
                  defaultValue={primaryEmail} 
                  icon={<Mail size={18} />}
                  readOnly
                  className="bg-black/5 opacity-70 cursor-not-allowed"
                  suffix="Managed by Clerk"
                />
              </div>
            </div>
            
            <div className="flex justify-end pt-2">
              <Button variant="primary" className="px-8 py-3 rounded-xl shadow-sm cursor-pointer">Save Changes</Button>
            </div>
          </div>
        </Card>

        <CurrencySettings defaultCode={dbUser?.currencyCode || "USD"} />

        {/* Billing Card */}
        <Card className="bg-surface rounded-3xl overflow-hidden shadow-sm border border-divider p-0">
          <div className="p-6 md:p-8 border-b border-divider bg-background/50">
            <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
              <CreditCard className="text-primary" size={24} />
              Subscription & Billing
            </h2>
            <p className="text-sm text-text-secondary mt-1">Manage your plan and monetization limits.</p>
          </div>
          
          <div className="p-6 md:p-8">
            <div className="bg-background rounded-2xl p-6 border border-divider flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
               <div>
                 <p className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-1">Current Plan</p>
                 <div className="flex items-end gap-3">
                   <h3 className="text-3xl font-bold text-text-primary">{planLabel}</h3>
                   <span className="text-sm text-text-secondary mb-1">{planSnapshot.rules.priceLabel}</span>
                 </div>
               </div>
               <div>
                  <Button variant="secondary" className="px-6 py-3 rounded-xl" disabled>
                    Payments Coming Soon
                  </Button>
               </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-bold text-text-primary">Current Plan Limits</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                   {planSnapshot.usage.totalPages} of {planSnapshot.rules.maxPages} Lynx used.
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                   {planSnapshot.usage.foodMenus} of {formatFoodMenuLimit(planSnapshot.rules.maxFoodMenus)} used.
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                   {planSnapshot.rules.dailyEmailNotifications} email notifications per day.
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                   Creator and Studio upgrades will unlock after payments are integrated.
                 </li>
              </ul>
            </div>

            <div className="space-y-4 pt-2">
              <h4 className="font-bold text-text-primary">Feature Access</h4>
              <ul className="space-y-2 text-text-secondary text-sm">
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                   Advanced Food Menu: {hasFeature(planSnapshot.plan, "ADVANCED_FOOD_MENU") ? "Unlocked" : "Creator required"}
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                   Custom Branding: {hasFeature(planSnapshot.plan, "CUSTOM_BRANDING") ? "Unlocked" : "Creator required"}
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                   Advanced Analytics: {hasFeature(planSnapshot.plan, "ADVANCED_ANALYTICS") ? "Unlocked" : "Studio required"}
                 </li>
                 <li className="flex items-center gap-2">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0"></div>
                   Data Export: {hasFeature(planSnapshot.plan, "DATA_EXPORT") ? "Unlocked" : "Studio required"}
                 </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Danger Zone */}
        <Card className="bg-error/5 rounded-3xl overflow-hidden border border-error/20 p-0">
          <div className="p-6 md:p-8 border-b border-error/10">
            <h2 className="text-xl font-bold text-error flex items-center gap-2">
              <AlertTriangle size={24} />
              Danger Zone
            </h2>
            <p className="text-sm text-text-secondary mt-1">Irreversible and destructive actions.</p>
          </div>
          <div className="p-6 md:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
             <div>
               <h4 className="font-bold text-text-primary">Delete Account</h4>
               <p className="text-sm text-text-secondary">Permanently delete your account and all your Lynx data. This cannot be undone.</p>
             </div>
             <Button className="bg-error hover:bg-error/90 text-white font-bold px-6 py-3 rounded-xl shadow-sm cursor-pointer whitespace-nowrap">
               Delete Account
             </Button>
          </div>
        </Card>

      </div>
    </div>
  );
}
