import { NotificationEventType } from "@prisma/client"
import prisma from "@/lib/prisma"
import { sendEmail } from "@/lib/email"
import { getUserPlanSnapshot } from "@/lib/subscription"

export type NotificationQuotaResult = {
  allowed: boolean
  used: number
  limit: number
}

export type NotificationSendResult = {
  ok: boolean
  quotaExceeded: boolean
  used: number
  limit: number
  error?: unknown
  response?: string
}

function getStartOfUtcDay() {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  return await Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(`Email request timed out after ${timeoutMs}ms`)), timeoutMs)
    }),
  ])
}

export async function getNotificationQuota(userId: string): Promise<NotificationQuotaResult> {
  const snapshot = await getUserPlanSnapshot(userId)
  const used = await prisma.notificationEvent.count({
    where: {
      userId,
      createdAt: {
        gte: getStartOfUtcDay(),
      },
    },
  })

  return {
    allowed: used < snapshot.rules.dailyEmailNotifications,
    used,
    limit: snapshot.rules.dailyEmailNotifications,
  }
}

export async function sendPlanNotification(input: {
  userId: string
  pageId?: string | null
  type: NotificationEventType
  to: string
  subject: string
  html: string
}): Promise<NotificationSendResult> {
  try {
    const quota = await getNotificationQuota(input.userId)

    if (!quota.allowed) {
      return {
        ok: false,
        quotaExceeded: true,
        used: quota.used,
        limit: quota.limit,
        error: "Daily email notification limit reached.",
      }
    }

    const result = await withTimeout(
      sendEmail({
        to: input.to,
        subject: input.subject,
        html: input.html,
      }),
      4000
    )

    if (!result.ok) {
      return {
        ok: false,
        quotaExceeded: false,
        used: quota.used,
        limit: quota.limit,
        error: result.error,
        response: result.response,
      }
    }

    await prisma.notificationEvent.create({
      data: {
        userId: input.userId,
        pageId: input.pageId || undefined,
        type: input.type,
      },
    })

    return {
      ok: true,
      quotaExceeded: false,
      used: quota.used + 1,
      limit: quota.limit,
      response: result.response,
    }
  } catch (error) {
    const quota = await getNotificationQuota(input.userId)
    return {
      ok: false,
      quotaExceeded: false,
      used: quota.used,
      limit: quota.limit,
      error,
    }
  }
}
