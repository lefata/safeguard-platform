// src/middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/lib/auth'

// Paths that don't require authentication
const publicPaths = [
  '/login',
  '/register',
  '/api/auth',
  '/mfa',
  '/_next',
  '/favicon.ico',
  '/logo.svg',
]

// Paths accessible by specific roles
const rolePathMap: Record<string, string[]> = {
  '/safeguarding': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DSL', 'DEPUTY_DSL', 'TEACHER', 'NURSE', 'PRINCIPAL'],
  '/safeguarding/all': ['SUPER_ADMIN', 'DSL', 'DEPUTY_DSL', 'PRINCIPAL'],
  '/wellbeing': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DSL', 'DEPUTY_DSL', 'COUNSELOR', 'NURSE', 'STUDENT_SUPPORT', 'PRINCIPAL'],
  '/behavior': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DSL', 'TEACHER', 'PRINCIPAL', 'STUDENT_SUPPORT'],
  '/attendance': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DSL', 'TEACHER', 'PRINCIPAL'],
  '/admin': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  '/settings': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  '/reports': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DSL', 'DEPUTY_DSL', 'PRINCIPAL', 'READ_ONLY_AUDITOR'],
  '/audit': ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'READ_ONLY_AUDITOR'],
  '/dashboard/dsl': ['SUPER_ADMIN', 'DSL', 'DEPUTY_DSL'],
  '/dashboard/admin': ['SUPER_ADMIN', 'SCHOOL_ADMIN'],
  '/dashboard/executive': ['SUPER_ADMIN', 'PRINCIPAL', 'SCHOOL_ADMIN'],
}

export default auth((req) => {
  const { pathname } = req.nextUrl
  const session = req.auth

  // Allow public paths
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Redirect to login if not authenticated
  if (!session?.user) {
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check MFA
  if (session.user.mfaEnabled && !session.user.mfaVerified && !pathname.startsWith('/mfa')) {
    return NextResponse.redirect(new URL('/mfa', req.url))
  }

  // Role-based access control
  const userRole = session.user.role as string

  for (const [path, allowedRoles] of Object.entries(rolePathMap)) {
    if (pathname.startsWith(path) && !allowedRoles.includes(userRole)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Add tenant context header
  const response = NextResponse.next()
  response.headers.set('x-tenant-id', session.user.tenantId)
  response.headers.set('x-user-id', session.user.id)
  response.headers.set('x-user-role', userRole)

  return response
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
