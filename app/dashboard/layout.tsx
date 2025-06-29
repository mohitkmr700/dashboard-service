"use client"

import { SharedLayout } from '../../components/shared-layout';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SharedLayout>{children}</SharedLayout>;
} 