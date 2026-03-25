"use client";
import Link from 'next/link';
import { UserButton, useUser, SignInButton } from '@clerk/nextjs';
import { Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export function LandingNavbar() {
  const { isSignedIn } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-surface/80 backdrop-blur-md border-b border-divider py-3 shadow-sm' : 'bg-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <img src="/logo.png" alt="Stickylynx" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
          <span className="font-bold text-xl sm:text-2xl tracking-tight text-text-primary">Stickylynx</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">Features</Link>
          <Link href="#templates" className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">Templates</Link>
          <Link href="#pricing" className="text-sm font-semibold text-text-secondary hover:text-primary transition-colors">Pricing</Link>
          
          <div className="h-4 w-px bg-divider mx-2" />
          
          {isSignedIn ? (
            <div className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-bold text-primary hover:opacity-85 transition-opacity">Go to Dashboard</Link>
              <UserButton afterSignOutUrl="/" />
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                 <button className="text-sm font-bold text-text-secondary hover:text-text-primary cursor-pointer border-none bg-transparent">Login</button>
              </SignInButton>
              <Link href="/register" className="btn-primary text-sm font-bold px-6 py-2.5 rounded-xl shadow-premium">
                Create Account
              </Link>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 text-text-secondary transition-colors bg-transparent border-none">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-surface border-b border-divider p-6 flex flex-col gap-5 animate-in slide-in-from-top-4 duration-200">
           <Link onClick={() => setIsOpen(false)} href="#features" className="text-lg font-semibold text-text-secondary">Features</Link>
           <Link onClick={() => setIsOpen(false)} href="#templates" className="text-lg font-semibold text-text-secondary">Templates</Link>
           <Link onClick={() => setIsOpen(false)} href="#pricing" className="text-lg font-semibold text-text-secondary">Pricing</Link>
           <hr className="border-divider" />
           {isSignedIn ? (
             <Link href="/dashboard" className="btn-primary text-center font-bold py-3 rounded-xl">Go to Dashboard</Link>
           ) : (
             <div className="flex flex-col gap-4">
               <SignInButton mode="modal">
                  <button className="text-lg font-bold text-text-secondary border-none bg-transparent py-2">Login</button>
               </SignInButton>
               <Link href="/register" className="btn-primary text-center font-bold py-3 rounded-xl">Create Account</Link>
             </div>
           )}
        </div>
      )}
    </nav>
  );
}
