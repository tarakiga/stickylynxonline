import * as React from "react"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
export default async function StageManagerLayout({ children }: { children: React.ReactNode }) {
  const { userId } = await auth()
  if (!userId) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <main className="flex-1 p-6 sm:p-10 overflow-auto">
        {children}
      </main>
    </div>
  )
}
