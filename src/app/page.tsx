import { LandingNavbar } from "@/components/landing/LandingNavbar";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingStats } from "@/components/landing/LandingStats";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { LandingShowcase } from "@/components/landing/LandingShowcase";
import { LandingCTA } from "@/components/landing/LandingCTA";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();
  
  return (
    <div className="min-h-screen bg-background selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <LandingNavbar />
      
      <main>
        <LandingHero />
        
        <LandingStats />

        <LandingFeatures />
        
        <LandingShowcase />
        
        <LandingCTA />
      </main>
      
      <LandingFooter />
    </div>
  );
}
