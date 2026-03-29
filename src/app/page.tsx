import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingStats } from "@/components/landing/LandingStats";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingShowcase } from "@/components/landing/LandingShowcase";
import { LandingRequest } from "@/components/landing/LandingRequest";
import { LandingPricing } from "@/components/landing/LandingPricing";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function Home() {
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <LandingNavbar />
      
      <main>
        <LandingHero />
        
        <LandingStats />

        <LandingFeatures />
        
        <LandingPricing />

        <LandingShowcase />

        <LandingRequest />
        
        <LandingCTA />
      </main>
      
      <LandingFooter />
    </div>
  );
}
