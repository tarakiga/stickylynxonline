import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(async (auth, request) => {
  const { pathname } = request.nextUrl
  const isExplicitPublic =
    pathname === '/' ||
    pathname.startsWith('/login') ||
    pathname.startsWith('/register') ||
    pathname.startsWith('/design-system')
  const singleSegment = /^\/[^/]+$/.test(pathname)
  const reserved = new Set(['dashboard', 'api', '_next', 'design-system', 'login', 'register', 'email-templates'])
  const slug = pathname.slice(1)
  const isPublicHandle = singleSegment && !reserved.has(slug)
  if (!isExplicitPublic && !isPublicHandle) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
