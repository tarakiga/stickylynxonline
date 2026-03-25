Design this as a new **“Project Portal” page type** within your existing one-page framework: one URL where freelancer and client see the same structured status, feedback, and timeline view.[^1][^2]

***

## 1. Concept and Page Role

- **Page type**: “Project Portal” (category alongside Food Menu, Resume, EPK).
- **Primary goal**: Give clients a simple, always‑up‑to‑date view of project status without needing to learn a PM tool, and give freelancers a lightweight way to log progress and respond to feedback.[^3][^1]
- **Access model**:
    - Freelancer owns and edits the page.
    - Client accesses via secret URL (optionally with simple PIN/identity confirmation later).
    - Both see the same project status, tasks, and timeline; only freelancer can change structure.

***

## 2. Information Architecture (on a single page)

From top to bottom on the public/portal page:

1. **Project Header**
    - Project name, client name, freelancer name/brand.
    - High‑level status pill (e.g., “Discovery”, “Design in progress”, “Development”, “Review”, “Launched”).[^4]
    - Target launch date and current overall progress bar.
2. **Status Summary Block**
    - Short, human‑written status note by freelancer (1–3 sentences).
    - Last updated timestamp.
    - Optional “What’s coming next” bullet list (next 2–3 tasks).
3. **Timeline \& Milestones Section**
    - Horizontal or vertical timeline of key phases: e.g., Discovery → Wireframes → Visual Design → Development → QA → Launch.
    - Each milestone: name, due/actual date, status (Not started / In progress / Completed), notes.[^5][^6]
    - This is the main visual that reassures the client “where we are in the journey”.
4. **Task List / Kanban‑lite Section**
    - Grouped list: “To Do”, “In Progress”, “Waiting on Client”, “Done”.[^1][^3]
    - Each task: title, owner (Freelancer/Client), due date, status, optional link (Figma, Notion, live preview).
    - “Waiting on Client” makes responsibilities explicit.
5. **Client Feedback \& Requests Section**
    - At top: read‑only list of recent feedback items (cards with: feedback summary, who sent it, date, status like “Planned / In progress / Resolved”).
    - Below: **Feedback form** (simple fields):
        - “What would you like to share?” (textarea).
        - Optional: type (Bug / Change request / Question), file upload (screenshots), page reference.
        - Submit button.
6. **Conversation / Comments Section**
    - Light asynchronous comment thread tied to the project (not full chat):
        - Messages from freelancer and client, time stamped.
        - Used for clarifications and responses to feedback items.
    - This keeps all context on the same page instead of email chains.[^2][^1]
7. **Deliverables \& Files Section**
    - Cards for key artifacts: e.g., “Homepage mockup”, “Brand guidelines PDF”, “Staging link”.
    - Each card shows status (Draft, Under review, Approved) and last updated date.[^3][^1]
8. **Commercials (optional in v1)**
    - Milestone payments, invoice links, or checklist of “Signed / Deposit paid / Final invoice sent”.
    - This can be a simple read‑only block with links, not a full billing system initially.[^7]

All of these remain within your **single page** pattern, using existing design system components (cards, tags, timeline, forms, progress indicators).

***

## 3. Interaction Model

### 3.1 Freelancer side (owner)

Freelancer uses your app’s editor or a special “Owner view” of the portal:

- **Edit mode vs. View mode**
    - Edit mode: in your dashboard/editor route, where the freelancer:
        - Updates overall status text, milestone statuses, tasks, and deliverables.
        - Chooses which sections are visible to the client (e.g., hide internal notes).
    - View mode: same as client view but with edit affordances (inline edit controls, “Add task”, “Change status”).
- **Responding to feedback**
    - Feedback form submissions create new “Feedback item” records.
    - In the editor/owner view, freelancer:
        - Converts feedback into new tasks or associates it with existing tasks (e.g., “Homepage hero update”).
        - Marks feedback as “In progress” or “Resolved”, which updates the visible list on the page.
- **Updating progress**
    - When freelancer updates Milestone or Task statuses, the progress bar and status summary automatically reflect that.
    - Simple rules are fine (e.g., progress = % of milestones completed).[^6]


### 3.2 Client side

- **Entry**
    - Receives a link to the portal (e.g., `site.com/project/brand-x-website` or secret token URL).
    - Sees read‑only project structure (timeline, tasks, files) and can:
        - Submit feedback through the form.
        - Leave comments in the conversation area.
        - Download/view deliverables.
- **Expectations**
    - No complex onboarding; everything is understandable at a glance.
    - Clear “What’s happening now” and “What you need to do” sections.[^8]

***

## 4. How It Fits into Framework

### 4.1 As a New Category Template

In the existing template system, define:

- **Category**: `Project Portal`.
- **Layout**: Single column with anchored sections (Status, Timeline, Tasks, Feedback, Comments, Files).
- **Blocks** (config driven, same philosophy as other templates):
    - `ProjectHeaderBlock`
    - `StatusSummaryBlock`
    - `TimelineBlock`
    - `TaskBoardBlock`
    - `FeedbackListBlock` + `FeedbackFormBlock`
    - `CommentThreadBlock`
    - `DeliverablesBlock`
    - Optional `BillingOverviewBlock`

Each block uses **design system** components: tags, chips, cards, list items, form fields, progress bars, etc.

### 4.2 Design System Considerations if not included already

- Introduce tokens and patterns for:
    - Progress trackers (bars + step indicators).[^4]
    - Status chips (color‑coded: e.g., Green “On track”, Amber “At risk”, Red “Blocked”).
    - Comment bubbles / message cards.
    - Feedback cards and task tags (“Waiting on client”).
- Document these in `/design-system` with examples of “Project Portal” as a layout example (just like Food Menu, Resume, EPK).

***

## 5. Scope for v1 vs Later

**v1 (MVP Project Portal)**

- Read‑only portal for client plus:
    - Status summary, timeline, task list, feedback submission, deliverables list, simple comments.
- Client does not need an account; interactions are via forms/comments linked to their name/email.
- No real‑time features; page refresh shows latest updates.

**Later enhancements**

- Client login with identity, permissions, and notifications.
- Per‑feedback threaded discussion, approvals, and e‑signatures.
- Lightweight billing \& payment section.
- Real‑time updates (websockets) so both parties see changes instantly.
- Multiple stakeholders per side (client team, subcontractors).[^9][^3]

***

