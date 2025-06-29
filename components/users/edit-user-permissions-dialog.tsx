"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Checkbox } from '../ui/checkbox';
import { User } from '../../lib/types';
import { modules } from '../../lib/modules';
import { useGetUserPermissionsQuery, useSubmitUserPermissionsMutation } from '../../lib/api/apiSlice';
import { useToken } from '../../lib/token-context';
import { useToast } from '../ui/use-toast';
import { Edit, Shield, Save, X } from 'lucide-react';
import { PermissionsPayload } from '../../lib/modules';

interface EditUserPermissionsDialogProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onPermissionsUpdate: (userEmail: string, visibleModuleIds: string[]) => void;
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

export function EditUserPermissionsDialog({ 
  user, 
  open, 
  onOpenChange, 
  onPermissionsUpdate 
}: EditUserPermissionsDialogProps) {
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [originalPermissions, setOriginalPermissions] = useState<UserPermissions>({});
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const { toast } = useToast();
  const { decodedToken } = useToken();
  const loggedInUserEmail = decodedToken?.email || '';

  // RTK Query hooks
  const { data: userPermissionsData, isLoading: isLoadingPermissions } = useGetUserPermissionsQuery(user.email, {
    skip: !open || !user.email,
  });

  const [updatePermissions] = useSubmitUserPermissionsMutation();

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
      setOriginalPermissions({ [user.id]: userPermissions });
      setIsLoading(false);
    } else if (!isLoadingPermissions) {
      setIsLoading(false);
    }
  }, [userPermissionsData, user.id, isLoadingPermissions]);

  const checkForChanges = useCallback((newPermissions: UserPermissions) => {
    const original = originalPermissions[user.id];
    const current = newPermissions[user.id];
    
    if (!original || !current) return false;
    
    return JSON.stringify(original) !== JSON.stringify(current);
  }, [originalPermissions, user.id]);

  useEffect(() => {
    setHasChanges(checkForChanges(permissions));
  }, [permissions, user.id, checkForChanges]);

  const getModulePermission = (moduleId: string): ModulePermission => {
    if (!permissions[user.id] || !permissions[user.id][moduleId]) {
      return {
        visible: true,
        view: true,
        edit: false,
        delete: false,
        export: false,
        import: false
      };
    }
    
    return permissions[user.id][moduleId];
  };

  const toggleModuleVisibility = (moduleId: string) => {
    setPermissions(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        [moduleId]: {
          ...prev[user.id][moduleId],
          visible: !prev[user.id][moduleId]?.visible
        }
      }
    }));
  };

  const togglePermission = (moduleId: string, permissionType: string) => {
    setPermissions(prev => ({
      ...prev,
      [user.id]: {
        ...prev[user.id],
        [moduleId]: {
          ...prev[user.id][moduleId],
          [permissionType]: !prev[user.id][moduleId]?.[permissionType as keyof ModulePermission]
        }
      }
    }));
  };

  const createPermissionsPayload = (): PermissionsPayload | null => {
    if (!permissions[user.id]) {
      return null;
    }

    const modulesData: { [key: string]: boolean } = {};
    const permissionsData: { [key: string]: {
      view: boolean;
      edit: boolean;
      delete: boolean;
      export: boolean;
      import: boolean;
    }} = {};

    modules.forEach(module => {
      const modulePermission = getModulePermission(module.id);
      modulesData[module.id] = modulePermission.visible;
      
      if (modulePermission.visible) {
        permissionsData[module.id] = {
          view: modulePermission.view,
          edit: modulePermission.edit,
          delete: modulePermission.delete,
          export: modulePermission.export,
          import: modulePermission.import
        };
      }
    });

    return {
      email: user.email,
      modules: modulesData,
      permissions: permissionsData,
      updated_by: loggedInUserEmail
    };
  };

  const handleSubmit = async () => {
    const payload = createPermissionsPayload();
    if (!payload) {
      toast({
        title: "Error",
        description: "Failed to create permissions payload",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const response = await updatePermissions(payload).unwrap();
      
      // Update original permissions to current state
      setOriginalPermissions(prev => ({
        ...prev,
        [user.id]: permissions[user.id]
      }));
      
      setHasChanges(false);
      setIsSubmitted(true);
      
      toast({
        title: "Success",
        description: response.message || `Permissions updated for ${user.full_name}`,
      });
      
      // If this is the logged-in user, update sidebar permissions
      if (user.email === loggedInUserEmail) {
        const visibleModules = modules.filter(module => {
          const permission = getModulePermission(module.id);
          return permission.visible;
        });
        const visibleModuleIds = visibleModules.map(m => m.id);
        onPermissionsUpdate(user.email, visibleModuleIds);
      }
      
      // Reset submitted state after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
      
    } catch (error) {
      console.error('Error submitting permissions:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to submit permissions",
        variant: "destructive",
      });
    }
  };

  const handleReset = () => {
    setPermissions(originalPermissions);
    setHasChanges(false);
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
            <Edit className="h-5 w-5" />
            Edit Permissions for {user.full_name}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="text-sm font-medium">Module Permissions</span>
            </div>
            {hasChanges && (
              <Badge variant="outline" className="text-xs text-orange-600">
                Unsaved Changes
              </Badge>
            )}
          </div>
        </div>
        
        {/* Scrollable content area using CSS overflow */}
        <div className="flex-1 overflow-y-auto" style={{ minHeight: '300px', maxHeight: '400px' }}>
          <div className="space-y-4 pr-4 pb-4">
            {modules.map((module) => {
              const permission = getModulePermission(module.id);
              
              return (
                <div key={module.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <module.icon className="h-4 w-4" />
                      <span className="font-medium">{module.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={permission.visible}
                        onCheckedChange={() => toggleModuleVisibility(module.id)}
                      />
                      <span className="text-sm">Visible</span>
                    </div>
                  </div>
                  
                  {permission.visible && (
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {[
                        { key: 'view', label: 'View' },
                        { key: 'edit', label: 'Edit' },
                        { key: 'delete', label: 'Delete' },
                        { key: 'export', label: 'Export' },
                        { key: 'import', label: 'Import' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-2">
                          <Checkbox
                            checked={permission[key as keyof ModulePermission]}
                            onCheckedChange={() => togglePermission(module.id, key)}
                          />
                          <span className="text-sm">{label}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer - Fixed at bottom */}
        <DialogFooter className="flex-shrink-0 pt-4 border-t mt-4">
          <div className="flex gap-2 w-full justify-end">
            {hasChanges && (
              <Button variant="outline" onClick={handleReset}>
                <X className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={!hasChanges || isSubmitted}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSubmitted ? 'Saved!' : 'Save Changes'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 