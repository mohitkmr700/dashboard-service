"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes";
import { Provider } from 'react-redux';
import { store } from '../lib/store';
import { LoadingProvider } from '../lib/loading-context';
import { TokenProvider } from '../lib/token-context';
import { SidebarProvider } from '../lib/sidebar-context';

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ReduxProvider>
      <ThemeProvider>
        <LoadingProvider>
          <TokenProvider>
            <SidebarProvider>
              {children}
            </SidebarProvider>
          </TokenProvider>
        </LoadingProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
} 