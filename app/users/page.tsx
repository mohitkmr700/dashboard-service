"use client"

import { useState, useEffect, useCallback } from 'react';
import { DataTable, Column, Action } from '../../components/ui/data-table';
import { User } from '../../lib/types';
import { deleteUser } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Edit, Trash2, Eye, User as UserIcon, Shield } from 'lucide-react';
import { useToast } from '../../components/ui/use-toast';
import { format, parseISO } from 'date-fns';
import { useToken } from '../../lib/token-context';
import { UserPermissionsDialog } from '../../components/users/user-permissions-dialog';

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { token, isLoading: tokenLoading, error: tokenError } = useToken();
  // const [roleFilter, setRoleFilter] = useState<string>('');
  // const [dateRange, setDateRange] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Debug: Check if token is available
      console.log('Token available:', !!token);
      
      const response = await fetch('/api/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result = await response.json();
      const usersArray = result.data || [];
      setUsers(usersArray);
    } catch (err) {
      console.error('Error fetching users:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users. Please try again.';
      setError(errorMessage);
      toast({
        title: "Error",
        description: `Failed to fetch users: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (!tokenLoading && token) {
      fetchUsers();
    }
  }, [token, tokenLoading, fetchUsers]);

  const handleDeleteUser = async (user: User) => {
    try {
      await deleteUser(user.id);
      setUsers(prevUsers => prevUsers.filter(u => u.id !== user.id));
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

  const handleEditUser = (user: User) => {
    // TODO: Implement edit user functionality
    toast({
      title: "Info",
      description: `Edit user: ${user.full_name}`,
    });
  };

  const handleViewUser = (user: User) => {
    // TODO: Implement view user functionality
    toast({
      title: "Info",
      description: `View user: ${user.full_name}`,
    });
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

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Admin' },
      punisher: { color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Punisher' },
      user: { color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'User' },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;
    
    return (
      <Badge className={`${config.color} border text-xs px-2 py-1`}>
        {config.label}
      </Badge>
    );
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
      key: 'role',
      header: 'Role',
      accessorKey: 'role',
      cell: (user) => getRoleBadge(user.role),
      align: 'center',
    },
    {
      key: 'status',
      header: 'Status',
      cell: (user) => (
        <Badge 
          variant={user.is_active ? "default" : "secondary"}
          className="text-xs"
        >
          {user.is_active ? 'Active' : 'Inactive'}
        </Badge>
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

  if (tokenLoading) {
    return (
      <div className="space-y-4 p-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading token...</p>
          </div>
        </div>
      </div>
    );
  }

  if (tokenError) {
    return (
      <div className="space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive mb-4">Token Error: {tokenError}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4 p-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Users</h1>
        </div>
        <div className="text-center py-8">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={fetchUsers}>Retry</Button>
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
          />
          <Button onClick={fetchUsers} disabled={loading}>
            Refresh
          </Button>
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-muted-foreground">
          Manage your users and their permissions here.
        </p>
        <DataTable
          data={filteredUsers}
          columns={columns}
          actions={actions}
          loading={loading}
          searchable={true}
          sortable={true}
          pagination={true}
          pageSize={10}
          emptyMessage="No users found"
        />
      </div>
    </div>
  );
} 