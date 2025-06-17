import { cookies } from 'next/headers'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'

/**
 * Get a cookie value by name
 * @param name Cookie name
 * @returns Cookie value or null if not found
 */
export const getCookie = async (name: string): Promise<string | null> => {
  if (typeof window === 'undefined') {
    // Server-side
    const cookieStore = await cookies()
    return cookieStore.get(name)?.value || null
  } else {
    // Client-side
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }
}

/**
 * Get all cookies
 * @returns Object containing all cookies
 */
export const getAllCookies = async (): Promise<Record<string, string>> => {
  if (typeof window === 'undefined') {
    // Server-side
    const cookieStore = await cookies()
    const allCookies: Record<string, string> = {}
    cookieStore.getAll().forEach((cookie: RequestCookie) => {
      allCookies[cookie.name] = cookie.value
    })
    return allCookies
  } else {
    // Client-side
    const allCookies: Record<string, string> = {}
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=')
      if (name && value) {
        allCookies[name] = value
      }
    })
    return allCookies
  }
}

/**
 * Set a cookie
 * @param name Cookie name
 * @param value Cookie value
 * @param options Cookie options
 */
export const setCookie = async (
  name: string,
  value: string,
  options: {
    expires?: Date
    path?: string
    domain?: string
    secure?: boolean
    sameSite?: 'strict' | 'lax' | 'none'
    maxAge?: number
  } = {}
): Promise<void> => {
  if (typeof window === 'undefined') {
    // Server-side
    const cookieStore = await cookies()
    cookieStore.set(name, value, options)
  } else {
    // Client-side
    let cookie = `${name}=${value}`
    
    if (options.expires) {
      cookie += `; expires=${options.expires.toUTCString()}`
    }
    if (options.path) {
      cookie += `; path=${options.path}`
    }
    if (options.domain) {
      cookie += `; domain=${options.domain}`
    }
    if (options.secure) {
      cookie += '; secure'
    }
    if (options.sameSite) {
      cookie += `; samesite=${options.sameSite}`
    }
    if (options.maxAge) {
      cookie += `; max-age=${options.maxAge}`
    }

    document.cookie = cookie
  }
}

/**
 * Delete a cookie
 * @param name Cookie name
 * @param options Cookie options (path and domain are required for proper deletion)
 */
export const deleteCookie = async (
  name: string,
  options: {
    path?: string
    domain?: string
  } = {}
): Promise<void> => {
  if (typeof window === 'undefined') {
    // Server-side
    const cookieStore = await cookies()
    cookieStore.delete(name)
  } else {
    // Client-side
    let cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT`
    if (options.path) {
      cookie += `; path=${options.path}`
    }
    if (options.domain) {
      cookie += `; domain=${options.domain}`
    }
    document.cookie = cookie
  }
}

/**
 * Decode a cookie value (handles URL encoding)
 * @param value Cookie value to decode
 * @returns Decoded value
 */
export const decodeCookie = (value: string): string => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Get and decode a cookie value
 * @param name Cookie name
 * @returns Decoded cookie value or null if not found
 */
export const getDecodedCookie = async (name: string): Promise<string | null> => {
  const value = await getCookie(name)
  return value ? decodeCookie(value) : null
}

/**
 * Get the access token from cookies
 * @returns Access token or null if not found
 */
export const getAccessToken = async (): Promise<string | null> => {
  return getDecodedCookie('access_token')
}

/**
 * Check if user is authenticated
 * @returns boolean indicating if user is authenticated
 */
export const isAuthenticated = async (): Promise<boolean> => {
  const token = await getAccessToken()
  return !!token && token.length > 0
} 