"use client"

import { SharedLayout } from '../../components/shared-layout';

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <SharedLayout>{children}</SharedLayout>;
} 