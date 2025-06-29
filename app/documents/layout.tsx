"use client"

import { SharedLayout } from '../../components/shared-layout';

export default function DocumentsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SharedLayout>{children}</SharedLayout>;
} 