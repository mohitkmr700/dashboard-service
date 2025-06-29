import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that should be accessible without authentication
const publicPaths = [
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/token',
  '/_next',
  '/favicon.ico',
  '/public',
]

// Define sidebar routes that require authentication
const sidebarRoutes = [
  '/dashboard',
  '/analytics', 
  '/users',
  '/documents',
  '/messages',
  '/settings'
]

// Disable console.log in production environments
if (process.env.NODE_ENV === 'production') {
  // Override console.log to prevent logging in production
  const originalConsoleLog = console.log;
  console.log = (...args: any[]) => {
    // Only log if explicitly allowed or in development
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_CONSOLE_LOG === 'true') {
      originalConsoleLog.apply(console, args);
    }
  };
  
  // Also disable other console methods in production
  console.warn = (...args: any[]) => {
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_CONSOLE_LOG === 'true') {
      console.warn.apply(console, args);
    }
  };
  
  console.error = (...args: any[]) => {
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_CONSOLE_LOG === 'true') {
      console.error.apply(console, args);
    }
  };
  
  console.info = (...args: any[]) => {
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_CONSOLE_LOG === 'true') {
      console.info.apply(console, args);
    }
  };
  
  console.debug = (...args: any[]) => {
    if (process.env.NODE_ENV === 'development' || process.env.ALLOW_CONSOLE_LOG === 'true') {
      console.debug.apply(console, args);
    }
  };
}

// Function to validate token (basic validation)
function isValidToken(token: string): boolean {
  if (!token) return false;
  
  try {
    // Basic JWT structure validation (header.payload.signature)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    // Check if token is not expired (basic check)
    const payload = JSON.parse(atob(parts[1]));
    const currentTime = Math.floor(Date.now() / 1000);
    
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }
    
    return true;
  } catch (error) {
    return false;
  }
}

// Function to check if path is a sidebar route
function isSidebarRoute(pathname: string): boolean {
  return sidebarRoutes.some(route => pathname === route || pathname.startsWith(route + '/'));
}

// Function to check if path is public
function isPublicPath(pathname: string): boolean {
  return publicPaths.some(path => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the access_token from cookies using NextRequest
  const accessToken = request.cookies.get('access_token')?.value

  // Check if the path is public
  const isPublic = isPublicPath(pathname)
  const isSidebar = isSidebarRoute(pathname)

  // Debug log for authentication flow
  if (isSidebar) {
    console.log(`Middleware: ${pathname} - Token: ${accessToken ? 'Present' : 'Missing'} - Valid: ${accessToken ? isValidToken(accessToken) : 'N/A'}`);
  }

  // If accessing a sidebar route without a token, redirect to login
  if (isSidebar && !accessToken) {
    console.log(`Middleware: Redirecting ${pathname} to login (no token)`);
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    return NextResponse.redirect(url)
  }

  // If accessing a sidebar route with an invalid token, redirect to login
  if (isSidebar && accessToken && !isValidToken(accessToken)) {
    console.log(`Middleware: Redirecting ${pathname} to login (invalid token)`);
    const url = new URL('/login', request.url)
    url.searchParams.set('from', pathname)
    url.searchParams.set('error', 'invalid_token')
    return NextResponse.redirect(url)
  }

  // If accessing login page with a valid token, redirect to dashboard
  if (pathname === '/login' && accessToken && isValidToken(accessToken)) {
    console.log(`Middleware: Redirecting login to dashboard (valid token)`);
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For API routes, add CORS headers and validate token for protected routes
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // Add CORS headers
    response.headers.set('Access-Control-Allow-Credentials', 'true')
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
    response.headers.set(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    )

    // For protected API routes, validate token
    const isProtectedApiRoute = !pathname.startsWith('/api/auth/') && 
                               !pathname.startsWith('/api/_next/') &&
                               pathname !== '/api/health';
    
    if (isProtectedApiRoute && (!accessToken || !isValidToken(accessToken))) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Invalid or missing token' },
        { status: 401 }
      )
    }

    return response
  }

  // For sidebar routes, ensure the response includes cache control headers
  if (isSidebar) {
    const response = NextResponse.next()
    
    // Add cache control headers to prevent stale data
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  }

  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 