"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  loadingMessage: string;
  setLoadingMessage: (message: string) => void;
  resetLoading: () => void;
  isLoggingOut: boolean;
  setIsLoggingOut: (loggingOut: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const resetLoading = () => {
    setIsLoading(false);
    setLoadingMessage('Loading...');
    setIsLoggingOut(false);
  };

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      setIsLoading, 
      loadingMessage, 
      setLoadingMessage,
      resetLoading,
      isLoggingOut,
      setIsLoggingOut
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
} 