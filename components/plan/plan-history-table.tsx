"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DataTable, Column } from "../ui/data-table";
import { PlannedExpenseItem } from "../../lib/types";
import { Badge } from "../ui/badge";
import { TrendingUp, TrendingDown } from "lucide-react";

interface PlanHistoryTableProps {
  plannedItems: PlannedExpenseItem[];
  loading?: boolean;
}

export function PlanHistoryTable({ plannedItems, loading }: PlanHistoryTableProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  const getVarianceColor = (variance: number) => {
    return variance > 0 ? 'text-destructive' : 'text-green-600';
  };

  const getVarianceIcon = (variance: number) => {
    return variance > 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />;
  };

  const getVarianceBadge = (variance: number, percentage: number) => {
    const color = variance > 0 ? 'destructive' : 'default';
    const icon = getVarianceIcon(variance);
    const text = formatPercentage(percentage);
    
    return (
      <Badge variant={color} className="flex items-center gap-1">
        {icon}
        {text}
      </Badge>
    );
  };

  const columns: Column<PlannedExpenseItem>[] = [
    {
      key: 'category',
      header: 'Category',
      accessorKey: 'category',
      sortable: true,
      filterable: true,
      cell: (item) => (
        <div className="font-medium">{item.category}</div>
      ),
    },
    {
      key: 'planned_amount',
      header: 'Planned Amount',
      accessorKey: 'planned_amount',
      sortable: true,
      cell: (item) => (
        <div className="font-medium">{formatCurrency(item.planned_amount)}</div>
      ),
    },
    {
      key: 'actual_paid',
      header: 'Actual Paid',
      accessorKey: 'actual_paid',
      sortable: true,
      cell: (item) => (
        <div className="font-medium">{formatCurrency(item.actual_paid || 0)}</div>
      ),
    },
    {
      key: 'variance',
      header: 'Variance',
      accessorKey: 'variance',
      sortable: true,
      cell: (item) => {
        const variance = item.variance || 0;
        const percentage = item.planned_amount > 0 
          ? ((variance / item.planned_amount) * 100)
          : 0;
        
        return (
          <div className="flex items-center gap-2">
            <span className={`font-medium ${getVarianceColor(variance)}`}>
              {formatCurrency(Math.abs(variance))}
            </span>
            {getVarianceBadge(variance, percentage)}
          </div>
        );
      },
    },
    {
      key: 'description',
      header: 'Description',
      accessorKey: 'description',
      cell: (item) => (
        <div className="text-sm text-muted-foreground max-w-[200px] truncate">
          {item.description || 'No description'}
        </div>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Plan History</CardTitle>
      </CardHeader>
      <CardContent>
        <DataTable
          data={plannedItems}
          columns={columns}
          searchable={true}
          filterable={true}
          sortable={true}
          pagination={true}
          pageSize={10}
          loading={loading}
          emptyMessage="No planned expense items found"
          className="w-full"
        />
      </CardContent>
    </Card>
  );
} 