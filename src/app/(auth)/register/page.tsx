import * as React from "react"
import Link from "next/link"
import { SignUp } from "@clerk/nextjs"

type RegisterPageProps = {
  searchParams: Promise<{
    redirect_url?: string
    email?: string
  }>
}

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams
  const redirectUrl = typeof params.redirect_url === "string" ? params.redirect_url : undefined
  const email = typeof params.email === "string" ? params.email : ""
  const normalizedRedirectUrl = redirectUrl || "/dashboard"
  const loginUrl = `/login?redirect_url=${encodeURIComponent(normalizedRedirectUrl)}${email ? `&email=${encodeURIComponent(email)}` : ""}`

  return (
    <div className="space-y-6">
      <div className="mb-6 text-center sm:text-left">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight">Create your account</h1>
        <p className="text-text-secondary mt-2">Join thousands of creators building their audience today.</p>
      </div>

      {email ? (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm font-semibold text-text-primary">
          Create your account with {email} to accept the stage manager invite and continue to the editor.
        </div>
      ) : null}

      <SignUp 
        routing="hash"
        forceRedirectUrl={normalizedRedirectUrl}
        fallbackRedirectUrl={normalizedRedirectUrl}
        signInForceRedirectUrl={normalizedRedirectUrl}
        signInFallbackRedirectUrl={normalizedRedirectUrl}
        signInUrl={loginUrl}
        initialValues={email ? { emailAddress: email } : undefined}
        appearance={{
          elements: {
            rootBox: "w-full",
            cardBox: "w-full shadow-none",
            card: "bg-surface border border-divider shadow-sm rounded-2xl w-full p-2 sm:p-4",
            headerTitle: "hidden", 
            headerSubtitle: "hidden",
            socialButtons: "mt-0",
            socialButtonsBlockButton: "bg-background border border-divider hover:opacity-80 text-text-primary rounded-xl transition-colors py-3 shadow-sm",
            dividerRow: "my-6",
            dividerLine: "bg-divider",
            dividerText: "text-text-secondary text-xs font-bold uppercase tracking-wider",
            formFieldLabelRow: "mb-1",
            formFieldLabel: "text-sm font-semibold text-text-secondary",
            formFieldInput: "w-full input-base px-4 py-3 placeholder:text-text-secondary/50 transition-all font-sans text-text-primary outline-none focus:border-primary focus:ring-2 focus:ring-primary-light",
            formButtonPrimary: "bg-primary hover:bg-primary-hover text-white font-bold rounded-xl transition-colors shadow-sm shadow-primary/20 w-full py-3.5 text-base normal-case",
            footerAction: "hidden",
            identityPreviewText: "text-text-primary font-semibold",
            formFieldInputShowPasswordButton: "text-text-secondary hover:text-primary transition-colors",
          },
          variables: {
            colorPrimary: 'var(--color-primary)',
            colorText: 'var(--color-text-primary)',
            colorTextSecondary: 'var(--color-text-secondary)',
            colorBackground: 'var(--color-surface)',
            colorInputText: 'var(--color-text-primary)',
            colorInputBackground: 'var(--color-background)',
            colorDanger: 'var(--color-error)',
            borderRadius: '1rem',
            fontFamily: 'var(--font-asap), sans-serif',
          }
        }}
      />

      <p className="text-center font-semibold text-sm text-text-secondary mt-8">
        Already have an account? <Link href={loginUrl} className="text-primary hover:text-primary-hover font-bold hover:underline transition-all">Log in</Link>
      </p>
    </div>
  )
}
