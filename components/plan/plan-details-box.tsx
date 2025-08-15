"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { PlanListItem } from "../../lib/types";
import { format } from "date-fns";
import { getMonthlySalary, calculateSalaryMetrics } from "../../lib/utils";

interface PlanDetailsBoxProps {
  selectedPlan: PlanListItem | null;
  isLoading: boolean;
}

export function PlanDetailsBox({ selectedPlan, isLoading }: PlanDetailsBoxProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMMM yyyy');
  };

  const calculateTotalPlanned = () => {
    if (!selectedPlan) return 0;
    return selectedPlan.planned_expense_items.reduce((sum, item) => sum + item.planned_amount, 0);
  };

  if (isLoading) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Plan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-3 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!selectedPlan) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg">Plan Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            <p>No plan selected</p>
            <p className="text-sm">Select a plan from the dropdown to view details</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPlanned = calculateTotalPlanned();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Plan Details</CardTitle>
          {selectedPlan.is_active && (
            <Badge variant="default" className="bg-green-500 hover:bg-green-600">
              Active
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Plan Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">Plan Name:</span>
            <span className="text-sm">{selectedPlan.plan_name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Month:</span>
            <span className="text-sm">{formatDate(selectedPlan.month)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Version:</span>
            <span className="text-sm">v{selectedPlan.version}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Planned:</span>
            <span className="text-sm font-semibold text-primary">
              {formatCurrency(totalPlanned)}
            </span>
          </div>
        </div>

        {/* Notes */}
        {selectedPlan.notes && (
          <div className="pt-2 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Notes:</span> {selectedPlan.notes}
            </p>
          </div>
        )}

        {/* Planned Items */}
        <div className="pt-2 border-t">
          <h4 className="font-medium mb-3">Planned Expense Items</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {selectedPlan.planned_expense_items.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center p-2 bg-muted/50 rounded-md"
              >
                <span className="text-sm font-medium">{item.category}</span>
                <span className="text-sm font-semibold text-primary">
                  {formatCurrency(item.planned_amount)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Summary */}
        <div className="pt-2 border-t">
          <div className="flex justify-between items-center">
            <span className="font-semibold">Total Budget:</span>
            <span className="font-bold text-lg text-primary">
              {formatCurrency(totalPlanned)}
            </span>
          </div>
        </div>

        {/* Salary Analysis - Show only if salary is configured */}
        {(() => {
          const monthlySalary = getMonthlySalary();
          const { salarySavings, salaryUtilizationPercentage } = calculateSalaryMetrics(totalPlanned);
          
          if (!monthlySalary) return null;
          
          return (
            <div className="pt-2 border-t">
              <h4 className="font-medium mb-3 text-blue-600 dark:text-blue-400">Salary Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Monthly Salary:</span>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {formatCurrency(monthlySalary)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Salary Savings:</span>
                  <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {salarySavings ? formatCurrency(salarySavings) : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Utilization:</span>
                  <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                    {salaryUtilizationPercentage ? `${salaryUtilizationPercentage.toFixed(1)}%` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          );
        })()}
      </CardContent>
    </Card>
  );
} 