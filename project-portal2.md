## Product definition

Create a new category called **Team Project Hub**. It is an internal company-facing version of Project Portal, designed for stage-based work management, restricted access, task assignment, task submission, task comments, and approval workflows.[^2][^3]

### Developer instruction

To save time and maintain consistency:

- **Copy the existing Project Portal**
- Reuse its layout, timeline, comments, activity model, and notification plumbing
- Repurpose it for internal project management
- Add:
    - allowlist access control
    - stage ownership
    - task assignment
    - task submission modal
    - approval flow
    - task comments from stage manager to assignee
    - email notifications for assignments, submissions, approvals, and comments

This is the preferred implementation path because the new page is not a totally new pattern; it is an internal approval-driven adaptation of the same project workflow structure.[^3][^2]

## Core users and permissions

### Roles

| Role | Access |
| :-- | :-- |
| Creator / Superadmin | Full access to all project data, stages, tasks, comments, approvals, allowlist, and settings.[^4][^5] |
| Allowlist user | Can access the workspace if active; exact actions depend on assignment.[^4][^6] |
| Stage manager | Can manage only their assigned stage, create tasks in that stage, comment on tasks in that stage, review submissions, request corrections, and mark tasks done.[^2][^1] |
| Task assignee | Can view assigned tasks, submit assigned tasks, and receive comments/feedback on those tasks.[^7][^1] |

### Permission rules

- Only **allowlist users** can access the workspace page.[^4]
- Only the **creator** or the **assigned stage manager** can create tasks in that stage.[^2][^3]
- Only the **assigned user** can submit that task.[^8]
- Only the **stage manager for that stage** or the **creator** can review, comment on, approve, or request corrections for that task.[^9][^2]
- Only the **assigned user** should see the **Submit** button on their task.[^8]


## Allowlist management

Add a backend/admin section called **Allowlist** or **Team Access**.

Each allowlist record should include:

- Name
- Email
- Status: `active`, `suspended`, `removed`
- Optional internal label/role
- Date added
- Last modified

Behavior:

- `active` → can log in and access assigned workspaces
- `suspended` → cannot access the workspace and cannot receive new assignments
- `removed` → removed from future access, but historical activity should remain preserved for audit/history.[^5][^4]

Use **soft state changes**, not hard deletes, for simplicity and record integrity.[^4]

## Page structure

Reuse the Project Portal page structure with internal labels and permission logic.

### Main sections

1. **Project Header**

- Project name
- Department / company unit
- Creator / owner
- Overall status
- Timeline summary
- Progress indicator

2. **Stages / Timeline**

- Custom or default stages
- Each stage shows:
    - stage title
    - stage manager
    - due date
    - stage status
    - number of tasks
    - submission counts

3. **Task List by Stage**

- Task title
- Description
- Assigned user
- Delivery date
- Submission status
- Timing badge
- Comments
- Approval state

4. **Updates / Comments**

- Internal project thread if needed at project level

5. **Files / Deliverables**

- Shared project files or reference links

6. **Allowlist / Team Access**

- Backend management view, not necessarily exposed as a main front-page section


## Stage ownership model

Each stage should support:

- `stageOwnerType`: `creator` or `user`
- `stageOwnerUserId`
- `stageStatus`
- `stageDueAt`

Rules:

- If owned by the **creator**, creator manages tasks for that stage.
- If owned by an **allowlist user**, that user becomes stage manager for that stage and gains scoped authority over tasks in that stage only.[^3][^2]


## Task lifecycle

Recommended task statuses:

- `not_started`
- `in_progress`
- `submitted`
- `changes_requested`
- `approved_done`
- `overdue`

Recommended flow:

1. Stage manager creates a task.
2. Stage manager assigns it to one allowlist user and sets due date.
3. Assigned user receives assignment email.
4. Assigned user works on it.
5. Assigned user clicks **Submit**.
6. Submission modal opens.
7. User submits via text, upload, or link.
8. Stage manager receives email notification of submission.
9. Stage manager reviews it.
10. Stage manager can:

- comment on the task
- request corrections
- approve / mark done

11. Assigned user receives comment/correction email if comment is added.
12. Once accepted, task is marked done with a completion timestamp.[^10][^1][^2]

## Task comments and correction flow

This is the new addition and should be treated as a **task-level review thread**.

### Comment behavior

- The **stage manager** can comment directly on a task.
- These comments are intended for:
    - corrections
    - feedback
    - clarification
    - revision requests
- The comment is stored on the task as part of its history.
- The **assigned user** receives an email notification when the stage manager comments.[^11][^1]


### Recommended UX

Inside each task card or task detail area:

- Show a **Comments** section
- Stage manager sees:
    - comment input
    - post comment button
- Assigned user sees:
    - comments history
    - can optionally reply if you want parity with Project Portal comments
- Comments should be timestamped and attributed by user name


### Email behavior for task comments

When the stage manager comments:

- Send email to the **assigned user**
- Email should include:
    - project name
    - stage name
    - task title
    - comment body
    - direct link back to the task/workspace

This is especially important when the comment contains requested corrections, because comments tied to task workflows should notify the person responsible rather than relying on passive in-app discovery.[^12][^7][^1]

### Relation to status

A comment alone does **not have to** change status automatically, but for simplicity you may optionally support:

- If stage manager posts comment and chooses **Request corrections**, task status becomes `changes_requested`
- If stage manager posts general note only, task status remains unchanged

Best minimalist v1 approach:

- Add an optional checkbox or action beside comment:
    - **Post comment**
    - **Post comment + request changes**

That avoids ambiguity without adding much complexity.[^13][^14]

## Submission UX

Only the assigned user sees the **Submit** button on their task.[^8]

### Submit task modal

Fields:

- Submission type dropdown:
    - Text
    - Upload
    - Link
- Corresponding input:
    - Textarea
    - File uploader
    - URL field
- Optional note
- Submit button

Validation:

- Text must not be empty
- Upload must include file
- Link must be valid URL

After submission:

- Status changes to `submitted`
- `submittedAt` is stored
- Stage manager and creator receive submission email notification.[^10]


## Submission timing badge

Each task should show a timing badge after submission and after completion.

Required behavior:

- If submitted 1 day before deadline → `1 day early`
- If submitted on deadline date → `On time`
- If submitted after deadline by 3 days → `3 days late` in red

Store:

- `deliveryDueAt`
- `submittedAt`
- `approvedDoneAt`

Display logic:

- early → positive badge
- on time → neutral badge
- late → red badge

This should remain visible as part of the task history even after approval.

## Notifications

Use the platform’s existing email delivery setup.

### Required triggers

1. **Task assigned**

- To assigned user

2. **Task submitted**

- To stage manager
- Optionally creator

3. **Task comment added by stage manager**

- To assigned user

4. **Changes requested**

- To assigned user

5. **Task approved / marked done**

- To assigned user

6. **User assigned as stage manager**

- To that user

7. **User added to allowlist**

- To that user if needed for onboarding[^15][^16][^1]


### Minimal v1 notification set

If you want to stay lean, implement these first:

- Assignment email
- Submission email
- Stage-manager comment email
- Approval email
- Change-request email

That covers the critical workflow moments without excess notification noise.[^17][^1]

## Access control

Just like Project Portal, but internal-only:

- Only `active` allowlist users can access the page.[^4]
- Suspended/removed users cannot access.
- UI must show only allowed actions.
- Backend must enforce permissions on every route:
    - task creation
    - stage edit
    - submission
    - comment creation
    - approval
    - assignment changes[^6][^5]


## Recommended data additions

Add these on top of the existing Project Portal model:

- `allowlist_users`
- `project_memberships`
- `stage_manager_user_id`
- `task_assignee_user_id`
- `task_submissions`
- `task_comments`
- `submission_type`
- `submitted_at`
- `approved_done_at`
- `changes_requested_at`
- `comment_created_at`
- `user_status`

Suggested task comment model:

```ts
type TaskComment = {
  id: string;
  taskId: string;
  authorUserId: string;
  body: string;
  isCorrectionRequest?: boolean;
  createdAt: string;
};
```


## Recommended category title

A few strong options:

- **Internal Workspace**
Team timelines, task submissions, approvals, and comments.
- **Team Project Hub**
Internal stages, assigned tasks, submissions, and reviews.
- **Work Review Hub**
Team stages, task delivery, corrections, and approvals.


## Final implementation note

- **Copy Project Portal**
- Preserve the same base layout and design system
- Replace freelancer/client logic with internal role logic
- Add:
    - allowlist-only access
    - stage manager ownership
    - stage-scoped task creation
    - task assignment
    - task submission modal
    - task timing badge
    - task-level comments by stage manager
    - email notifications to assignee on comment/correction
    - approval and mark-done flow


