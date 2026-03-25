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

## Next Steps
- Connect Stage Reviews + Comments to Prisma persistence (currently client-side state).
- Address Analytics and Paystack Monetization.
- Build public review view at `/{handle}?stage={id}` for client-facing review experience.

## Active Rules
- Design System tokens must be used for all styling (no hardcoded Hex colors).
- Typescript strict checks. 
- Use Server components to conditionally check logic with hooks like `await auth()`.
