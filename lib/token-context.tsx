"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getToken, getDecodedToken, clearTokenCache } from './token-api';

interface DecodedToken {
  profile_picture: string;
  full_name: string;
  email: string;
}

interface TokenContextType {
  token: string | null;
  decodedToken: DecodedToken | null;
  isLoading: boolean;
  error: string | null;
  refreshToken: () => Promise<void>;
  clearToken: () => void;
}

const TokenContext = createContext<TokenContextType | undefined>(undefined);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [decodedToken, setDecodedToken] = useState<DecodedToken | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokenData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch both token and decoded data in parallel
      const [tokenData, decodedData] = await Promise.all([
        getToken(),
        getDecodedToken()
      ]);
      
      setToken(tokenData);
      setDecodedToken(decodedData);
      
      if (tokenData) {
        // Store in localStorage for persistence
        localStorage.setItem('access_token', tokenData);
      } else {
        // No token is a valid state, not an error
        localStorage.removeItem('access_token');
      }
    } catch (err) {
      console.error('Error fetching token data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch token');
      setToken(null);
      setDecodedToken(null);
      localStorage.removeItem('access_token');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshToken = async () => {
    // Clear cache and fetch fresh token
    clearTokenCache();
    await fetchTokenData();
  };

  const clearToken = () => {
    setToken(null);
    setDecodedToken(null);
    setError(null);
    localStorage.removeItem('access_token');
    clearTokenCache();
  };

  useEffect(() => {
    // Only run on client side to avoid hydration issues
    if (typeof window === 'undefined') return;

    // Check if token exists in localStorage first
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      // Still fetch decoded data to ensure it's current
      getDecodedToken().then(decoded => {
        setDecodedToken(decoded);
        setIsLoading(false);
      }).catch(() => {
        // If decoded token fetch fails, clear everything
        clearToken();
        setIsLoading(false);
      });
    } else {
      // Fetch token from API if not in localStorage
      fetchTokenData();
    }
  }, []);

  // Listen for storage changes (for logout from other tabs)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'access_token' && e.newValue === null) {
        clearToken();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: TokenContextType = {
    token,
    decodedToken,
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