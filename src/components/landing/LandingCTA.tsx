 "use client";
import Link from 'next/link';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useUser } from '@clerk/nextjs';

export function LandingCTA() {
  const { isSignedIn } = useUser();
  if (isSignedIn) return null;
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Decorative accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-primary/20 rounded-full blur-[120px] -z-10" />
      
      <div className="max-w-5xl mx-auto px-6 text-center">
        <div className="bg-gradient-to-br from-primary via-accent to-accent p-1 rounded-[40px] shadow-premium">
           <div className="bg-surface rounded-[38px] p-12 sm:p-20 relative overflow-hidden text-center flex flex-col items-center">
              <div className="w-20 h-20 bg-primary/10 text-primary rounded-3xl flex items-center justify-center mb-10 shadow-sm animate-bounce duration-[3s]">
                 <Sparkles size={40} />
              </div>
              <h2 className="text-3xl sm:text-5xl font-black text-text-primary mb-6 tracking-tight max-w-2xl leading-tight">
                 Ready to Build Your Professional Digital Universe?
              </h2>
              <p className="text-lg sm:text-xl text-text-secondary mb-12 max-w-xl font-medium">
                 Start today for free. No credit card required. Experience the power of One Lynx for all your professional needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-6">
                 <Link href="/register" className="btn-primary px-12 py-5 rounded-2xl flex items-center justify-center gap-2.5 font-bold shadow-premium text-lg">
                   Claim Your Handle <ArrowRight size={22} />
                 </Link>
                 <Link href="/login" className="bg-surface border border-divider hover:bg-divider px-12 py-5 rounded-2xl flex items-center justify-center gap-2.5 font-bold transition-all text-lg cursor-pointer">
                   Login to Account
                 </Link>
              </div>
           </div>
        </div>
      </div>
    </section>
  );
}
