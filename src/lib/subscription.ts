import { PageCategory } from "@prisma/client"
import prisma from "@/lib/prisma"
import {
  AppSubscriptionPlan,
  FeatureKey,
  formatFoodMenuLimit,
  getFeatureLabel,
  getFeatureMinimumPlan,
  getPlanRule,
  hasFeature,
} from "@/lib/plan-rules"

type UserIdentity = {
  userId: string
  email: string
  name?: string | null
}

export type PlanSnapshot = {
  plan: AppSubscriptionPlan
  rules: ReturnType<typeof getPlanRule>
  usage: {
    totalPages: number
    foodMenus: number
  }
  remainingPages: number
  remainingFoodMenus: number | null
}

export type PlanLimitError = {
  code: "PAGE_LIMIT_REACHED" | "FOOD_MENU_LIMIT_REACHED"
  field: "plan" | "category"
  message: string
}

export type FeatureAccessError = {
  code: "FEATURE_NOT_AVAILABLE"
  field: "plan"
  feature: FeatureKey
  message: string
}

function normalizePlan(plan: string | null | undefined): AppSubscriptionPlan {
  if (plan === "CREATOR" || plan === "STUDIO" || plan === "STARTER") {
    return plan
  }

  if (plan === "PRO") {
    return "STUDIO"
  }

  return "STARTER"
}

export async function ensureUserAccount(user: UserIdentity) {
  return prisma.user.upsert({
    where: { id: user.userId },
    create: {
      id: user.userId,
      email: user.email,
      name: user.name || undefined,
      subscription: {
        create: {},
      },
    },
    update: {
      email: user.email,
      name: user.name || undefined,
      subscription: {
        upsert: {
          create: {},
          update: {},
        },
      },
    },
    include: {
      subscription: true,
    },
  })
}

export async function getUserPlanSnapshot(userId: string): Promise<PlanSnapshot> {
  const [subscription, totalPages, foodMenus] = await prisma.$transaction([
    prisma.subscription.findUnique({
      where: { userId },
      select: { plan: true },
    }),
    prisma.page.count({
      where: { userId },
    }),
    prisma.page.count({
      where: {
        userId,
        category: PageCategory.FOOD_MENU,
      },
    }),
  ])

  const plan = normalizePlan(subscription?.plan)
  const rules = getPlanRule(plan)

  return {
    plan,
    rules,
    usage: {
      totalPages,
      foodMenus,
    },
    remainingPages: Math.max(rules.maxPages - totalPages, 0),
    remainingFoodMenus:
      rules.maxFoodMenus === null ? null : Math.max(rules.maxFoodMenus - foodMenus, 0),
  }
}

export function getPlanLimitError(snapshot: PlanSnapshot, category: PageCategory): PlanLimitError | null {
  if (snapshot.usage.totalPages >= snapshot.rules.maxPages) {
    return {
      code: "PAGE_LIMIT_REACHED",
      field: "plan",
      message: `${snapshot.rules.label} allows up to ${snapshot.rules.maxPages} Lynx. Payments are not live yet, so higher tiers are still locked.`,
    }
  }

  if (
    category === PageCategory.FOOD_MENU &&
    snapshot.rules.maxFoodMenus !== null &&
    snapshot.usage.foodMenus >= snapshot.rules.maxFoodMenus
  ) {
    return {
      code: "FOOD_MENU_LIMIT_REACHED",
      field: "category",
      message: `${snapshot.rules.label} allows ${formatFoodMenuLimit(snapshot.rules.maxFoodMenus)}. Payments are not live yet, so higher tiers are still locked.`,
    }
  }

  return null
}

export function getFeatureAccessError(snapshot: PlanSnapshot, feature: FeatureKey): FeatureAccessError | null {
  if (hasFeature(snapshot.plan, feature)) {
    return null
  }

  const requiredPlan = getPlanRule(getFeatureMinimumPlan(feature))

  return {
    code: "FEATURE_NOT_AVAILABLE",
    field: "plan",
    feature,
    message: `${getFeatureLabel(feature)} is available on ${requiredPlan.label}. Payments are not live yet, so higher tiers are still locked.`,
  }
}
