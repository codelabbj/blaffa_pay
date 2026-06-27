import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getFeatureForPath, features } from '@/lib/env-config'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/dashboard')) {
    const accessToken = request.cookies.get('accessToken')?.value
    if (!accessToken) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    const feature = getFeatureForPath(pathname)
    if (feature && !features[feature]) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*'],
} 