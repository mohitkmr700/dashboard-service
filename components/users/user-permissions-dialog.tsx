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

interface UserPermissionsDialogProps {
  users: User[];
  trigger: React.ReactNode;
}

export function UserPermissionsDialog({ users, trigger }: UserPermissionsDialogProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions>({});
  const [originalPermissions, setOriginalPermissions] = useState<UserPermissions>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loggedInUserEmail, setLoggedInUserEmail] = useState<string>('');
  const { toast } = useToast();

  // Get logged in user email
  useEffect(() => {
    const getLoggedInUser = async () => {
      try {
        const response = await fetch('/api/auth/token');
        const data = await response.json();
        if (data.decoded?.email) {
          setLoggedInUserEmail(data.decoded.email);
        }
      } catch (error) {
        console.error('Error fetching logged in user:', error);
      }
    };
    getLoggedInUser();
  }, []);

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setIsSubmitted(false);
    // Initialize permissions for this user if not already done
    if (!permissions[user.id]) {
      const initialPermissions = modules.reduce((acc, module) => ({
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
        [user.id]: initialPermissions
      }));
      
      setOriginalPermissions(prev => ({
        ...prev,
        [user.id]: initialPermissions
      }));
      
      setHasChanges(false);
    } else {
      // Check if there are changes compared to original
      const current = permissions[user.id];
      const original = originalPermissions[user.id] || {};
      const changed = Object.keys(current).some(moduleId => {
        const currentModule = current[moduleId];
        const originalModule = original[moduleId];
        return (
          currentModule?.visible !== originalModule?.visible ||
          currentModule?.view !== originalModule?.view ||
          currentModule?.edit !== originalModule?.edit ||
          currentModule?.delete !== originalModule?.delete ||
          currentModule?.export !== originalModule?.export ||
          currentModule?.import !== originalModule?.import
        );
      });
      setHasChanges(changed);
    }
  };

  const toggleModuleVisibility = (moduleId: string) => {
    if (!selectedUser) return;
    
    const newPermissions = {
      ...permissions,
      [selectedUser.id]: {
        ...permissions[selectedUser.id],
        [moduleId]: {
          ...permissions[selectedUser.id][moduleId],
          visible: !permissions[selectedUser.id][moduleId]?.visible
        }
      }
    };
    
    setPermissions(newPermissions);
    checkForChanges(newPermissions);
  };

  const togglePermission = (moduleId: string, permissionType: string) => {
    if (!selectedUser) return;
    
    const newPermissions = {
      ...permissions,
      [selectedUser.id]: {
        ...permissions[selectedUser.id],
        [moduleId]: {
          ...permissions[selectedUser.id][moduleId],
          [permissionType]: !permissions[selectedUser.id][moduleId]?.[permissionType as keyof ModulePermission]
        }
      }
    };
    
    setPermissions(newPermissions);
    checkForChanges(newPermissions);
  };

  const checkForChanges = (newPermissions: UserPermissions) => {
    if (!selectedUser) return;
    
    const current = newPermissions[selectedUser.id];
    const original = originalPermissions[selectedUser.id] || {};
    const changed = Object.keys(current).some(moduleId => {
      const currentModule = current[moduleId];
      const originalModule = original[moduleId];
      return (
        currentModule?.visible !== originalModule?.visible ||
        currentModule?.view !== originalModule?.view ||
        currentModule?.edit !== originalModule?.edit ||
        currentModule?.delete !== originalModule?.delete ||
        currentModule?.export !== originalModule?.export ||
        currentModule?.import !== originalModule?.import
      );
    });
    setHasChanges(changed);
  };

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
    if (!selectedUser) return null;

    const userPermissions = permissions[selectedUser.id];
    if (!userPermissions) return null;

    const modulesData: { [key: string]: boolean } = {};
    const permissionsData: { [key: string]: {
      view: boolean;
      edit: boolean;
      delete: boolean;
      export: boolean;
      import: boolean;
    }} = {};

    modules.forEach(module => {
      const modulePermission = userPermissions[module.id];
      if (modulePermission) {
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
      }
    });

    return {
      email: selectedUser.email,
      modules: modulesData,
      permissions: permissionsData,
      updated_by: loggedInUserEmail
    };
  };

  const handleSubmit = () => {
    if (!selectedUser) return;
    
    const payload = createPermissionsPayload();
    console.log('Permissions Payload:', JSON.stringify(payload, null, 2));
    
    // Log the visible modules for this user
    const visibleModules = modules.filter(module => {
      const permission = getModulePermission(module.id);
      return permission.visible;
    });
    
    console.log('Visible Modules for', selectedUser.email, ':', visibleModules.map(m => m.label));
    
    // Update original permissions to current state
    setOriginalPermissions(prev => ({
      ...prev,
      [selectedUser.id]: permissions[selectedUser.id]
    }));
    
    setHasChanges(false);
    setIsSubmitted(true);
    
    toast({
      title: "Success",
      description: `Permissions updated for ${selectedUser.full_name}. Check console for payload.`,
    });
    
    // Reset submitted state after 3 seconds
    setTimeout(() => {
      setIsSubmitted(false);
    }, 3000);
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
    <Dialog>
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
                      <Button onClick={handleSubmit} className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        Save Changes
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