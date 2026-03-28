import { FeatureKey } from "@/lib/plan-rules"

type EditorBlock = {
  type: string
  content: Record<string, unknown>
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null
  }

  return value as Record<string, unknown>
}

function asArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

export function getFoodMenuFeatureViolations(blocks: EditorBlock[]): FeatureKey[] {
  const violations = new Set<FeatureKey>()

  for (const block of blocks) {
    const content = asRecord(block.content)
    if (!content) continue
    const section = typeof content.section === "string" ? content.section.toLowerCase() : ""

    if (section === "brand_header") {
      const logoImage = typeof content.logoImage === "string" ? content.logoImage.trim() : ""
      if (logoImage) {
        violations.add("CUSTOM_BRANDING")
      }
    }

    if (section === "service_info") {
      const emails = asArray(content.emails)
      const phones = asArray(content.phones)
      const socials = asArray(content.socials)
      const locations = asArray(content.locations)
      const orderingLinks = asArray(content.orderingLinks)

      if (
        emails.length > 1 ||
        phones.length > 1 ||
        socials.length > 1 ||
        locations.length > 1 ||
        orderingLinks.length > 1
      ) {
        violations.add("ADVANCED_FOOD_MENU")
      }
    }

    if (section === "menu_sections") {
      const sections = asArray(content.sections)

      for (const sectionValue of sections) {
        const section = asRecord(sectionValue)
        if (!section) continue

        const items = asArray(section.items)
        for (const itemValue of items) {
          const item = asRecord(itemValue)
          if (!item) continue

          const variations = asArray(item.variations)
          if (variations.length > 1) {
            violations.add("ADVANCED_FOOD_MENU")
          }
        }
      }
    }

    if (section === "extras") {
      const items = asArray(content.items)
      for (const itemValue of items) {
        const item = asRecord(itemValue)
        if (!item) continue

        const variations = asArray(item.variations)
        if (variations.length > 1) {
          violations.add("ADVANCED_FOOD_MENU")
        }
      }
    }
  }

  return Array.from(violations)
}
