import { NextResponse } from 'next/server'
import { getApiBaseUrl } from '@/lib/env-config'

export async function POST(request: Request) {
  const body = await request.json()
  const baseUrl = getApiBaseUrl()
  // Proxy the login request to the backend
  const fetchResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/api/auth/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await fetchResponse.json()
  if (data.detail) {
    return NextResponse.json(data, { status: 400 })
  }
  // Set the accessToken cookie for middleware (httpOnly for reliability)
  const response = NextResponse.json(data)
  response.cookies.set('accessToken', data.access, {
    httpOnly: true, // Most reliable for server-side auth
    path: '/',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    secure: process.env.NODE_ENV === 'production', // Set secure only in production
  })
  return response
} 