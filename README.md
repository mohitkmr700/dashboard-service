# Task Management Dashboard

A modern, full-stack task management dashboard built with Next.js 14, TypeScript, Tailwind CSS, and RTK Query. Features real-time task management, user permissions, analytics, and a responsive design.

## 🚀 Features

- **Task Management**: Create, edit, delete, and track task progress
- **User Management**: Manage users and their permissions
- **Real-time Analytics**: Task completion trends and efficiency metrics
- **Role-based Access Control**: Admin, Punisher, and User roles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Loading States**: Smooth loading experiences with shimmer effects
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Centralized State Management**: RTK Query for API state management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit, RTK Query
- **UI Components**: Radix UI, Lucide React Icons
- **Charts**: Recharts
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS with custom design system

## 📁 Project Structure

```
dashboard-service/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── users/            # Users management
│   ├── analytics/        # Analytics page
│   ├── settings/         # Settings page
│   ├── documents/        # Documents page
│   ├── messages/         # Messages page
│   └── login/            # Login page
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── tasks/           # Task-related components
│   ├── users/           # User-related components
│   └── shared/          # Shared layout components
├── lib/                 # Utilities and configurations
│   ├── api/            # RTK Query API slices
│   ├── types/          # TypeScript type definitions
│   └── contexts/       # React contexts
└── public/             # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dashboard-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   NEXT_PUBLIC_AUTH_DOMAIN=your_auth_service_url
   NEXT_PUBLIC_API_DOMAIN=your_api_service_url
   NEXT_PUBLIC_SALARY_INHAND=your_monthly_salary_amount
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 RTK Query Integration

This project uses RTK Query for efficient API state management, caching, and data synchronization.

### What is RTK Query?

RTK Query is a powerful data fetching and caching tool that provides:
- **Automatic caching** and cache invalidation
- **Loading and error states** out of the box
- **Optimistic updates** and background refetching
- **TypeScript support** with full type safety
- **Normalized cache** for efficient updates

### Project Structure

```
lib/
├── store.ts                 # Redux store configuration
├── api/
│   ├── apiSlice.ts         # Main API slice with all endpoints
│   └── authSlice.ts        # Authentication-specific endpoints
└── token-context.tsx       # Centralized token management
```

### Available API Endpoints

#### Tasks
- `useGetTasksQuery(email)` - Fetch tasks for a user
- `useCreateTaskMutation()` - Create a new task
- `useUpdateTaskMutation()` - Update an existing task
- `useDeleteTaskMutation()` - Delete a task

#### Users
- `useGetUsersQuery()` - Fetch all users
- `useDeleteUserMutation()` - Delete a user

#### Permissions
- `useGetUserPermissionsQuery(email)` - Fetch user permissions
- `useSubmitUserPermissionsMutation()` - Submit user permissions

#### Authentication
- `useLoginMutation()` - Login user
- `useLogoutMutation()` - Logout user

### Usage Examples

#### Basic Query Usage

```tsx
import { useGetTasksQuery } from '../lib/api/apiSlice';

function TaskList({ userEmail }: { userEmail: string }) {
  const { data: tasks, isLoading, error, refetch } = useGetTasksQuery(userEmail);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  return (
    <div>
      {tasks?.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

#### Mutation Usage

```tsx
import { useCreateTaskMutation } from '../lib/api/apiSlice';

function CreateTaskForm() {
  const [createTask, { isLoading, error }] = useCreateTaskMutation();

  const handleSubmit = async (taskData) => {
    try {
      const result = await createTask(taskData).unwrap();
      console.log('Task created:', result);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
```

#### Using Token Context

```tsx
import { useToken } from '../lib/token-context';

function MyComponent() {
  const { token, decodedToken, isLoading, error } = useToken();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Welcome, {decodedToken?.full_name}!</p>
      <p>Email: {decodedToken?.email}</p>
    </div>
  );
}
```

### Cache Management

RTK Query automatically manages cache invalidation using tags. When you perform mutations, related queries are automatically refetched:

```tsx
// This mutation will invalidate the 'Task' cache
const [createTask] = useCreateTaskMutation();

// This query will be automatically refetched after createTask succeeds
# Task Management Dashboard

A modern, full-stack task management dashboard built with Next.js 14, TypeScript, Tailwind CSS, and RTK Query. Features real-time task management, user permissions, analytics, and a responsive design.

## 🚀 Features

- **Task Management**: Create, edit, delete, and track task progress
- **User Management**: Manage users and their permissions
- **Real-time Analytics**: Task completion trends and efficiency metrics
- **Role-based Access Control**: Admin, Punisher, and User roles
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Theme**: Toggle between themes
- **Loading States**: Smooth loading experiences with shimmer effects
- **Optimistic Updates**: Immediate UI feedback for better UX
- **Centralized State Management**: RTK Query for API state management

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **State Management**: Redux Toolkit, RTK Query
- **UI Components**: Radix UI, Lucide React Icons
- **Charts**: Recharts
- **Authentication**: JWT with HTTP-only cookies
- **Styling**: Tailwind CSS with custom design system

## 📁 Project Structure

```
dashboard-service/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard page
│   ├── users/            # Users management
│   ├── analytics/        # Analytics page
│   ├── settings/         # Settings page
│   ├── documents/        # Documents page
│   ├── messages/         # Messages page
│   └── login/            # Login page
├── components/           # React components
│   ├── ui/              # Reusable UI components
│   ├── tasks/           # Task-related components
│   ├── users/           # User-related components
│   └── shared/          # Shared layout components
├── lib/                 # Utilities and configurations
│   ├── api/            # RTK Query API slices
│   ├── types/          # TypeScript type definitions
│   └── contexts/       # React contexts
└── public/             # Static assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd dashboard-service
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   NEXT_PUBLIC_AUTH_DOMAIN=http://localhost:3301
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 RTK Query Integration

This project uses RTK Query for efficient API state management, caching, and data synchronization.

### What is RTK Query?

RTK Query is a powerful data fetching and caching tool that provides:
- **Automatic caching** and cache invalidation
- **Loading and error states** out of the box
- **Optimistic updates** and background refetching
- **TypeScript support** with full type safety
- **Normalized cache** for efficient updates

### Project Structure

```
lib/
├── store.ts                 # Redux store configuration
├── api/
│   ├── apiSlice.ts         # Main API slice with all endpoints
│   └── authSlice.ts        # Authentication-specific endpoints
└── token-context.tsx       # Centralized token management
```

### Available API Endpoints

#### Tasks
- `useGetTasksQuery(email)` - Fetch tasks for a user
- `useCreateTaskMutation()` - Create a new task
- `useUpdateTaskMutation()` - Update an existing task
- `useDeleteTaskMutation()` - Delete a task

#### Users
- `useGetUsersQuery()` - Fetch all users
- `useDeleteUserMutation()` - Delete a user

#### Permissions
- `useGetUserPermissionsQuery(email)` - Fetch user permissions
- `useSubmitUserPermissionsMutation()` - Submit user permissions

#### Authentication
- `useLoginMutation()` - Login user
- `useLogoutMutation()` - Logout user

### Usage Examples

#### Basic Query Usage

```tsx
import { useGetTasksQuery } from '../lib/api/apiSlice';

function TaskList({ userEmail }: { userEmail: string }) {
  const { data: tasks, isLoading, error, refetch } = useGetTasksQuery(userEmail);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading tasks</div>;

  return (
    <div>
      {tasks?.map(task => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
}
```

#### Mutation Usage

```tsx
import { useCreateTaskMutation } from '../lib/api/apiSlice';

function CreateTaskForm() {
  const [createTask, { isLoading, error }] = useCreateTaskMutation();

  const handleSubmit = async (taskData) => {
    try {
      const result = await createTask(taskData).unwrap();
      console.log('Task created:', result);
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Task'}
      </button>
    </form>
  );
}
```

#### Using Token Context

```tsx
import { useToken } from '../lib/token-context';

function MyComponent() {
  const { token, decodedToken, isLoading, error } = useToken();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <p>Welcome, {decodedToken?.full_name}!</p>
      <p>Email: {decodedToken?.email}</p>
    </div>
  );
}
```

### Cache Management

RTK Query automatically manages cache invalidation using tags. When you perform mutations, related queries are automatically refetched:

```tsx
// This mutation will invalidate the 'Task' cache
const [createTask] = useCreateTaskMutation();

// This query will be automatically refetched after createTask succeeds
const { data: tasks } = useGetTasksQuery(userEmail);
```

### Error Handling

```tsx
const { data, error, isLoading } = useGetTasksQuery(userEmail);

if (error) {
  if ('status' in error) {
    console.error('HTTP Error:', error.status);
  } else {
    console.error('Network Error:', error.message);
  }
}
```

### Conditional Queries

Skip queries based on conditions:

```tsx
const { data: user } = useGetUserQuery(userId, {
  skip: !userId, // Skip if no userId
});
```

## 🛣️ Adding New Routes and Pages

### 1. Create a New Page

Create a new directory in `app/` with a `page.tsx` file:

```bash
mkdir app/new-feature
touch app/new-feature/page.tsx
```

### 2. Basic Page Structure

```tsx
"use client";

import { PageContainer } from "../../components/page-container";
import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";

export default function NewFeaturePage() {
  return (
    <PageContainer title="New Feature">
      <Card>
        <CardHeader>
          <CardTitle>New Feature</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Your content here</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
```

### 3. Add Layout (Optional)

If you need a sidebar, create a `layout.tsx`:

```tsx
import { SharedLayout } from "../../components/shared-layout";

export default function NewFeatureLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SharedLayout>{children}</SharedLayout>;
}
```

### 4. Add to Navigation

Update `lib/modules.ts` to add the new route to the sidebar:

```tsx
export const modules = [
  // ... existing modules
  {
    id: 'new-feature',
    label: 'New Feature',
    href: '/new-feature',
    icon: YourIcon, // Import from lucide-react
  },
];
```

## 🔧 Adding New API Endpoints

### 1. Add to API Slice

In `lib/api/apiSlice.ts`, add your new endpoint:

```tsx
// Query endpoint
getNewData: builder.query<NewDataType[], void>({
  query: () => '/api/new-data',
  providesTags: ['NewData'],
}),

// Mutation endpoint
createNewData: builder.mutation<NewDataType, CreateNewDataInput>({
  query: (data) => ({
    url: '/api/new-data',
    method: 'POST',
    body: data,
  }),
  invalidatesTags: ['NewData'],
}),
```

### 2. Create API Route

Create `app/api/new-data/route.ts`:

```tsx
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Your logic here
    const data = await fetchData();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // Your logic here
    const result = await createData(body);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create data' },
      { status: 500 }
    );
  }
}
```

### 3. Use in Components

```tsx
import { useGetNewDataQuery, useCreateNewDataMutation } from '../lib/api/apiSlice';

function NewDataComponent() {
  const { data, isLoading } = useGetNewDataQuery();
  const [createData] = useCreateNewDataMutation();

  const handleCreate = async (newData) => {
    try {
      await createData(newData).unwrap();
    } catch (error) {
      console.error('Failed to create:', error);
    }
  };

  // Your component logic
}
```

## 🎨 UI Components

The project uses a custom design system built with Radix UI and Tailwind CSS. All components are in `components/ui/`.

### Available Components

- **Button**: Various button styles and variants
- **Card**: Container components with header and content
- **Dialog**: Modal dialogs and popovers
- **Input**: Form inputs with validation states
- **DataTable**: Sortable, searchable data tables
- **Badge**: Status indicators and labels
- **Avatar**: User profile pictures with fallbacks
- **Progress**: Progress bars and indicators
- **Toast**: Notification system

### Using Components

```tsx
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Card</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="default">Click me</Button>
      </CardContent>
    </Card>
  );
}
```

## 🔐 Authentication

The project uses JWT authentication with HTTP-only cookies for security.

### Login Flow

1. User submits credentials
2. Server validates and returns JWT token
3. Token is stored in HTTP-only cookie
4. Token is decoded and stored in context
5. User is redirected to dashboard

### Token Management

- **Centralized**: All token operations go through `TokenProvider`
- **Memoized**: Token API calls are cached to prevent duplicates
- **Automatic**: Token refresh and validation happen automatically
- **Secure**: Tokens are stored in HTTP-only cookies

## 🎯 Best Practices

### 1. Component Structure
- Use TypeScript for all components
- Implement proper loading and error states
- Use shimmer components for loading UX
- Follow the established naming conventions

### 2. State Management
- Use RTK Query for all API calls
- Use React Context for global state
- Implement optimistic updates where appropriate
- Handle errors gracefully

### 3. Performance
- Use React.memo for expensive components
- Implement proper dependency arrays in useEffect
- Use the skip option in RTK Query to avoid unnecessary calls
- Optimize bundle size with dynamic imports

### 4. Code Organization
- Keep components small and focused
- Use proper TypeScript types
- Follow the established folder structure
- Document complex logic with comments

## 🐛 Troubleshooting

### Common Issues

1. **Token not loading**: Check if `TokenProvider` wraps your app
2. **API calls failing**: Verify environment variables are set
3. **Styling issues**: Ensure Tailwind CSS is properly configured
4. **Type errors**: Check TypeScript types and imports

### Debugging

- Use Redux DevTools to inspect RTK Query cache
- Check browser network tab for API calls
- Use React DevTools for component debugging
- Check console for error messages

## 📝 Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server

# Linting and Formatting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues

# Type Checking
npm run type-check   # Run TypeScript compiler
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the documentation above
- Review the code examples
- Open an issue on GitHub
- Contact the development team

---

Built with ❤️ using Next.js, TypeScript, and RTK Query
