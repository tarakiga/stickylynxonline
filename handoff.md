# Project Handoff

## Current Status
- Initialized Next.js project with TailwindCSS and custom design system (css variables).
- Fixed issue `middleware.ts` renamed to `proxy.ts`. 
- Set up Clerk Auth (v7.0.6) with Server Components condition checking (`await auth()`).
- Established Prisma setup (`src/lib/prisma.ts`) alongside Postgres schema.
- Developed Dashboard initial shell (`src/components/dashboard/Sidebar.tsx`, `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`).
- Added Analytics capability navigation and built a comprehensive Settings Page design covering General Profile & Subscription configurations.
- Implemented the "Create New Lynx" interactive modal hooking into URL search params to choose template types dynamically.
- Developed an animated `CreateLynxDrawer.tsx` side panel that slides in from the right to capture the initial `PROJECT_PORTAL` parameters and other template configurations before entering the block editor.
- Tested syncing Clerk users directly into the Prisma `User` table upon their first Dashboard visit.
- Built the `ProjectPortalEditor.tsx` Visual Block Workspace translating the `projectBuilder.md` concepts into functional CSS/React UI natively utilizing atomic components (`Card`, `DraggableList`, `StepProgress`).
- Successfully hooked up the routing segment `/dashboard/editor/[id]/page.tsx` to conditionally render customized Editors based on the dynamic database Lynx classification (`PROJECT_PORTAL`).
- **Editor Overhaul (v2):** All editor buttons are now fully functional with local state management. Drag-and-drop is fully responsive with touch/keyboard/pointer sensor support via `@dnd-kit`. Hardcoded hex colors replaced with design tokens (`--color-accent`, `--color-info`).

### New Atomic Components Added
- `Textarea` (`src/components/ui/Textarea.tsx`) — Reusable textarea atom matching Input pattern.
- `Badge` (`src/components/ui/Badge.tsx`) — Status indicator with variant support (success, warning, error, info, primary, neutral) and optional pulse animation.
- `IconButton` (`src/components/ui/IconButton.tsx`) — Icon-only action button with variant support (default, danger, success, primary).

### Editor Functional Buttons Wired
- **View Public Portal** — Opens public page in new tab.
- **Edit Stages** — Opens modal to add/remove milestones. Back/Next buttons advance timeline.
- **+ Add Task / + Add File** — Opens modal forms to create new items.
- **Edit/Delete** (on DraggableList items) — Edit opens modal, delete removes item.
- **Resolve / Reply into Tasks** (on feedback) — Marks feedback resolved or converts to task.
- **Post Announcement** — Submits announcement with success toast.
- **Manage** (invoice) — Placeholder alert for future implementation.

### DraggableList Upgrade
- Replaced visual-only drag with `@dnd-kit/core` + `@dnd-kit/sortable`.
- Touch sensor (mobile), Pointer sensor (desktop), Keyboard sensor (a11y).
- Callbacks for reorder, edit, delete, and add.
- Empty state messaging.

### Design System Token Additions
- `--color-accent`: `#FF3366` (light) / `#FF6690` (dark)
- `--color-info`: `#00E5FF` (light) / `#67EFFF` (dark)

### Editor v4: Stage-scoped Tasks, Typed Deliverables, Task Submissions
- **Tasks are now stage-scoped** — Each milestone owns its tasks. A stage dropdown lets you switch between stages in the Tasks section.
- **Task lifecycle** — Tasks have a `StatusToggle` cycling through `todo → in_progress → review → done`. Each task card shows due date, comment thread, and a "Submit" button.
- **Submit for Review** — Opens a modal with type dropdown (URL, file, image, text) that renders the matching field. Submission auto-advances status to `review`.
- **Typed Deliverables** — "Add Deliverable" modal starts with a type dropdown (file/image/url/text) then shows title + description. Frontend renders type-specific UI (Dropzone for file/image, clickable link for URL, text block for text).
- **New shared types** — `src/types/editor.ts` is the single source of truth for Task, Deliverable, MilestoneWithReviews, etc.
- **New components**: `StatusToggle` (atom), `TaskCard` (molecule), `DeliverableCard` (molecule).
- Tasks stored inside `MilestoneWithReviews.tasks[]`, saved in the TIMELINE block alongside milestones.

### EPK Category (Electronic Press Kit)
- **Types**: `src/types/epk.ts` — EpkHero, StreamingLink, EpkTrack, EpkVideo, EpkGalleryImage, EpkBio, EpkContact, platform metadata constants.
- **Editor**: `src/components/editor/EpkEditor.tsx` — 7-section form editor (Artist Identity, Streaming Links, Tracks, Videos, Gallery, Bio, Contact). Uses all design library atoms (Input, Textarea, Dropzone, Select, Modal, ConfirmDialog, IconButton). Saves to existing `/api/editor/[id]` PUT route.
- **Public Page**: `src/components/public/EpkPublic.tsx` — Premium public-facing EPK with cover image + profile photo overlay hero, streaming link pills, numbered track cards, YouTube/Vimeo embedded videos, press photo gallery with lightbox, bio section with press kit PDF download, contact card with email/phone/management/social links.
- **Block structure**: Uses existing BlockType enums (TEXT, LINK, AUDIO, VIDEO, IMAGE, CONTACT) — no schema migration needed. Hero and Bio both use TEXT blocks differentiated by `content.section`.
- **Creation flow**: `actions.ts` seeds 7 default blocks when category is EPK. CreateLynxDrawer shows EPK-specific info message. Editor and public pages route via category check.

### Stage Review System (v3)
- **StageReviewDrawer** (`src/components/editor/StageReviewDrawer.tsx`) — Slide-in panel opened by clicking any milestone stage.
  - Submit work for review: title, description, multi-type attachments (URL, image, document)
  - Review status management: Draft → Submitted → Approved / Needs Revision
  - Stage-linked activity timeline merging reviews + comments chronologically
  - "Copy Review Link" generates shareable URL with `?stage=` param
  - Comment input auto-links to the stage, with Enter-to-send
- **Activity Feed** replaces old "Client Feedback" section. Comments are stage-linked with badge tags.
- **Save API** (`PUT /api/editor/[id]`) — Persists all editor blocks to Prisma in a transaction.
- **Save button** with dirty state tracking, loading spinner, and last-saved timestamp.
- **StepProgress** now interactive: clickable stages with badge counts for pending items, `pb-10` fixes label clipping.
- **DraggableList** fully controlled (no internal state) — fixes React setState-during-render error.

### Property Listing Category
- **New category constant + helpers** live in `src/lib/property-listing.ts`.
- **Editor**: `src/components/editor/PropertyListingEditor.tsx` — multi-section property editor for hero, gallery, overview, specs, location, pricing, documents, and agent details.
- **Public page**: `src/components/public/PropertyListingPublic.tsx` with gallery support from `src/components/public/PropertyGalleryCarousel.tsx`.
- **Shared UI preview kit**: `src/components/ui/PropertyListingKit.tsx`.
- **Creation flow**: `createLynxPage` seeds default property blocks through `createDefaultPropertyListingBlocks(...)`.
- **Routing**:
  - editor route wiring lives in `src/app/dashboard/editor/[id]/page.tsx`
  - public route wiring lives in `src/app/[handle]/page.tsx`
  - create modal card is registered in `src/components/dashboard/CreateLynxModal.tsx`
- **Payload handling**: `next.config.ts` now sets `experimental.proxyClientMaxBodySize = "50mb"` so large editor saves can complete.
- **Upload protection**: property editor compresses uploaded images aggressively, caps document uploads, and blocks oversized save payloads before they hit the API.

### Home Page Custom Request Flow
- Added `LandingRequest` (`src/components/landing/LandingRequest.tsx`) directly after the premium template gallery on the home page.
- Added `POST /api/lynx-request` (`src/app/api/lynx-request/route.ts`) to send custom Lynx requests to `request@stickylynx.online`.
- The request form now includes:
  - inline field validation
  - success state after submission
  - toast feedback for server and network failures
- This flow is intended for visitors who cannot find a suitable category/template in the current library.

### Category Creation Procedure
- When adding a new category, follow this sequence so the feature is complete end-to-end:
  1. Add the category to Prisma / enum definitions if required.
  2. Create a shared helper module for the category’s constants, block defaults, and parsing utilities if the category has bespoke structure.
  3. Seed default blocks in `src/app/actions.ts` inside `createLynxPage(...)`.
  4. Register the category card in `src/components/dashboard/CreateLynxModal.tsx`.
  5. Add drawer-specific setup fields in `src/components/dashboard/CreateLynxDrawer.tsx` if the category needs startup config.
  6. Wire the editor renderer in `src/app/dashboard/editor/[id]/page.tsx`.
  7. Wire the public renderer in `src/app/[handle]/page.tsx`.
  8. Add any category-specific API validation or entitlement rules.
  9. Run targeted lint, typecheck, and `next build`.
- Property Listing is the latest reference implementation for a full custom category.

### Consistent Card System
- Category selection in the create modal now relies on the shared `CategoryCard` component (`src/components/ui/CategoryCard.tsx`) instead of one-off card markup.
- `CategoryCard` supports both `grid` and `list` layouts plus optional `preview` and `footer` slots.
- Use `CategoryCard` for future category/gallery selectors so hover states, spacing, borders, previews, and typography remain consistent across the product.
- Keep category metadata in a single `categories` array where possible, then map over it to render cards uniformly.

### Project Portal Invite Delivery Feedback
- `createLynxPage(...)` now returns `{ pageId, emailSent }`.
- Project Portal creation sends the invite after the transaction and reports whether email delivery succeeded.
- `CreateLynxDrawer.tsx` now shows:
  - success toast when the invitation email is sent
  - warning toast when the portal is created but SMTP delivery fails
- After creation, the drawer redirects straight to `/dashboard/editor/[id]`.

### Email Delivery Notes
- Shared SMTP transport lives in `src/lib/email.ts`.
- Delivery uses environment variables, not hardcoded runtime values:
  - `EMAIL_SERVER_HOST`
  - `EMAIL_SERVER_PORT`
  - `EMAIL_SERVER_USER`
  - `EMAIL_SERVER_PASSWORD`
  - `EMAIL_FROM`
  - `APP_NAME`
- `sendPlanNotification(...)` in `src/lib/notifications.ts` wraps `sendEmail(...)`, adds quota tracking, and is used by invite/request/update flows.
- `GET /api/email/verify` verifies SMTP transport connectivity using the same env-based transport config.
- The home-page request route uses `sendEmail(...)` directly, while plan-governed flows such as project portal invites and media kit requests use `sendPlanNotification(...)`.
- If delivery fails while routes still return correctly, check runtime/deployment env values first before changing code.
- Avoid committing live email secrets to version control. Keep real credentials in local `.env` / deployment secrets.

## Next Steps
- Connect Stage Reviews + Comments to Prisma persistence (currently client-side state).
- Address Analytics and Paystack Monetization.
- Build public review view at `/{handle}?stage={id}` for client-facing review experience.

## Active Rules
- Design System tokens must be used for all styling (no hardcoded Hex colors).
- Typescript strict checks. 
- Use Server components to conditionally check logic with hooks like `await auth()`.
- Prefer shared card primitives like `CategoryCard` for category selection and gallery-like layouts instead of duplicating card markup.
- For email features, use the shared env-driven transport in `src/lib/email.ts` or the quota-aware wrapper in `src/lib/notifications.ts`.

## ENV
DATABASE_URL="postgresql://neondb_owner:npg_AjXtNOQ3R8Fe@ep-blue-tooth-an9rtuhu-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"
DIRECT_URL="postgresql://neondb_owner:npg_AjXtNOQ3R8Fe@ep-blue-tooth-an9rtuhu-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require"

## Email Settings
EMAIL_SERVER_HOST="smtp.titan.email"
EMAIL_SERVER_PORT="465"
EMAIL_SERVER_USER="notifications@stickylynx.online"
EMAIL_SERVER_PASSWORD="Galvatron101!"
EMAIL_FROM="notifications@stickylynx.online"

NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_cmljaC1kaW5nby0xMi5jbGVyay5hY2NvdW50cy5kZXYk
CLERK_SECRET_KEY=sk_test_GSvmvojRojCMB7FoFisqOJncdCh8NLPpcKJxb2EEKR
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/login
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/register
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

NEXT_PUBLIC_APP_URL= https://stickylynx.online
NEXT_PUBLIC_NOMINATIM_URL= https://nominatim.openstreetmap.org
NEXT_PUBLIC_QR_API_URL= https://api.qrserver.com
NEXT_PUBLIC_ALLOW_DEMO_ASSETS=true
NEXT_PUBLIC_SHOW_INVOICING=false
NEXT_PUBLIC_SHOW_WAITLIST=false
