import { LucideIcon } from "lucide-react";

export type UserRole = "admin" | "user";

export interface Route {
  label: string;
  icon: LucideIcon;
  href: string;
  role?: UserRole;
}

export interface User {
  role: UserRole;
} 