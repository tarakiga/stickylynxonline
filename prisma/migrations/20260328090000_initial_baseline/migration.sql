CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PRO');
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');
CREATE TYPE "PageCategory" AS ENUM ('FOOD_MENU', 'RESUME', 'EPK', 'GENERIC', 'PROJECT_PORTAL', 'INFLUENCER_MEDIA_KIT');
CREATE TYPE "BlockType" AS ENUM (
  'TEXT',
  'LINK',
  'IMAGE',
  'AUDIO',
  'VIDEO',
  'GRID',
  'CONTACT',
  'PRODUCT',
  'PROJECT_HEADER',
  'STATUS_SUMMARY',
  'TIMELINE',
  'TASK_BOARD',
  'FEEDBACK_LIST',
  'FEEDBACK_FORM',
  'COMMENT_THREAD',
  'DELIVERABLES',
  'BILLING_OVERVIEW'
);

CREATE TABLE "User" (
  "id" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "name" TEXT,
  "passwordHash" TEXT,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "currencyCode" TEXT NOT NULL DEFAULT 'USD',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

CREATE TABLE "Subscription" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "plan" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
  "status" "SubscriptionStatus" NOT NULL DEFAULT 'ACTIVE',
  "paystackId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Subscription_userId_key" ON "Subscription"("userId");
CREATE UNIQUE INDEX "Subscription_paystackId_key" ON "Subscription"("paystackId");

ALTER TABLE "Subscription"
ADD CONSTRAINT "Subscription_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Page" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "handle" TEXT NOT NULL,
  "title" TEXT,
  "description" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT false,
  "category" "PageCategory" NOT NULL DEFAULT 'GENERIC',
  "theme" JSONB,
  "clientEmail" TEXT,
  "clientName" TEXT,
  "clientAccessTokenHash" TEXT,
  "clientAccessCreatedAt" TIMESTAMP(3),
  "clientAccessRevoked" BOOLEAN NOT NULL DEFAULT false,
  "clientAccessExpiresAt" TIMESTAMP(3),
  "clientPinHash" TEXT,
  "clientPinEnabled" BOOLEAN NOT NULL DEFAULT false,
  "clientPinCreatedAt" TIMESTAMP(3),
  "lastClientAccessAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Page_handle_key" ON "Page"("handle");

ALTER TABLE "Page"
ADD CONSTRAINT "Page_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE TABLE "Block" (
  "id" TEXT NOT NULL,
  "pageId" TEXT NOT NULL,
  "type" "BlockType" NOT NULL,
  "content" JSONB NOT NULL,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Block_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Block_pageId_idx" ON "Block"("pageId");

ALTER TABLE "Block"
ADD CONSTRAINT "Block_pageId_fkey"
FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
