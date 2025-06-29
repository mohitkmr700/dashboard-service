"use client";

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Badge } from '../ui/badge';
import { User } from '../../lib/types';
import { modules } from '../../lib/modules';
import { useGetUserPermissionsQuery } from '../../lib/api/apiSlice';
import { Eye, Shield, Check, X } from 'lucide-react';

interface ViewUserPermissionsDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ModulePermission {
  visible: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
  export: boolean;
  import: boolean;
}

interface UserPermissions {
  [userId: string]: {
    [moduleId: string]: ModulePermission;
  };
}

export function ViewUserPermissionsDialog({ user, open, onOpenChange }: ViewUserPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [isLoading, setIsLoading] = useState(true);

  // Fetch user permissions
  const { data: userPermissionsData, isLoading: isLoadingPermissions } = useGetUserPermissionsQuery(user.email, {
    skip: !open || !user.email,
  });

  useEffect(() => {
    if (userPermissionsData?.data) {
      const apiPermissions = userPermissionsData.data;
      
      const userPermissions: { [moduleId: string]: ModulePermission } = {};
      
      modules.forEach(module => {
        const isVisible = apiPermissions.modules[module.id] === true;
        const modulePermissions = apiPermissions.permissions[module.id] || {
          view: false,
          edit: false,
          delete: false,
          export: false,
          import: false
        };
        
        userPermissions[module.id] = {
          visible: isVisible,
          view: modulePermissions.view,
          edit: modulePermissions.edit,
          delete: modulePermissions.delete,
          export: modulePermissions.export,
          import: modulePermissions.import
        };
      });
      
      setPermissions({ [user.id]: userPermissions });
      setIsLoading(false);
    } else if (!isLoadingPermissions) {
      setIsLoading(false);
    }
  }, [userPermissionsData, user.id, isLoadingPermissions]);

  const getModulePermission = (moduleId: string): ModulePermission => {
    if (!permissions[user.id] || !permissions[user.id][moduleId]) {
      return {
        visible: false,
        view: false,
        edit: false,
        delete: false,
        export: false,
        import: false
      };
    }
    
    return permissions[user.id][moduleId];
  };

  if (isLoading || isLoadingPermissions) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle>Loading user permissions...</DialogTitle>
          </DialogHeader>
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="text-muted-foreground">Loading...</div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[90vw] max-h-[85vh] flex flex-col">
        <DialogHeader className="flex-shrink-0 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            View Permissions for {user.full_name}
          </DialogTitle>
        </DialogHeader>
        
        {/* User Information Section - Fixed at top */}
        <div className="flex-shrink-0 mb-4 pb-4 border-b">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">User Information</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Name:</span> {user.full_name}
            </div>
            <div>
              <span className="text-muted-foreground">Email:</span> {user.email}
            </div>
            <div>
              <span className="text-muted-foreground">Role:</span> {user.role}
            </div>
            <div>
              <span className="text-muted-foreground">Status:</span> 
              <Badge variant={user.is_active ? "default" : "secondary"} className="ml-2">
                {user.is_active ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Module Permissions Section - Scrollable with dynamic height */}
        <div className="flex-shrink-0 mb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Module Permissions</span>
          </div>
        </div>
        
        {/* Scrollable content area using CSS overflow */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: '300px', maxHeight: '400px' }}>
          <div className="space-y-4 pr-4 pb-4">
            {modules.map((module) => {
              const permission = getModulePermission(module.id);
              
              if (!permission.visible) {
                return null; // Don't show hidden modules
              }
              
              return (
                <div key={module.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <module.icon className="h-4 w-4" />
                      <span className="font-medium">{module.label}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      Visible
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                    {[
                      { key: 'view', label: 'View' },
                      { key: 'edit', label: 'Edit' },
                      { key: 'delete', label: 'Delete' },
                      { key: 'export', label: 'Export' },
                      { key: 'import', label: 'Import' }
                    ].map(({ key, label }) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        {permission[key as keyof ModulePermission] ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <X className="h-4 w-4 text-red-500" />
                        )}
                        <span className={permission[key as keyof ModulePermission] ? 'text-green-700' : 'text-red-700'}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 