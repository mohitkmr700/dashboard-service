"use client"

import { useGetUsersQuery, useDeleteUserMutation } from '../../lib/api/apiSlice';
import { UsersShimmer } from '../../components/users-shimmer';
import { UserPermissionsDialog } from '../../components/users/user-permissions-dialog';
import { Button } from '../../components/ui/button';
import { useToast } from '../../components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { useCallback, useState } from 'react';
import { User } from '../../lib/types';
import { Edit, Eye, User as UserIcon, Shield, Trash2 } from 'lucide-react';
import { DataTable, Column, Action } from '../../components/ui/data-table';
import { ViewUserPermissionsDialog } from '../../components/users/view-user-permissions-dialog';
import { EditUserPermissionsDialog } from '../../components/users/edit-user-permissions-dialog';

export default function UsersPage() {
  const { toast } = useToast();
  const [selectedUserForView, setSelectedUserForView] = useState<User | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<User | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // RTK Query hooks
  const { data: users = [], isLoading, error, refetch } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  // Handle permissions update for sidebar control
  const handlePermissionsUpdate = useCallback((userEmail: string, visibleModuleIds: string[]) => {
    // Store visible modules in localStorage for persistence
    localStorage.setItem('visibleModules', JSON.stringify(visibleModuleIds));
    
    // You can also dispatch a custom event to notify other components
    window.dispatchEvent(new CustomEvent('permissionsUpdated', {
      detail: { userEmail, visibleModules: visibleModuleIds }
    }));
  }, []);

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteUser(user.id).unwrap();
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (err) {
      console.error('Error deleting user:', err);
      toast({
        title: "Error",
        description: "Failed to delete user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUserForView(user);
    setViewDialogOpen(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUserForEdit(user);
    setEditDialogOpen(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    try {
      const date = parseISO(dateString);
      return format(date, 'MMM d, yyyy');
    } catch {
      return 'Invalid date';
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'name',
      header: 'Name',
      accessorKey: 'full_name',
      cell: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
            <UserIcon className="h-4 w-4" />
          </div>
          <div>
            <div className="font-medium">{user.full_name}</div>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => (
        <span className="text-xs">
          {user.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
      align: 'center',
    },
    {
      key: 'created',
      header: 'Created At',
      accessorKey: 'created_at',
      cell: (user) => formatDate(user.created_at),
      align: 'center',
    },
  ];

  const actions: Action<User>[] = [
    {
      label: 'View',
      icon: <Eye className="h-4 w-4" />,
      onClick: handleViewUser,
    },
    {
      label: 'Edit',
      icon: <Edit className="h-4 w-4" />,
      onClick: handleEditUser,
    },
    {
      label: 'Delete',
      icon: <Trash2 className="h-4 w-4" />,
      onClick: handleDeleteUser,
      variant: 'destructive',
    },
  ];

  // Filtered users based on role and created_at
  const filteredUsers = users;

  if (isLoading) {
    return <UsersShimmer />;
  }

  if (error) {
    return (
      <div className="space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Failed to fetch users</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Users</h1>
        <div className="flex gap-2">
          <UserPermissionsDialog 
            users={filteredUsers}
            trigger={
              <Button variant="outline" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Manage Permissions
              </Button>
            }
            onPermissionsUpdate={handlePermissionsUpdate}
          />
          <Button onClick={() => refetch()} disabled={isLoading}>
            Refresh
          </Button>
        </div>
      </div>

      <DataTable
        data={filteredUsers}
        columns={columns}
        actions={actions}
        searchable={true}
        sortable={true}
        pagination={true}
        pageSize={10}
        emptyMessage="No users found"
      />

      {/* View User Permissions Dialog */}
      {selectedUserForView && (
        <ViewUserPermissionsDialog
          user={selectedUserForView}
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
        />
      )}

      {/* Edit User Permissions Dialog */}
      {selectedUserForEdit && (
        <EditUserPermissionsDialog
          user={selectedUserForEdit}
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          onPermissionsUpdate={handlePermissionsUpdate}
        />
      )}
    </div>
  );
} 