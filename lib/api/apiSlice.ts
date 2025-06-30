import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Task, CreateTaskInput, User } from '../types';
import { PermissionsPayload } from '../modules';

// Define the base query with authentication
const baseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    
    // Add authentication token from cookies if available
    if (typeof window !== 'undefined') {
      // Try to get token from cookies first, then localStorage as fallback
      const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return null;
      };
      
      const token = getCookie('access_token') || localStorage.getItem('access_token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }
    
    return headers;
  },
});

// Create the API slice
export const api = createApi({
  reducerPath: 'api',
  baseQuery,
  tagTypes: ['Task', 'User', 'Permissions'],
  endpoints: (builder) => ({
    // Task endpoints
    getTasks: builder.query<Task[], string>({
      query: (email) => `/proxy/list?email=${encodeURIComponent(email)}`,
      transformResponse: (response: unknown) => {
        // Handle different response structures
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data: unknown }).data)) {
          return (response as { data: Task[] }).data;
        }
        if (response && typeof response === 'object' && 'tasks' in response && Array.isArray((response as { tasks: unknown }).tasks)) {
          return (response as { tasks: Task[] }).tasks;
        }
        // If response is not an array, return empty array
        return [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Task' as const, id })),
              { type: 'Task', id: 'LIST' },
            ]
          : [{ type: 'Task', id: 'LIST' }],
    }),

    getTask: builder.query<Task, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (result, error, id) => [{ type: 'Task', id }],
    }),

    createTask: builder.mutation<Task, CreateTaskInput>({
      query: (task) => ({
        url: '/proxy/create',
        method: 'POST',
        body: task,
      }),
      invalidatesTags: [{ type: 'Task' }],
      // Optimistic update for immediate UI feedback
      async onQueryStarted(task, { dispatch, queryFulfilled }) {
        // Optimistically add the task to the cache
        const patchResult = dispatch(
          api.util.updateQueryData('getTasks', task.email, (draft) => {
            const newTask: Task = {
              id: `temp-${Date.now()}`, // Temporary ID
              collectionId: '',
              collectionName: '',
              title: task.title,
              description: task.description,
              email: task.email,
              is_done: task.is_done || false,
              progress: task.progress || 0,
              status: task.status || 'backlog', // Include status field
              deadline: task.deadline,
              created: new Date().toISOString(),
              updated: new Date().toISOString(),
              completed_at: task.completed_at,
            };
            draft.unshift(newTask); // Add to beginning of list
          })
        );
        
        try {
          await queryFulfilled;
        } catch {
          // If the mutation fails, undo the optimistic update
          patchResult.undo();
        }
      },
    }),

    updateTask: builder.mutation<Task, { id: string; task: Partial<Task> }>({
      query: ({ id, task }) => ({
        url: '/proxy/update',
        method: 'PUT',
        body: { id, ...task },
      }),
      invalidatesTags: [{ type: 'Task' }],
      // Optimistic update for immediate UI feedback
      async onQueryStarted({ id, task }, { dispatch, queryFulfilled }) {
        // Optimistically update the task in the cache
                  const patchResult = dispatch(
            api.util.updateQueryData('getTasks', task.email || '', (draft) => {
              const taskIndex = draft.findIndex(t => t.id === id);
              if (taskIndex !== -1) {
                draft[taskIndex] = { ...draft[taskIndex], ...task };
              }
            })
          );
          
          try {
            await queryFulfilled;
          } catch {
            // If the mutation fails, undo the optimistic update
            patchResult.undo();
          }
      },
    }),

    deleteTask: builder.mutation<
      { statusCode: number; message: string; data: { id: string } },
      { id: string; email: string }
    >({
      query: ({ id }) => ({
        url: '/proxy/delete',
        method: 'DELETE',
        body: { id },
      }),
      invalidatesTags: [{ type: 'Task' }],
      // Optimistic update for immediate UI feedback
      async onQueryStarted({ id, email }, { dispatch, queryFulfilled }) {
        // Optimistically remove the task from the specific user's task list
                  const patchResult = dispatch(
            api.util.updateQueryData('getTasks', email, (draft) => {
              const index = draft.findIndex(task => task.id === id);
              if (index !== -1) {
                draft.splice(index, 1);
              }
            })
          );
          
          try {
            await queryFulfilled;
          } catch {
            // If the mutation fails, undo the optimistic update
            patchResult.undo();
          }
      },
    }),

    // User endpoints
    getUsers: builder.query<User[], void>({
      query: () => '/users',
      transformResponse: (response: unknown) => {
        // Handle different response structures
        if (Array.isArray(response)) {
          return response;
        }
        if (response && typeof response === 'object' && 'data' in response && Array.isArray((response as { data: unknown }).data)) {
          return (response as { data: User[] }).data;
        }
        if (response && typeof response === 'object' && 'users' in response && Array.isArray((response as { users: unknown }).users)) {
          return (response as { users: User[] }).users;
        }
        // If response is not an array, return empty array
        return [];
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    getUser: builder.query<User, string>({
      query: (id) => {
        const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN;
        if (!authDomain) {
          throw new Error('NEXT_PUBLIC_AUTH_DOMAIN environment variable is not configured');
        }
        return {
          url: `${authDomain}/user/profiles/${id}`,
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      providesTags: (result, error, id) => [{ type: 'User', id }],
    }),

    updateUser: builder.mutation<User, { id: string; userData: Partial<User> }>({
      query: ({ id, userData }) => {
        const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN;
        if (!authDomain) {
          throw new Error('NEXT_PUBLIC_AUTH_DOMAIN environment variable is not configured');
        }
        return {
          url: `${authDomain}/user/profiles/${id}`,
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: userData,
        };
      },
      invalidatesTags: (result, error, { id }) => [
        { type: 'User', id },
        { type: 'User', id: 'LIST' },
      ],
    }),

    deleteUser: builder.mutation<
      { statusCode: number; message: string },
      string
    >({
      query: (id) => {
        const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN;
        if (!authDomain) {
          throw new Error('NEXT_PUBLIC_AUTH_DOMAIN environment variable is not configured');
        }
        return {
          url: `${authDomain}/user/profiles/${id}`,
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        };
      },
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // Permissions endpoints
    submitUserPermissions: builder.mutation<
      {
        statusCode: number;
        message: string;
        data: {
          id: string;
          email: string;
          modules: { [key: string]: boolean };
          permissions: {
            [key: string]: {
              view: boolean;
              edit: boolean;
              delete: boolean;
              export: boolean;
              import: boolean;
            };
          };
          updated_by: string;
          created: string;
          updated: string;
        };
      },
      PermissionsPayload
    >({
      query: (payload) => ({
        url: '/proxy/perm',
        method: 'POST',
        body: payload,
      }),
      invalidatesTags: [{ type: 'Permissions', id: 'LIST' }],
    }),

    getUserPermissions: builder.query<
      {
        statusCode: number;
        message: string;
        data: {
          collectionId: string;
          collectionName: string;
          created: string;
          email: string;
          id: string;
          modules: { [key: string]: boolean };
          permissions: {
            [key: string]: {
              view: boolean;
              edit: boolean;
              delete: boolean;
              export: boolean;
              import: boolean;
            };
          };
          updated: string;
          updated_by: string;
        };
        source: string;
      },
      string
    >({
      query: (email) => {
        if (!email || email.trim() === '') {
          throw new Error('Email is required for fetching user permissions');
        }
        return `/proxy/perm?email=${encodeURIComponent(email)}`;
      },
      providesTags: (result, error, email) => [{ type: 'Permissions', id: email }],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Task hooks
  useGetTasksQuery,
  useGetTaskQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  
  // User hooks
  useGetUsersQuery,
  useGetUserQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
  
  // Permissions hooks
  useSubmitUserPermissionsMutation,
  useGetUserPermissionsQuery,
} = api; 