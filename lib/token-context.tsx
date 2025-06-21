"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

interface TokenContextType {
  token: string | null;
  isLoading: boolean;
  error: string | null;
  refreshToken: () => Promise<void>;
  clearToken: () => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchToken = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Call the correct token API endpoint
      const response = await fetch('/api/auth/token', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid response format from server');
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch token: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.token) {
        setToken(data.token);
        // Store in localStorage for persistence
        localStorage.setItem('access_token', data.token);
      } else {
        // No token is a valid state, not an error
        setToken(null);
        localStorage.removeItem('access_token');
      }
    } catch (err) {
      console.error('Error fetching token:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch token');
      setToken(null);
      localStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    await fetchToken();
  };

  const clearToken = () => {
    setToken(null);
    setError(null);
    localStorage.removeItem('access_token');
  };

  useEffect(() => {
    // Check if token exists in localStorage first
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      setIsLoading(false);
    } else {
      // Fetch token from API if not in localStorage
      fetchToken();
    }
  }, []);

  const value: TokenContextType = {
    token,
    isLoading,
    error,
    refreshToken,
    clearToken,
  };

  return (
    <TokenContext.Provider value={value}>
      {children}
    </TokenContext.Provider>
  );
}

export function useToken() {
  const context = useContext(TokenContext);
  if (context === undefined) {
    throw new Error('useToken must be used within a TokenProvider');
  }
  return context;
}

// Utility function to get token without hook (for non-React contexts)
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('access_token');
}

// Utility function to set token (for login/logout)
export function setStoredToken(token: string | null) {
  if (typeof window === 'undefined') return;
  
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
} 