interface DecodedToken {
  profile_picture: string;
  full_name: string;
  email: string;
}

interface TokenResponse {
  token?: string;
  decoded?: DecodedToken;
}

// Cache for token data
let tokenCache: {
  data: TokenResponse | null;
  timestamp: number;
  promise: Promise<TokenResponse> | null;
} = {
  data: null,
  timestamp: 0,
  promise: null,
};

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

// Check if cache is valid
const isCacheValid = () => {
  return tokenCache.data && (Date.now() - tokenCache.timestamp) < CACHE_DURATION;
};

// Clear cache
export const clearTokenCache = () => {
  tokenCache = {
    data: null,
    timestamp: 0,
    promise: null,
  };
};

// Memoized token fetch function
export const getTokenData = async (): Promise<TokenResponse> => {
  // Return cached data if valid
  if (isCacheValid()) {
    return tokenCache.data!;
  }

  // Return existing promise if a request is in progress
  if (tokenCache.promise) {
    return tokenCache.promise;
  }

  // Create new promise for token fetch
  tokenCache.promise = fetch('/api/auth/token', {
    method: 'GET',
    credentials: 'include',
  })
    .then(async (response) => {
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the successful response
      tokenCache.data = data;
      tokenCache.timestamp = Date.now();
      
      return data;
    })
    .catch((error) => {
      console.error('Error fetching token:', error);
      throw error;
    })
    .finally(() => {
      // Clear the promise reference
      tokenCache.promise = null;
    });

  return tokenCache.promise;
};

// Get just the token string
export const getToken = async (): Promise<string | null> => {
  try {
    const data = await getTokenData();
    return data.token || null;
  } catch {
    // If there's an error, return null
    return null;
  }
};

// Get just the decoded token data
export const getDecodedToken = async (): Promise<DecodedToken | null> => {
  try {
    const data = await getTokenData();
    return data.decoded || null;
  } catch {
    // If there's an error, return null
    return null;
  }
};

// Get user email from token
export const getUserEmail = async (): Promise<string | null> => {
  try {
    const decoded = await getDecodedToken();
    return decoded?.email || null;
  } catch {
    // If there's an error, return null
    return null;
  }
}; 