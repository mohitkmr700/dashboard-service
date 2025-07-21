import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plan Tracker - Dashboard',
  description: 'Track and visualize your personal expense plans',
};

export default function PlanLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 