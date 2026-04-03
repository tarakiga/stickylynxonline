import Link from "next/link"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { ArrowRight, LogIn, UserPlus } from "lucide-react"

type AccessPageProps = {
  searchParams: Promise<{
    pageId?: string
    email?: string
  }>
}

export default async function TeamProjectAccessPage({ searchParams }: AccessPageProps) {
  const { userId } = await auth()
  const params = await searchParams
  const pageId = typeof params.pageId === "string" ? params.pageId : ""
  const email = typeof params.email === "string" ? params.email : ""

  if (!pageId) {
    redirect("/login")
  }

  const editorUrl = `/stage-manager/editor/${pageId}`
  const loginUrl = `/login?redirect_url=${encodeURIComponent(editorUrl)}${email ? `&email=${encodeURIComponent(email)}` : ""}`
  const registerUrl = `/register?redirect_url=${encodeURIComponent(editorUrl)}${email ? `&email=${encodeURIComponent(email)}` : ""}`

  if (userId) {
    redirect(editorUrl)
  }

  return (
    <div className="min-h-screen bg-background px-4 py-12">
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <div className="rounded-3xl border border-primary/20 bg-primary/5 p-8 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold tracking-wide text-primary">
              Team Project Hub
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-divider bg-surface px-3 py-1 text-xs font-bold tracking-wide text-text-secondary">
              Stage Manager Access
            </span>
          </div>

          <h1 className="mt-5 text-3xl font-black tracking-tight text-text-primary">
            Open your stage manager workspace
          </h1>
          <p className="mt-3 text-sm leading-7 text-text-secondary">
            This invite grants access to the internal editor workspace for the stages assigned to you.
            {email ? ` Continue with ${email}.` : " Continue with the email address that received the invite."}
          </p>

          <div className="mt-6 rounded-2xl border border-divider bg-surface px-4 py-4 text-sm text-text-secondary">
            If this is your first time here, create an account first. If you already have an account with the invited email, sign in and you will be redirected to the editor automatically.
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link
              href={registerUrl}
              className="inline-flex items-center justify-center rounded-2xl bg-primary px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-primary-hover"
            >
              <UserPlus size={16} className="mr-2" />
              Create Account
            </Link>
            <Link
              href={loginUrl}
              className="inline-flex items-center justify-center rounded-2xl border border-divider bg-surface px-5 py-3 text-sm font-bold text-text-primary shadow-sm transition hover:bg-divider"
            >
              <LogIn size={16} className="mr-2" />
              Sign In
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-divider bg-surface p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-text-secondary">What happens next</p>
          <div className="mt-4 space-y-3 text-sm text-text-secondary">
            <p className="flex items-start gap-3">
              <ArrowRight size={16} className="mt-0.5 shrink-0 text-primary" />
              Create an account or sign in with the invited email address.
            </p>
            <p className="flex items-start gap-3">
              <ArrowRight size={16} className="mt-0.5 shrink-0 text-primary" />
              After authentication, you go directly into the protected stage manager editor.
            </p>
            <p className="flex items-start gap-3">
              <ArrowRight size={16} className="mt-0.5 shrink-0 text-primary" />
              Your editor access remains limited to the stages assigned to you.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
