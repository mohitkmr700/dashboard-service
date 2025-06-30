import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN

    if (!authDomain) {
      return NextResponse.json(
        { error: 'Authentication service not configured' },
        { status: 500 }
      )
    }

    // Get all cookies from the request
    const cookies = request.cookies.getAll()
    
    const response = await fetch(`${authDomain}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sec-ch-ua-platform': '"macOS"',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36',
        'sec-ch-ua': '"Google Chrome";v="137", "Chromium";v="137", "Not/A)Brand";v="24"',
        'DNT': '1',
        'sec-ch-ua-mobile': '?0',
        // Forward all cookies to the auth service
        'Cookie': cookies.map(cookie => `${cookie.name}=${cookie.value}`).join('; ')
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Logout failed' },
        { status: response.status }
      )
    }

    // Create response with cleared cookies
    const nextResponse = NextResponse.json({ success: true }, { status: 200 })
    
    // Get the Set-Cookie header from the auth service response
    const setCookieHeader = response.headers.get('set-cookie')
    
    if (setCookieHeader) {
      // Forward the Set-Cookie header from the auth service
      nextResponse.headers.set('Set-Cookie', setCookieHeader)
    }

    // Clear all local cookies
    cookies.forEach(cookie => {
      nextResponse.cookies.set({
        name: cookie.name,
        value: '',
        expires: new Date(0),
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      })
    })

    // Ensure access_token is cleared
    nextResponse.cookies.set({
      name: 'access_token',
      value: '',
      expires: new Date(0),
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })

    return nextResponse
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 