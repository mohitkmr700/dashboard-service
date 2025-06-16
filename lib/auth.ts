// Cache for the access token
let cachedToken: string | null = null;

// Function to get access token from cookies
export const getAccessToken = () => {
  // Return cached token if available
  if (cachedToken !== null) {
    return cachedToken;
  }

  if (typeof window === 'undefined') return null;
  
  try {
    const cookies = document.cookie.split(';');
    const accessTokenCookie = cookies.find(cookie => 
      cookie.trim().startsWith('access_token=')
    );
    
    if (accessTokenCookie) {
      cachedToken = accessTokenCookie.split('=')[1].trim();
      return cachedToken;
    }
  } catch (error) {
    console.error('Error getting access token:', error);
  }
  
  return null;
}

// Function to check if user is authenticated
export const isAuthenticated = () => {
  const token = getAccessToken();
  return !!token && token.length > 0;
}

// Function to protect routes
export const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = '/login';
  }
}

// Function to get auth headers for API calls
export const getAuthHeaders = () => {
  const token = getAccessToken();
  return {
    Authorization: token ? `Bearer ${token}` : '',
  }
}

// Function to clear auth state
export const clearAuth = () => {
  cachedToken = null;
  document.cookie.split(";").forEach((c) => {
    document.cookie = c
      .replace(/^ +/, "")
      .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
  });
} 