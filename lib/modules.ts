import { Home, Users, Settings, BarChart, FileText, Mail, CheckSquare, PieChart, Receipt } from "lucide-react";

export interface ModuleConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  emoji: string;
}

export const modules: ModuleConfig[] = [
  { 
    id: 'plan', 
    label: 'Plan Tracker', 
    icon: PieChart, 
    href: '/dashboard/plan',
    emoji: '💰'
  },
  { 
    id: 'expense', 
    label: 'Expense Management', 
    icon: Receipt, 
    href: '/expense',
    emoji: '💳'
  },
  { 
    id: 'dashboard', 
    label: 'Dashboard', 
    icon: Home, 
    href: '/dashboard',
    emoji: '🏠'
  },
  { 
    id: 'tasks', 
    label: 'Tasks', 
    icon: CheckSquare, 
    href: '/tasks',
    emoji: '✅'
  },
  { 
    id: 'analytics', 
    label: 'Analytics', 
    icon: BarChart, 
    href: '/analytics',
    emoji: '📊'
  },
  { 
    id: 'users', 
    label: 'Users', 
    icon: Users, 
    href: '/users',
    emoji: '👥'
  },
  { 
    id: 'documents', 
    label: 'Documents', 
    icon: FileText, 
    href: '/documents',
    emoji: '📄'
  },
  { 
    id: 'messages', 
    label: 'Messages', 
    icon: Mail, 
    href: '/messages',
    emoji: '💬'
  },
  { 
    id: 'settings', 
    label: 'Settings', 
    icon: Settings, 
    href: '/settings',
    emoji: '⚙️'
  },
];

// Permission types configuration
export const permissionTypes = [
  { id: 'view', label: 'View', icon: '👁️' },
  { id: 'edit', label: 'Edit', icon: '✏️' },
  { id: 'delete', label: 'Delete', icon: '🗑️' },
  { id: 'export', label: 'Export', icon: '📤' },
  { id: 'import', label: 'Import', icon: '📥' },
] as const;

export type PermissionType = typeof permissionTypes[number]['id'];

// Module permission interface
export interface ModulePermission {
  visible: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
}

// User permissions interface
export interface UserPermissions {
  [userId: string]: {
    [moduleId: string]: ModulePermission;
  };
}

// Payload interface for API
export interface PermissionsPayload {
  email: string;
  modules: { [key: string]: boolean };
  permissions: { [key: string]: {
    view: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
    import: boolean;
  }};
  updated_by: string;
} 