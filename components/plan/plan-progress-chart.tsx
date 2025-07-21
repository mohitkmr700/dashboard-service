"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { PlannedExpenseItem } from "../../lib/types";
import { AlertTriangle } from "lucide-react";

interface PlanProgressChartProps {
  plannedItems: PlannedExpenseItem[];
  totalPlanned: number;
  totalActual: number;
}

interface ChartData {
  category: string;
  planned: number;
  actual: number;
  variance: number;
  percentage: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

export function PlanProgressChart({ plannedItems, totalPlanned, totalActual }: PlanProgressChartProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  // Prepare data for bar chart
  const chartData: ChartData[] = plannedItems.map(item => ({
    category: item.category,
    planned: item.planned_amount,
    actual: item.actual_paid || 0,
    variance: item.variance || 0,
    percentage: totalPlanned > 0 ? (item.planned_amount / totalPlanned) * 100 : 0,
  }));

  // Prepare data for pie chart (planned vs actual)
  const pieData: PieData[] = [
    { name: 'Planned', value: totalPlanned, color: '#3b82f6' },
    { name: 'Actual', value: totalActual, color: '#10b981' },
  ];

  // Check for overspending categories
  const overspendingCategories = plannedItems.filter(item => (item.variance || 0) > 0);

  // Custom tooltip for bar chart
  const CustomBarTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ payload: ChartData }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Planned:</span>
              <span className="font-medium">{formatCurrency(data.planned)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Actual:</span>
              <span className="font-medium">{formatCurrency(data.actual)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Variance:</span>
              <span className={`font-medium ${data.variance > 0 ? 'text-destructive' : 'text-green-600'}`}>
                {formatCurrency(data.variance)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom tooltip for pie chart
  const CustomPieTooltip = ({ active, payload }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number }>;
  }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="bg-background border border-border rounded-lg shadow-lg p-3">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-muted-foreground">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overspending Alert */}
      {overspendingCategories.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span className="font-medium">
                {overspendingCategories.length} categor{overspendingCategories.length === 1 ? 'y' : 'ies'} over budget
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bar Chart - Planned vs Actual by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Planned vs Actual by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => formatCurrency(value)}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="planned" fill="#3b82f6" name="Planned" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#10b981" name="Actual" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Pie Chart - Total Planned vs Actual */}
      <Card>
        <CardHeader>
          <CardTitle>Total Budget Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              <span className="text-sm">Planned: {formatCurrency(totalPlanned)}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-sm">Actual: {formatCurrency(totalActual)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 