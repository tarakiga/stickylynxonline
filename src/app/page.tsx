import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-background text-text-primary min-h-screen">
      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary mb-6 shadow-premium"></div>
      <h1 className="text-4xl font-bold tracking-tight mb-4">Welcome to Stickylynx</h1>
      <p className="text-text-secondary max-w-md mb-8">
        The core application has been initialized with our custom design system.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {userId ? (
          <Link href="/dashboard" className="btn-primary font-bold px-6 py-3 rounded-full shadow-sm">
            Go to Dashboard
          </Link>
        ) : (
          <div className="flex gap-4">
            <Link href="/login" className="btn-primary font-bold px-6 py-3 rounded-full shadow-sm">
              Login to Dashboard
            </Link>
            <Link href="/register" className="bg-surface border border-divider hover:bg-divider font-bold px-6 py-3 rounded-full shadow-sm transition-colors text-text-primary">
              Create an Account
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
