export const PLAN_KEYS = ["STARTER", "CREATOR", "STUDIO"] as const

export type AppSubscriptionPlan = (typeof PLAN_KEYS)[number]
export const FEATURE_KEYS = ["ADVANCED_FOOD_MENU", "CUSTOM_BRANDING", "ADVANCED_ANALYTICS", "DATA_EXPORT"] as const
export type FeatureKey = (typeof FEATURE_KEYS)[number]

export type PlanRule = {
  plan: AppSubscriptionPlan
  label: string
  priceLabel: string
  maxPages: number
  maxFoodMenus: number | null
  ctaLabel: string | null
  dailyEmailNotifications: number
  features: Record<FeatureKey, boolean>
}

export const PLAN_RULES: Record<AppSubscriptionPlan, PlanRule> = {
  STARTER: {
    plan: "STARTER",
    label: "Starter",
    priceLabel: "Free",
    maxPages: 2,
    maxFoodMenus: 1,
    ctaLabel: null,
    dailyEmailNotifications: 25,
    features: {
      ADVANCED_FOOD_MENU: false,
      CUSTOM_BRANDING: false,
      ADVANCED_ANALYTICS: false,
      DATA_EXPORT: false,
    },
  },
  CREATOR: {
    plan: "CREATOR",
    label: "Creator",
    priceLabel: "$12 / month",
    maxPages: 5,
    maxFoodMenus: 2,
    ctaLabel: "Payments Coming Soon",
    dailyEmailNotifications: 100,
    features: {
      ADVANCED_FOOD_MENU: true,
      CUSTOM_BRANDING: true,
      ADVANCED_ANALYTICS: false,
      DATA_EXPORT: false,
    },
  },
  STUDIO: {
    plan: "STUDIO",
    label: "Studio",
    priceLabel: "$29 / month",
    maxPages: 15,
    maxFoodMenus: null,
    ctaLabel: "Payments Coming Soon",
    dailyEmailNotifications: 500,
    features: {
      ADVANCED_FOOD_MENU: true,
      CUSTOM_BRANDING: true,
      ADVANCED_ANALYTICS: true,
      DATA_EXPORT: true,
    },
  },
}

export function getPlanRule(plan: AppSubscriptionPlan) {
  return PLAN_RULES[plan]
}

export function hasFeature(plan: AppSubscriptionPlan, feature: FeatureKey) {
  return PLAN_RULES[plan].features[feature]
}

export function getFeatureMinimumPlan(feature: FeatureKey): AppSubscriptionPlan {
  if (feature === "ADVANCED_FOOD_MENU" || feature === "CUSTOM_BRANDING") {
    return "CREATOR"
  }

  return "STUDIO"
}

export function getFeatureLabel(feature: FeatureKey) {
  if (feature === "ADVANCED_FOOD_MENU") return "Advanced Food Menu"
  if (feature === "CUSTOM_BRANDING") return "Custom Branding"
  if (feature === "ADVANCED_ANALYTICS") return "Advanced Analytics"
  return "Data Export"
}

export function formatFoodMenuLimit(maxFoodMenus: number | null) {
  if (maxFoodMenus === null) {
    return "Unlimited Food Menus"
  }

  return `${maxFoodMenus} Food Menu${maxFoodMenus === 1 ? "" : "s"}`
}
