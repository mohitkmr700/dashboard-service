import { Home, Users, Settings } from "lucide-react";
import { Route } from "./types";

export const routes: Route[] = [
  { label: "Dashboard", icon: Home, href: "/dashboard" },
  { label: "Users", icon: Users, href: "/users", role: "admin" },
  { label: "Settings", icon: Settings, href: "/settings" },
]; 