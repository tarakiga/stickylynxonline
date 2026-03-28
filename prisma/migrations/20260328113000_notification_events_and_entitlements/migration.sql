CREATE TYPE "NotificationEventType" AS ENUM (
  'PROJECT_PORTAL_INVITE',
  'PROJECT_PORTAL_REINVITE',
  'PROJECT_PORTAL_COMMENT',
  'PROJECT_PORTAL_APPROVAL',
  'PROJECT_PORTAL_SUBMISSION',
  'MEDIA_KIT_REQUEST'
);

CREATE TABLE "NotificationEvent" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "pageId" TEXT,
  "type" "NotificationEventType" NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "NotificationEvent_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "NotificationEvent_userId_createdAt_idx" ON "NotificationEvent"("userId", "createdAt");
CREATE INDEX "NotificationEvent_pageId_createdAt_idx" ON "NotificationEvent"("pageId", "createdAt");

ALTER TABLE "NotificationEvent"
ADD CONSTRAINT "NotificationEvent_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "NotificationEvent"
ADD CONSTRAINT "NotificationEvent_pageId_fkey"
FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
