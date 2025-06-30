import { SharedLayout } from "../../components/shared-layout";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedLayout>{children}</SharedLayout>;
} 