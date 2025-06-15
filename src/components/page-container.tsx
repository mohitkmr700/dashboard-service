'use client';

interface PageContainerProps {
  children: React.ReactNode;
  title: string;
  actions?: React.ReactNode;
}

export function PageContainer({ children, title, actions }: PageContainerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        {actions}
      </div>
      {children}
    </div>
  );
} 