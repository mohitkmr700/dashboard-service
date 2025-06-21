# Dashboard Service

A modern task management dashboard built with Next.js, featuring dynamic data tables, centralized authentication, and a comprehensive user management system.

## 🚀 Features

- **Dynamic Data Tables**: Reusable, feature-rich table component with search, sorting, and pagination
- **Centralized Authentication**: Token management system with automatic persistence
- **User Management**: Complete CRUD operations for users with role-based access
- **Task Management**: Full task lifecycle management with progress tracking
- **Modern UI**: Built with Tailwind CSS and shadcn/ui components
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Mobile-friendly interface

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: shadcn/ui
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Charts**: Recharts
- **Authentication**: Custom token-based system

## 📦 Installation

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
   NEXT_PUBLIC_AUTH_DOMAIN=https://auth-service.algoarena.co.in
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
dashboard-service/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── token/         # Token management
│   │   ├── users/         # User API proxy
│   │   └── proxy/         # Task API proxy
│   ├── dashboard/         # Main dashboard
│   ├── users/             # User management
│   ├── login/             # Authentication
│   └── layout.tsx         # Root layout
├── components/            # Reusable components
│   ├── ui/               # Base UI components
│   │   ├── data-table.tsx # Dynamic data table
│   │   └── ...           # Other UI components
│   └── ...               # Feature components
├── lib/                  # Utilities and configurations
│   ├── api.ts            # API functions
│   ├── auth.ts           # Legacy auth utilities
│   ├── token-context.tsx # Centralized token management
│   └── types.ts          # TypeScript definitions
└── public/               # Static assets
```

## 🔐 Authentication System

The application uses a centralized token management system:

### Token Provider
- Automatically fetches and caches authentication tokens
- Provides tokens to all components via React Context
- Handles token persistence in localStorage
- Manages loading and error states

### Usage in Components
```tsx
import { useToken } from '../lib/token-context';

function MyComponent() {
  const { token, isLoading, error, refreshToken } = useToken();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  // Use token for API calls
}
```

### Usage in API Functions
```tsx
import { getStoredToken } from '../lib/token-context';

const token = getStoredToken();
// Use token in API calls
```

## 📊 Dynamic Data Table Component

A powerful, reusable table component that can handle any data structure with extensive customization options.

### Features
- ✅ **Dynamic Columns**: Define columns based on your data structure
- ✅ **Search**: Built-in search functionality across all columns
- ✅ **Sorting**: Sortable columns with visual indicators
- ✅ **Pagination**: Configurable pagination with page size options
- ✅ **Actions**: Dropdown menu with custom actions for each row
- ✅ **Loading States**: Built-in loading spinner
- ✅ **Empty States**: Customizable empty state messages
- ✅ **Responsive**: Mobile-friendly design
- ✅ **TypeScript**: Full TypeScript support with generics

### Basic Usage

```tsx
import { DataTable, Column, Action } from '@/components/ui/data-table';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: Column<User>[] = [
  {
    key: 'name',
    header: 'Name',
    accessorKey: 'name',
  },
  {
    key: 'email',
    header: 'Email',
    accessorKey: 'email',
  },
  {
    key: 'role',
    header: 'Role',
    accessorKey: 'role',
  },
];

const actions: Action<User>[] = [
  {
    label: 'Edit',
    onClick: (user) => console.log('Edit user:', user.name),
  },
  {
    label: 'Delete',
    onClick: (user) => console.log('Delete user:', user.name),
    variant: 'destructive',
  },
];

function MyComponent() {
  const users: User[] = [
    { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin' },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
  ];

  return (
    <DataTable
      data={users}
      columns={columns}
      actions={actions}
      searchable={true}
      sortable={true}
      pagination={true}
      pageSize={10}
    />
  );
}
```

### Column Configuration

#### Basic Column
```tsx
{
  key: 'name',
  header: 'Name',
  accessorKey: 'name',
}
```

#### Column with Custom Cell Renderer
```tsx
{
  key: 'status',
  header: 'Status',
  cell: (user) => (
    <Badge variant={user.isActive ? "default" : "secondary"}>
      {user.isActive ? 'Active' : 'Inactive'}
    </Badge>
  ),
}
```

#### Column with Alignment
```tsx
{
  key: 'price',
  header: 'Price',
  accessorKey: 'price',
  align: 'right', // 'left' | 'center' | 'right'
}
```

### Action Configuration

#### Basic Action
```tsx
{
  label: 'View',
  onClick: (item) => console.log('View item:', item),
}
```

#### Action with Icon
```tsx
import { Eye, Edit, Trash2 } from 'lucide-react';

{
  label: 'View',
  icon: <Eye className="h-4 w-4" />,
  onClick: (item) => console.log('View item:', item),
}
```

#### Destructive Action
```tsx
{
  label: 'Delete',
  icon: <Trash2 className="h-4 w-4" />,
  onClick: (item) => console.log('Delete item:', item),
  variant: 'destructive',
}
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | - | Array of data items |
| `columns` | `Column<T>[]` | - | Column definitions |
| `actions` | `Action<T>[]` | `[]` | Row actions |
| `searchable` | `boolean` | `true` | Enable search functionality |
| `sortable` | `boolean` | `true` | Enable sorting |
| `pagination` | `boolean` | `true` | Enable pagination |
| `pageSize` | `number` | `10` | Items per page |
| `pageSizeOptions` | `number[]` | `[5, 10, 20, 50]` | Available page sizes |
| `loading` | `boolean` | `false` | Show loading state |
| `emptyMessage` | `string` | `"No data available"` | Message when no data |
| `className` | `string` | - | Additional CSS classes |
| `onRowClick` | `(item: T) => void` | - | Row click handler |
| `selectable` | `boolean` | `false` | Enable row selection |
| `onSelectionChange` | `(items: T[]) => void` | - | Selection change handler |

## 🔧 API Integration

### User Management
The application integrates with an external auth service for user management:

```tsx
import { getUsers, deleteUser, updateUser } from '../lib/api';

// Fetch all users
const users = await getUsers();

// Delete a user
await deleteUser(userId);

// Update a user
await updateUser(userId, { full_name: 'New Name' });
```

### Task Management
Tasks are managed through a proxy API:

```tsx
import { getTasks, createTask, updateTask, deleteTask } from '../lib/api';

// Fetch tasks for a user
const tasks = await getTasks(userEmail);

// Create a new task
const newTask = await createTask(taskData);

// Update a task
await updateTask(taskId, updates);

// Delete a task
await deleteTask(taskId);
```

## 🎨 Styling

The application uses Tailwind CSS with a custom design system:

- **Colors**: Consistent color palette with dark/light mode support
- **Typography**: Inter font family with proper hierarchy
- **Components**: shadcn/ui components for consistency
- **Responsive**: Mobile-first design approach

## ♿ Accessibility

The application follows accessibility best practices:

- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- Color contrast compliance

## 🚀 Performance

Optimizations include:

- **Memoization**: React.memo and useMemo for expensive operations
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js Image component
- **Bundle Analysis**: Optimized bundle sizes
- **Caching**: Efficient data caching strategies

## 📝 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Type checking
npm run type-check   # Check TypeScript types
```

## 🌐 Environment Variables

Create a `.env.local` file with the following variables:

```env
# Authentication
NEXT_PUBLIC_AUTH_DOMAIN=https://auth-service.algoarena.co.in

# Database (if applicable)
DATABASE_URL=your_database_url

# API Keys (if applicable)
API_KEY=your_api_key
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation in the `/docs` folder
- Review the component examples in the codebase

---

Built with ❤️ using Next.js and modern web technologies.
