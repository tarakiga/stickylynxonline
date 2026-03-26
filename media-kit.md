## 1. Role of the Influencer Media Kit page

- **Audience**: brand managers, agencies, PR people evaluating creators for campaigns.[^3][^4]
- **Goal**: in under a minute, brands should understand who the creator is, who their audience is, how content performs, and what services they offer, with a clear way to contact or brief them.[^5][^1]
- **Format**: live web page (not a static PDF), always up to date, sharable as a single link similar to your EPK and other categories.[^6][^7]

***

## 2. Information architecture for the Media Kit template

From top to bottom on the page (each a configurable block):

1. **Hero / Creator identity block**
    - Elements:
        - Creator name, handle, niche (e.g., “Lifestyle \& Beauty Creator”, “Tech Reviewer”).[^2][^1]
        - Profile photo, logo, platform icons (IG, TikTok, YouTube, blog).
        - Primary CTA: “Request a campaign” or “Email me your brief”.[^1]
    - Design: bold Asap heading, branded background color or image; this ties to your design system.
2. **About / Bio block**
    - Short, punchy paragraph: who they are, what topics they cover, what makes them unique.[^8][^2]
    - Optional bullet points (content pillars) such as “Clean beauty”, “Solo travel”, “Productivity hacks”.[^9]
3. **Audience \& demographics block**
    - Visual stats brands care about:[^5][^2][^1]
        - Top age ranges.
        - Gender split.
        - Top countries / cities.
        - Key interests or segments (e.g., “Young professionals”, “Gen Z gamers”).
    - Design: use your stat cards, chips, and simple charts (you can start with text + icon cards and add charts later).[^6][^5]
4. **Social metrics block**
    - Per‑platform metrics summary:[^10][^2][^5]
        - Followers/subscribers.
        - Average views per post/reel/video.
        - Average engagement rate (or likes/comments per post).
    - Layout: responsive grid of “platform cards” (Instagram, TikTok, YouTube, etc.) using consistent component styling.
5. **Best work / collaborations block**
    - Featured campaigns or posts with brands:[^11][^2][^1]
        - Each card: brand logo/name, campaign title, platform, short outcome (“+35% above benchmark engagement”).
        - Clickable links to live posts or case studies where possible.[^12][^9]
    - This mirrors the “press quotes” area in EPK but for brand work.
6. **Content examples block**
    - Embedded or thumbnail previews of 3–6 standout posts/reels/videos across platforms.[^11][^5]
    - Each with label: “TikTok – GRWM for Brand X”, “YouTube – Sponsored review for Product Y”.
7. **Services \& packages block**
    - List what the creator offers:[^2][^1]
        - e.g., “Instagram reel + 3 stories”, “TikTok integration”, “YouTube dedicated review”, “UGC only (no posting)”.
    - Optional: package names and inclusions; rates can be:
        - Hidden (by default) with note: “Rates available on request”.
        - Or shown as “From \$X” ranges if the creator chooses to reveal them.[^1][^6]
8. **Testimonials / social proof block**
    - Short quotes from brands or agencies:
        - “X delivered incredible content that converted 3x our usual.” – Brand Y.[^11][^1]
    - Use your quote/blockquote component with brand logos where possible.
9. **Contact \& brief block**
    - Clear channels:[^3][^2]
        - Email, agency/manager contact, website.
    - Optional: embedded brief request form (simple fields: brand name, campaign goal, budget range, timeline) that fits your project’s “form on a page” pattern.

***

## 3. Template configuration within your framework

Define a new **category**: `Influencer Media Kit`.

- `category: "InfluencerMediaKit"`
- Default blocks (ordered):

1. `CreatorHeroBlock`
2. `CreatorBioBlock`
3. `AudienceDemographicsBlock`
4. `PlatformMetricsBlock`
5. `CollaborationHighlightsBlock`
6. `ContentExamplesBlock`
7. `ServicesPackagesBlock`
8. `TestimonialsBlock`
9. `ContactBriefBlock`

Each block is schema‑driven, similar to EPK:

- `PlatformMetricsBlock` example schema:
    - `platforms: PlatformMetric[]` where PlatformMetric = { name, handle, url?, followers, avgViews, engagementRate, notes? }.
- `AudienceDemographicsBlock`:
    - `topAges`, `genderSplit`, `topCountries`, `interests`.
- `ServicesPackagesBlock`:
    - `services: Service[]` where Service = { name, description, deliverables[], startingPrice?, currency?, includesUsageRights? }.

This keeps it extensible and aligned with the rest of your one‑pager engine.[^7][^1]

***

## 4. Creator editor experience

When a user selects **Influencer Media Kit**:

1. **Quick start wizard**
    - Step 1: basic identity (name, handle, niche, main platform).
    - Step 2: connect or manually enter metrics (followers, typical views).
    - Step 3: choose 3–6 best posts to showcase (paste links).[^7][^5]
2. **Block‑based editing (guided)**
    - Each block has inline hints drawn from best‑practice guidance:
        - Bio: “1–3 sentences, focus on niche and outcomes for brands.”[^8][^2]
        - Audience: “Highlight age, gender, top locations; keep it simple and visual.”[^5][^6]
        - Services: “List 3–6 offerings; be clear what’s included.”[^1]
3. **Preview**
    - Live preview on the right; the shared link stays stable while content updates.
    - Default URL pattern: `site.com/@handle/media-kit`.

***

## 5. Design‑system hooks

Use this page type to add specific **components**:

- Metric/stat cards (with icons for followers, views, engagement).
- Simple bar/pie visualization styles for demographics (can start as styled bars or chips).[^6][^5]
- Brand logo tiles, testimonial card, service card.

In the `/design-system` guide, add “Influencer Media Kit” as a layout example alongside EPK, showing how these components combine.

***

## 6. v1 vs later enhancements

**v1**

- Static (but live) media kit: manual entry of metrics and links, core sections above.
- Simple analytics on views and “brief form” submissions.

**Later**

- Data sync from platforms (e.g., via APIs or manual CSV import) to keep metrics fresh.[^2][^6]
- Versioning for different pitches (e.g., “Beauty brands kit” vs “Travel brands kit”).
- Optional password‑protected or unlisted rates section.

The media kit should feel neutral across all creator types (social media, YouTube, newsletters, bloggers, podcasters) from day one.
