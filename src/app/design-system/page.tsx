import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"
import { Input } from "@/components/ui/Input"
import { SearchDropdown } from "@/components/ui/SearchDropdown"
import { LocationSearch } from "@/components/ui/LocationSearch"
import { StepProgress } from "@/components/ui/Progress"
import { Switch, SegmentedControl } from "@/components/ui/Switch"
import { MediaCard } from "@/components/ui/MediaCard"
import { AudioController } from "@/components/ui/AudioController"
import { AssetButton } from "@/components/ui/AssetButton"
import { PullQuote } from "@/components/ui/PullQuote"
import { TechGrid } from "@/components/ui/TechGrid"
import { VisualGallery } from "@/components/ui/VisualGallery"
import { MultiContactInput } from "@/components/ui/MultiContactInput"
import { DatePicker } from "@/components/ui/DatePicker"
import { Dropzone } from "@/components/ui/Dropzone"
import { Select } from "@/components/ui/Select"
import { StatCard } from "@/components/ui/StatCard"
import { UserCard } from "@/components/ui/UserCard"
import { AssetCard } from "@/components/ui/AssetCard"
import { SelectableCard } from "@/components/ui/SelectableCard"
import { DraggableList } from "@/components/ui/DraggableList"
import { Banner, CookiesBanner } from "@/components/ui/Banner"
import { PageItemCard } from "@/components/ui/PageItemCard"
import { ModalShowcase } from "./ModalShowcase"
import { CategoryCard } from "@/components/ui/CategoryCard"
import { PriceRepeater } from "@/components/ui/PriceRepeater"
import { DEMO_ASSETS_ALLOWED } from "@/config/services"

export default function DesignSystemPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-12 py-10 px-6 relative pb-24">
      <CookiesBanner />
      <div>
        <h1 className="text-3xl font-bold mb-2">Design System</h1>
        <p className="text-text-secondary">Core atomic components powered by Tailwind 4 and Next.js 15.</p>
      </div>
      
      <section>
        <h2 className="text-xl font-bold border-b border-divider pb-2 mb-6">Profile Item Overview</h2>
        <div className="space-y-4 max-w-5xl">
          <PageItemCard 
            id="demo-1"
            title="the restaurant"
            handle="the-restaurant"
            category="FOOD_MENU"
            imageUrl={DEMO_ASSETS_ALLOWED ? "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=150&q=80" : undefined} 
          />
          <PageItemCard 
            id="demo-2"
            title="electronic press kit"
            handle="my-epk"
            category="EPK"
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold border-b border-divider pb-2 mb-6">Information Cards (Categories)</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-7xl">
           <div>
              <h3 className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">Grid Layout</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <CategoryCard 
                    title="Food & Drink" 
                    description="Curated templates for restaurants, cafes, and pop-up dining experiences with built-in menus." 
                    imageUrl={DEMO_ASSETS_ALLOWED ? "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=400&q=80" : undefined} 
                 />
                 <CategoryCard 
                    title="Music & Audio" 
                    description="Electronic Press Kits (EPKs), release radar, and tour dates for audio professionals." 
                    imageUrl={DEMO_ASSETS_ALLOWED ? "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80" : undefined} 
                 />
              </div>
           </div>
           <div>
              <h3 className="text-sm font-bold text-text-secondary mb-4 uppercase tracking-wider">List Layout</h3>
              <div className="space-y-4">
                 <CategoryCard 
                    layout="list"
                    title="Photography Portfolios" 
                    description="Showcase your visual work with high-resolution galleries and booking forms specifically designed for creatives." 
                    imageUrl={DEMO_ASSETS_ALLOWED ? "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=400&q=80" : undefined} 
                 />
                 <CategoryCard 
                    layout="list"
                    title="Link in Bio Basic" 
                    description="The classic multi-link setup perfect for quick social media routing and basic analytics tracking." 
                    imageUrl={DEMO_ASSETS_ALLOWED ? "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80" : undefined} 
                 />
              </div>
           </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold border-b border-divider pb-2 mb-6">Modals & Dialogs</h2>
        <ModalShowcase />
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold border-b border-divider pb-2 mb-6">Buttons & Inputs</h2>
            <div className="space-y-6">
              <div className="flex flex-wrap gap-4">
                <Button variant="primary">Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
              </div>
              <Card className="space-y-4">
                <Input floatingLabel="Floating Label" />
                <Input labelInside="Website URL" defaultValue="stickylynx.com" />
                <Input prefix="$" suffix="USD" defaultValue="99.00" />
                <Input type="password" defaultValue="secret1234" />
                <Input placeholder="mursi@example.com" success />
                <Input placeholder="mursi@" error="Please enter a valid email address." />
                <Input 
                  placeholder="Your email" 
                  actionButton={<button className="bg-primary hover:bg-primary-hover text-white text-sm font-semibold px-4 rounded-xl transition-colors h-full border-none cursor-pointer">Join</button>}
                />
              </Card>
              <Card className="space-y-4">
                <MultiContactInput label="Invite Team (Multi-contact)" />
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold border-b border-divider pb-2 mb-6">Controls & Toggles</h2>
            <div className="space-y-6">
              <Card className="space-y-4">
                <Switch label="Email Alerts" defaultChecked />
                <Switch label="Push Notifications" />
              </Card>
              <SegmentedControl 
                name="billing" 
                options={[
                  { label: "Monthly", value: "month" },
                  { label: "Yearly", value: "year", badge: "-20%" }
                ]} 
              />
              <Card className="space-y-4 p-0 px-0 pb-6 pt-0 border-none bg-transparent">
                <StepProgress 
                  steps={[
                    { id: "1", label: "Account" },
                    { id: "2", label: "Profile Details" },
                    { id: "3", label: "Publish" }
                  ]}
                  currentStep={2}
                />
              </Card>
            </div>
          </section>
        </div>

        <div className="space-y-12">
          <section>
            <h2 className="text-xl font-bold border-b border-divider pb-2 mb-6">Advanced Form & Search</h2>
            <div className="space-y-6">
              <Card className="space-y-4">
                <PriceRepeater label="Product Variations" />
              </Card>
              <Dropzone label="Upload Cover" hint="SVG, PNG, JPG or GIF (max. 800x400px)" />
              <SearchDropdown 
                label="Category"
                options={["Art & Design", "Business & Tech", "Education", "Food & Drink", "Music & Audio", "Photography", "Video & Film"]}
                placeholder="Select category..."
              />
              <LocationSearch label="Location (Async OpenStreetMap)" />
              <Card className="space-y-4">
                 <Select label="Language" options={[{label: "🇬🇧 English (UK)", value:"en-uk"}, {label: "🇪🇸 Español", value:"es"}]} />
                 <DatePicker label="Select Date" value="March 24, 2026" />
              </Card>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold border-b border-divider pb-2 mb-6">Cards & Banners</h2>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                 <StatCard title="Total Views" mainValue="128.4K" trend="+14%" />
                 <StatCard title="Storage" mainValue="4.2" subValue="/ 10 GB" progress={4.2} maxProgress={10} />
              </div>
              <SelectableCard title="Pro Creator Plan" desc="Unlock all templates and advanced analytics." name="plan" value="pro" defaultChecked />
              <AssetCard title="Digital Sneaker Asset" imageUrl={DEMO_ASSETS_ALLOWED ? "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=400&q=80" : ""} currPrice="$80" origPrice="$100" saleBadge="Sale -20%" newBadge />
              <UserCard name="Jane Doe" handle="@janedoe" avatarUrl={DEMO_ASSETS_ALLOWED ? "https://i.pravatar.cc/100?img=33" : undefined} />
              <UserCard name="Alex Murphy" isPro email="alex.murphy@example.com" location="San Francisco, CA" />
              <Banner title="Verify your email address" desc={<>Please check your inbox to activate your account features. <a href="#" className="underline font-bold ml-1">Resend email</a></>} />
              <Banner title="Upgrade to Premium" desc="Get 0% fees on all sales." actionLabel="Upgrade" variant="promo" />
            </div>
          </section>
        </div>

        <div className="space-y-12 lg:col-span-1 md:col-span-2">
          <section>
            <h2 className="text-xl font-bold border-b border-divider pb-2 mb-6">List & Layouts</h2>
            <div className="space-y-6">
               <DraggableList 
                  title="Your Links (Drag & Drop)" 
                  items={[
                    {id: "1", title: "My New Video", subtitle: "youtube.com/watch...", iconText: "YT", colorClass: "bg-red-100 text-red-500"},
                    {id: "2", title: "Spotify Playlist", subtitle: "spotify.com/playlist...", iconText: "SP", colorClass: "bg-green-100 text-green-500"}
                  ]} 
               />
            </div>
          </section>
          <section>
            <h2 className="text-xl font-bold border-b border-divider pb-2 mb-6">EPK Content Blocks</h2>
            <div className="space-y-6">
              <MediaCard 
                title="Midnight Echoes" 
                subtitle="Single • 2026" 
                imageUrl={DEMO_ASSETS_ALLOWED ? "https://images.unsplash.com/photo-1614680376593-902f74cf0d41?auto=format&fit=crop&w=200&q=80" : ""} 
              />
              <AudioController />
              <AssetButton label="Access Kit" />
              <PullQuote 
                quote="Stickylynx’s latest album redefines the modern synthesizer soundpad. Absolute genius." 
                source="Pitchfork Review" 
              />
              <TechGrid 
                items={[
                  { channel: "CH 1", desc: "Lead Vocals (Stage Center)", needs: "Needs", req: "Shure SM58 / Boom Stand" },
                  { channel: "CH 2", desc: "Acoustic Guitar (DI)", needs: "Needs", req: "XLR + Phantom Power" }
                ]}
              />
              <VisualGallery 
                images={DEMO_ASSETS_ALLOWED ? [
                  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=300&q=80",
                  "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f924?auto=format&fit=crop&w=300&q=80",
                  "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=300&q=80"
                ] : []}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
