import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN

    if (!authDomain) {
      return NextResponse.json(
        { error: 'Authentication service not configured' },
        { status: 500 }
      )
    }

    const response = await fetch(`${authDomain}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"macOS"',
        'Referer': 'http://localhost:3301/',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'DNT': '1',
        'sec-ch-ua-mobile': '?0'
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Authentication failed' },
        { status: response.status }
      )
    }

    // Create the response with the original data
    const nextResponse = NextResponse.json(data, { status: 200 })

    // Get the Set-Cookie header from the auth service response
    const setCookieHeader = response.headers.get('set-cookie')
    
    if (setCookieHeader) {
      // Forward the Set-Cookie header from the auth service
      nextResponse.headers.set('Set-Cookie', setCookieHeader)
    } else {
      // If no Set-Cookie header, set the access_token cookie manually
      const accessToken = data.access_token
      if (accessToken) {
        nextResponse.cookies.set({
          name: 'access_token',
          value: accessToken,
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
          path: '/',
          maxAge: 60 * 60 * 24 * 7 // 7 days
        })
      }
    }

    return nextResponse
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 