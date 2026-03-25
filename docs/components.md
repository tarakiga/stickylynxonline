---
title: Component Library
description: Atomic UI components used across the Stickylynx platform.
---

# Component Library

All UI components live in `src/components/ui/` and follow Atomic Design methodology. Every component uses design system tokens — no hardcoded colors or pixel values.

## Atoms

### Button
**File:** `src/components/ui/Button.tsx`
**Variants:** `primary`, `secondary`, `outline`, `ghost`

### Input
**File:** `src/components/ui/Input.tsx`
**Features:** Icon slots, prefix/suffix, floating label, password toggle, error/success states.

### Textarea
**File:** `src/components/ui/Textarea.tsx`
**Features:** Label, error state, auto-styled with `input-base` class.

### Badge
**File:** `src/components/ui/Badge.tsx`
**Variants:** `success`, `warning`, `error`, `info`, `primary`, `neutral`
**Features:** Optional `pulse` prop for animated status indicators.

### IconButton
**File:** `src/components/ui/IconButton.tsx`
**Variants:** `default`, `danger`, `success`, `primary`
**Sizes:** `sm` (32px), `md` (40px)

### Switch / SegmentedControl
**File:** `src/components/ui/Switch.tsx`

### Select
**File:** `src/components/ui/Select.tsx`

### Card
**File:** `src/components/ui/Card.tsx`

### Dropzone
**File:** `src/components/ui/Dropzone.tsx`

## Molecules

### Modal
**File:** `src/components/ui/Modal.tsx`
**Icons:** `danger`, `success`, `error`, `info`, `progress`

### DraggableList
**File:** `src/components/ui/DraggableList.tsx`
**Features:** Full drag-and-drop powered by `@dnd-kit`. Supports touch, pointer, and keyboard sensors. Callbacks: `onReorder`, `onEdit`, `onDelete`, `onAdd`.

### Banner / CookiesBanner
**File:** `src/components/ui/Banner.tsx`

### StatCard
**File:** `src/components/ui/StatCard.tsx`

### StatusToggle
**File:** `src/components/ui/StatusToggle.tsx`
**States:** `todo`, `in_progress`, `review`, `done` — cycles on click with semantic token colors.

### StepProgress
**File:** `src/components/ui/Progress.tsx`
**Features:** Interactive clickable steps, badge counts for pending items, `onStepClick` callback. Fixed label visibility with proper padding.

## Organisms

### TaskCard
**File:** `src/components/editor/TaskCard.tsx`
**Features:** Status toggle, due date badge (overdue highlighting), expandable comment thread with inline compose, "Submit" button triggering work submission modal, submission preview.

### DeliverableCard
**File:** `src/components/editor/DeliverableCard.tsx`
**Features:** Type-aware rendering — Dropzone for file/image, clickable link for URL, text block for text. Type badge, delete action.

### EpkEditor
**File:** `src/components/editor/EpkEditor.tsx`
**Features:** Full EPK editor with 7 sections: Artist Identity (name, tagline, genre, profile/cover image upload), Streaming Links (platform dropdown + URL), Track List (title, duration, link), Videos (YouTube/Vimeo URL), Press Photos (gallery with Dropzone upload), Biography (textarea + press kit URL), Contact & Booking (email, phone, management, social links). All sections use design library atoms.

### EpkPublic
**File:** `src/components/public/EpkPublic.tsx`
**Features:** Premium public EPK page. Cover image with profile overlay hero, streaming platform pills, numbered track cards with play icon, embedded YouTube/Vimeo videos (auto-detected from URL), press photo gallery with lightbox, bio section with press kit PDF download, contact card with mailto/tel links and social link pills.

### StageReviewDrawer
**File:** `src/components/editor/StageReviewDrawer.tsx`
**Features:** Full stage review workflow: submit work with attachments (URL/image/doc), review status management (draft/submitted/approved/revision_needed), chronological activity timeline, shareable review link generation, comment input auto-linked to stage.

## Design Tokens

All components reference CSS variable tokens defined in `src/app/globals.css`:

- `--color-primary`, `--color-primary-hover`, `--color-primary-light`
- `--color-secondary`
- `--color-accent` (gradient accents)
- `--color-info` (informational elements)
- `--color-success`, `--color-warning`, `--color-error`
- `--color-background`, `--color-surface`, `--color-divider`
- `--color-text-primary`, `--color-text-secondary`

Both light and dark mode values are defined. Never use raw hex values in components.
