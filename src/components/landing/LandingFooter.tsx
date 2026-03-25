import Link from 'next/link';

export function LandingFooter() {
  const years = new Date().getFullYear();
  return (
    <footer className="bg-surface border-t border-divider pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-12 mb-16">
          {/* Logo and About column */}
          <div className="col-span-2 space-y-6">
            <Link href="/" className="flex items-center gap-2.5">
              <img src="/logo.png" alt="Stickylynx" className="w-9 h-9 sm:w-10 sm:h-10 object-contain" />
              <span className="font-extrabold text-2xl tracking-tighter text-text-primary">Stickylynx</span>
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs font-semibold">
              Stickylynx is the premium digital destination for modern professionals. One link, one universe, everything you need to showcase your talent.
            </p>
          </div>
          
          {/* Links columns */}
          <div>
            <h5 className="text-sm font-black text-text-primary uppercase tracking-[0.15em] mb-6">Product</h5>
            <ul className="space-y-4">
              <li><Link href="#features" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Features</Link></li>
              <li><Link href="#templates" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Templates</Link></li>
              <li><Link href="#pricing" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-black text-text-primary uppercase tracking-[0.15em] mb-6">Support</h5>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Help Center</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-black text-text-primary uppercase tracking-[0.15em] mb-6">Legal</h5>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
          
          <div>
            <h5 className="text-sm font-black text-text-primary uppercase tracking-[0.15em] mb-6">Social</h5>
            <ul className="space-y-4">
              <li><Link href="#" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Twitter</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">Instagram</Link></li>
              <li><Link href="#" className="text-sm text-text-secondary font-bold hover:text-primary transition-colors">LinkedIn</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-divider pt-12 flex flex-col md:flex-row items-center justify-between gap-6">
           <p className="text-xs font-bold text-text-secondary tracking-wide">© {years} Stickylynx. A product of Artamenix. Made with passion for the creator economy.</p>
           <div className="flex gap-4">
              <div className="w-10 h-10 bg-background border border-divider rounded-xl hover:bg-primary hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm">
                 <span className="text-[10px] font-black uppercase">En</span>
              </div>
           </div>
        </div>
      </div>
    </footer>
  );
}
