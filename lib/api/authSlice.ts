import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define the base query for auth endpoints
const authBaseQuery = fetchBaseQuery({
  baseUrl: '/api/auth',
  prepareHeaders: (headers) => {
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

// Create the auth API slice
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: authBaseQuery,
  tagTypes: ['Auth'],
  endpoints: (builder) => ({
    // Get token
    getToken: builder.query<{ token: string }, void>({
      query: () => '/token',
      providesTags: ['Auth'],
    }),

    // Login
    login: builder.mutation<
      { token: string; user: { email: string; full_name: string; profile_picture?: string } },
      { email: string; password: string }
    >({
      query: (credentials) => ({
        url: '/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Logout
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  useGetTokenQuery,
  useLoginMutation,
  useLogoutMutation,
} = authApi; 