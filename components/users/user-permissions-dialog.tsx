"use client"

import { useState, useEffect } from 'react';
import { User } from '../../lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { User as UserIcon, Eye, EyeOff, Check } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { 
  modules, 
  permissionTypes, 
  type ModulePermission, 
  type UserPermissions, 
  type PermissionsPayload 
} from '../../lib/modules';
import { 
  useSubmitUserPermissionsMutation, 
  useGetUserPermissionsQuery
} from '../../lib/api/apiSlice';
import { useToken } from '../../lib/token-context';

interface UserPermissionsDialogProps {
  users: User[];
  trigger: React.ReactNode;
  onPermissionsUpdate?: (userEmail: string, visibleModules: string[]) => void;
}

export function UserPermissionsDialog({ users, trigger, onPermissionsUpdate }: UserPermissionsDialogProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [originalPermissions, setOriginalPermissions] = useState<UserPermissions>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Get token data from token context
  const { decodedToken } = useToken();

  // RTK Query hooks - only call when dialog is open
  const [updatePermissions, { isLoading: isUpdating }] = useSubmitUserPermissionsMutation();
  const { data: userPermissionsData, isLoading: isLoadingPermissions } = useGetUserPermissionsQuery(
    selectedUser?.email || '', 
    { skip: !selectedUser?.email || !dialogOpen }
  );
  
  // Separate query for logged-in user permissions - only call when dialog is open
  const { data: loggedInUserPermissionsData } = useGetUserPermissionsQuery(
    loggedInUserEmail || '',
    { skip: !loggedInUserEmail || !dialogOpen }
  );

  // Get logged in user email from token context
  useEffect(() => {
    if (decodedToken?.email) {
      setLoggedInUserEmail(decodedToken.email);
        }
  }, [decodedToken?.email]);

  // Handle logged-in user permissions for sidebar control
  useEffect(() => {
    if (loggedInUserPermissionsData?.data && onPermissionsUpdate && loggedInUserEmail) {
      const apiPermissions = loggedInUserPermissionsData.data;
      
      // Extract visible modules for sidebar control
      const visibleModules = modules.filter(module => 
        apiPermissions.modules[module.id] === true
      ).map(module => module.id);
      
      // Call the callback to update sidebar
        onPermissionsUpdate(loggedInUserEmail, visibleModules);
      }
  }, [loggedInUserPermissionsData, loggedInUserEmail, onPermissionsUpdate]);

  const handleUserSelect = async (user: User) => {
    setSelectedUser(user);
    setIsSubmitted(false);
    
    // RTK Query will automatically fetch permissions when selectedUser changes
  };

  // Reset dialog state when it closes
  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      // Reset state when dialog closes
      setSelectedUser(null);
      setIsSubmitted(false);
      setHasChanges(false);
      }
  };

  // Handle permissions data when it's loaded
  useEffect(() => {
    if (selectedUser && userPermissionsData?.data) {
      const apiPermissions = userPermissionsData.data;
      
      // Convert API response to our internal format
      const convertedPermissions: UserPermissions = {
        [selectedUser.id]: {}
      };
      
      modules.forEach(module => {
        const isVisible = apiPermissions.modules[module.id] || false;
        const modulePermissions = apiPermissions.permissions[module.id] || {
          view: false,
          edit: false,
          delete: false,
          export: false,
          import: false
        };
        
        convertedPermissions[selectedUser.id][module.id] = {
          visible: isVisible,
          view: modulePermissions.view,
          edit: modulePermissions.edit,
          delete: modulePermissions.delete,
          export: modulePermissions.export,
          import: modulePermissions.import
        };
      });
      
      setPermissions(convertedPermissions);
      setOriginalPermissions(convertedPermissions);
      setHasChanges(false);
    }
  }, [selectedUser, userPermissionsData]);
      
  // Handle error case (no permissions found)
  useEffect(() => {
    if (selectedUser && !isLoadingPermissions && !userPermissionsData) {
        // Use default permissions for new users
        const defaultPermissions = modules.reduce((acc, module) => ({
          ...acc,
          [module.id]: {
            visible: true,
            view: true,
            edit: false,
            delete: false,
            export: false,
            import: false
          }
        }), {});
        
        setPermissions(prev => ({
          ...prev,
        [selectedUser.id]: defaultPermissions
        }));
        
        setOriginalPermissions(prev => ({
          ...prev,
        [selectedUser.id]: defaultPermissions
        }));
        
        setHasChanges(false);
    }
  }, [selectedUser, isLoadingPermissions, userPermissionsData]);

  const toggleModuleVisibility = (moduleId: string) => {
    if (!selectedUser) return;
    
    setPermissions(prev => ({
      ...prev,
      [selectedUser.id]: {
        ...prev[selectedUser.id],
        [moduleId]: {
          ...prev[selectedUser.id][moduleId],
          visible: !prev[selectedUser.id][moduleId].visible
        }
      }
    }));
  };

  const togglePermission = (moduleId: string, permissionType: string) => {
    if (!selectedUser) return;
    
    setPermissions(prev => ({
      ...prev,
      [selectedUser.id]: {
        ...prev[selectedUser.id],
        [moduleId]: {
          ...prev[selectedUser.id][moduleId],
          [permissionType]: !prev[selectedUser.id][moduleId][permissionType as keyof ModulePermission]
        }
      }
    }));
  };

  const checkForChanges = (newPermissions: UserPermissions) => {
    if (!selectedUser) return false;
    
    const original = originalPermissions[selectedUser.id];
    const current = newPermissions[selectedUser.id];
    
    if (!original || !current) return false;
    
    return JSON.stringify(original) !== JSON.stringify(current);
  };

  useEffect(() => {
    setHasChanges(checkForChanges(permissions));
  }, [permissions, selectedUser, checkForChanges]);

  const getModulePermission = (moduleId: string): ModulePermission => {
    if (!selectedUser || !permissions[selectedUser.id]) {
      return {
        visible: true,
        view: true,
        edit: false,
        delete: false,
        export: false,
        import: false
      };
    }
    
    return permissions[selectedUser.id][moduleId] || {
      visible: true,
      view: true,
      edit: false,
      delete: false,
      export: false,
      import: false
    };
  };

  const createPermissionsPayload = (): PermissionsPayload | null => {
    if (!selectedUser || !permissions[selectedUser.id]) {
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
      email: selectedUser.email,
      modules: modulesData,
      permissions: permissionsData,
      updated_by: loggedInUserEmail
    };
  };

  const handleSubmit = async () => {
    if (!selectedUser) return;
    
    const payload = createPermissionsPayload();
    if (!payload) {
      toast({
        title: "Error",
        description: "Failed to create permissions payload",
        variant: "destructive",
      });
      return;
    }
    
    console.log('Permissions Payload:', JSON.stringify(payload, null, 2));
    
    // Log the visible modules for this user
    const visibleModules = modules.filter(module => {
      const permission = getModulePermission(module.id);
      return permission.visible;
    });
    
    console.log('Visible Modules for', selectedUser.email, ':', visibleModules.map(m => m.label));
    
    try {
      // Submit permissions using RTK Query
      const response = await updatePermissions(payload).unwrap();
      
      console.log('API Response:', response);
      
      // Update original permissions to current state
      setOriginalPermissions(prev => ({
        ...prev,
        [selectedUser.id]: permissions[selectedUser.id]
      }));
      
      setHasChanges(false);
      setIsSubmitted(true);
      
      // Show success message from API response
      toast({
        title: "Success",
        description: response.message || `Permissions updated for ${selectedUser.full_name}`,
      });
      
      // If this is the logged-in user, update sidebar permissions
      if (selectedUser.email === loggedInUserEmail) {
        const visibleModuleIds = visibleModules.map(m => m.id);
        if (onPermissionsUpdate) {
          onPermissionsUpdate(selectedUser.email, visibleModuleIds);
          
          // Force a refresh of the permissions API to ensure consistency
          setTimeout(() => {
            window.dispatchEvent(new CustomEvent('permissionsRefresh'));
          }, 500);
        }
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

  const getVisibleModules = () => {
    if (!selectedUser || !permissions[selectedUser.id]) {
      return modules;
    }
    return modules.filter(module => 
      permissions[selectedUser.id][module.id]?.visible !== false
    );
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>User Permissions Management</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6 flex-1 min-h-0">
          {/* Left side - Users list */}
          <div className="w-1/3 border-r pr-4 flex flex-col">
            <h3 className="font-semibold mb-3 text-sm text-muted-foreground flex-shrink-0">Users</h3>
            <ScrollArea className="flex-1">
              <div className="space-y-2 pr-4">
                {users.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => handleUserSelect(user)}
                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                      selectedUser?.id === user.id
                        ? 'bg-primary/10 border-primary/20'
                        : 'hover:bg-muted/50 border-border'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{user.email}</div>
                      </div>
                      <Badge variant={user.is_active ? "default" : "secondary"} className="text-xs">
                        {user.role}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Right side - Modules and permissions */}
          <div className="flex-1 flex flex-col">
            {selectedUser ? (
              <div className="flex flex-col h-full">
                <div className="mb-4 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold mb-2">Permissions for {selectedUser.full_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {isSubmitted 
                          ? "Showing only visible modules for this user" 
                          : "Control module visibility and permissions for this user"
                        }
                      </p>
                    </div>
                    {hasChanges && !isSubmitted && (
                      <Button onClick={handleSubmit} disabled={isUpdating} className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    )}
                    {isSubmitted && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Check className="h-3 w-3" />
                        Saved
                      </Badge>
                    )}
                  </div>
                </div>
                
                {isLoadingPermissions ? (
                  <div className="flex items-center justify-center flex-1">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                      <p className="text-muted-foreground">Loading permissions...</p>
                    </div>
                  </div>
                ) : (
                  <ScrollArea className="flex-1">
                    <div className="space-y-3 pr-4">
                      {(isSubmitted ? getVisibleModules() : modules).map((module) => {
                        const permission = getModulePermission(module.id);
                        return (
                          <div
                            key={module.id}
                            className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <span className="text-lg">{module.emoji}</span>
                                <div>
                                  <div className="font-medium">{module.label}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Module ID: {module.id}
                                  </div>
                                </div>
                              </div>
                              
                              {!isSubmitted && (
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant={permission.visible ? "default" : "outline"}
                                    size="sm"
                                    onClick={() => toggleModuleVisibility(module.id)}
                                    className="flex items-center gap-2"
                                  >
                                    {permission.visible ? (
                                      <>
                                        <Eye className="h-4 w-4" />
                                        Visible
                                      </>
                                    ) : (
                                      <>
                                        <EyeOff className="h-4 w-4" />
                                        Hidden
                                      </>
                                    )}
                                  </Button>
                                </div>
                              )}
                              
                              {isSubmitted && (
                                <Badge variant="default" className="text-xs">
                                  Visible
                                </Badge>
                              )}
                            </div>
                            
                            {permission.visible && !isSubmitted && (
                              <div className="space-y-3">
                                <div className="text-sm text-muted-foreground">
                                  Module Permissions:
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                  {permissionTypes.map((permType) => {
                                    const isEnabled = permission[permType.id as keyof ModulePermission] as boolean;
                                    return (
                                      <Button
                                        key={permType.id}
                                        variant={isEnabled ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => togglePermission(module.id, permType.id)}
                                        className="flex items-center gap-2 justify-start"
                                      >
                                        <span>{permType.icon}</span>
                                        {permType.label}
                                      </Button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
                            
                            {permission.visible && isSubmitted && (
                              <div className="space-y-2">
                                <div className="text-sm text-muted-foreground">
                                  Active Permissions:
                                </div>
                                <div className="flex flex-wrap gap-1">
                                  {permissionTypes.map((permType) => {
                                    const isEnabled = permission[permType.id as keyof ModulePermission] as boolean;
                                    if (isEnabled) {
                                      return (
                                        <Badge key={permType.id} variant="secondary" className="text-xs">
                                          {permType.label}
                                        </Badge>
                                      );
                                    }
                                    return null;
                                  })}
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <UserIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Select a user to manage their permissions</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 