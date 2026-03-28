ALTER TYPE "SubscriptionPlan" RENAME TO "SubscriptionPlan_old";

CREATE TYPE "SubscriptionPlan" AS ENUM ('STARTER', 'CREATOR', 'STUDIO');

ALTER TABLE "Subscription"
ALTER COLUMN "plan" DROP DEFAULT;

ALTER TABLE "Subscription"
ALTER COLUMN "plan" TYPE "SubscriptionPlan"
USING (
  CASE
    WHEN "plan"::text = 'FREE' THEN 'STARTER'
    WHEN "plan"::text = 'PRO' THEN 'STUDIO'
    ELSE 'STARTER'
  END
)::"SubscriptionPlan";

ALTER TABLE "Subscription"
ALTER COLUMN "plan" SET DEFAULT 'STARTER';

DROP TYPE "SubscriptionPlan_old";
