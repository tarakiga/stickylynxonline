ALTER TYPE "NotificationEventType" ADD VALUE IF NOT EXISTS 'TEAM_PROJECT_HUB_ASSIGNMENT';
ALTER TYPE "NotificationEventType" ADD VALUE IF NOT EXISTS 'TEAM_PROJECT_HUB_SUBMISSION';
ALTER TYPE "NotificationEventType" ADD VALUE IF NOT EXISTS 'TEAM_PROJECT_HUB_COMMENT';
ALTER TYPE "NotificationEventType" ADD VALUE IF NOT EXISTS 'TEAM_PROJECT_HUB_APPROVAL';
ALTER TYPE "NotificationEventType" ADD VALUE IF NOT EXISTS 'TEAM_PROJECT_HUB_CHANGES_REQUESTED';
ALTER TYPE "NotificationEventType" ADD VALUE IF NOT EXISTS 'TEAM_PROJECT_HUB_STAGE_MANAGER';
ALTER TYPE "NotificationEventType" ADD VALUE IF NOT EXISTS 'TEAM_PROJECT_HUB_ALLOWLIST';
ALTER TYPE "PageCategory" ADD VALUE IF NOT EXISTS 'TEAM_PROJECT_HUB';

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TeamProjectMemberStatus') THEN
    CREATE TYPE "TeamProjectMemberStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'REMOVED');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS "TeamProjectMember" (
  "id" TEXT NOT NULL,
  "pageId" TEXT NOT NULL,
  "userId" TEXT,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "internalLabel" TEXT,
  "status" "TeamProjectMemberStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TeamProjectMember_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "TeamProjectMember_pageId_email_key" ON "TeamProjectMember"("pageId", "email");
CREATE INDEX IF NOT EXISTS "TeamProjectMember_pageId_status_idx" ON "TeamProjectMember"("pageId", "status");
CREATE INDEX IF NOT EXISTS "TeamProjectMember_pageId_userId_idx" ON "TeamProjectMember"("pageId", "userId");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'TeamProjectMember_pageId_fkey'
      AND table_name = 'TeamProjectMember'
  ) THEN
    ALTER TABLE "TeamProjectMember"
    ADD CONSTRAINT "TeamProjectMember_pageId_fkey"
      FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE constraint_name = 'TeamProjectMember_userId_fkey'
      AND table_name = 'TeamProjectMember'
  ) THEN
    ALTER TABLE "TeamProjectMember"
    ADD CONSTRAINT "TeamProjectMember_userId_fkey"
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
