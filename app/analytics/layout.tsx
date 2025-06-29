"use client"

import { SharedLayout } from '../../components/shared-layout';

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SharedLayout>{children}</SharedLayout>;
} 