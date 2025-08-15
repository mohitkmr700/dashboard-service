"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { PlanSummary } from "../../lib/types";

interface PlanSummaryCardProps {
  summary: PlanSummary;
  month: string;
  year: number;
  planName: string;
  version: number;
}

export function PlanSummaryCard({ summary, month, year, planName, version }: PlanSummaryCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getVarianceColor = (variance: number) => {
    return variance > 0 ? 'text-destructive' : 'text-green-600';
  };

  const getVarianceIcon = (variance: number) => {
    return variance > 0 ? <TrendingDown className="h-4 w-4" /> : <TrendingUp className="h-4 w-4" />;
  };

  const getStatusBadge = () => {
    // Check if planned expenses exceed salary
    if (summary.monthly_salary && summary.total_planned > summary.monthly_salary) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Exceeds Salary
        </Badge>
      );
    }
    
    if (summary.is_over_budget) {
      return (
        <Badge variant="destructive" className="flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Over Budget
        </Badge>
      );
    }
    
    return (
      <Badge variant="default" className="flex items-center gap-1 bg-green-600">
        <CheckCircle className="h-3 w-3" />
        On Track
      </Badge>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl font-semibold">{planName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {month} {year} • Version {version}
            </p>
          </div>
          <div className="flex-shrink-0">
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Plan Fulfillment</span>
            <span className="text-lg font-semibold">{summary.percentage_fulfilled.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(summary.percentage_fulfilled, 100)} className="h-3" />
        </div>

        {/* Salary Utilization Progress - Show only if salary is configured */}
        {summary.monthly_salary && summary.salary_utilization_percentage && (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Salary Utilization</span>
              <span className="text-lg font-semibold">{summary.salary_utilization_percentage.toFixed(1)}%</span>
            </div>
            <Progress 
              value={Math.min(summary.salary_utilization_percentage, 100)} 
              className="h-3"
              style={{
                '--progress-background': summary.salary_utilization_percentage > 80 ? 'hsl(var(--destructive))' : 
                                        summary.salary_utilization_percentage > 60 ? 'hsl(var(--warning))' : 
                                        'hsl(var(--primary))'
              } as React.CSSProperties}
            />
            <p className="text-xs text-muted-foreground">
              {summary.salary_utilization_percentage > 80 ? 'High utilization - Consider reducing expenses' :
               summary.salary_utilization_percentage > 60 ? 'Moderate utilization - Monitor spending' :
               'Good utilization - Healthy spending pattern'}
            </p>
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="space-y-2 p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground font-medium">Total Planned</p>
            <p className="text-xl font-bold">{formatCurrency(summary.total_planned)}</p>
          </div>
          <div className="space-y-2 p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground font-medium">Total Actual</p>
            <p className="text-xl font-bold">{formatCurrency(summary.total_actual)}</p>
          </div>
          <div className="space-y-2 p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground font-medium">Variance</p>
            <div className="flex items-center gap-2">
              {getVarianceIcon(summary.total_variance)}
              <span className={`text-xl font-bold ${getVarianceColor(summary.total_variance)}`}>
                {formatCurrency(Math.abs(summary.total_variance))}
              </span>
            </div>
          </div>
          <div className="space-y-2 p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground font-medium">Savings</p>
            <p className={`text-xl font-bold ${summary.savings >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {formatCurrency(summary.savings)}
            </p>
          </div>
        </div>

        {/* Salary Information - Show only if salary is configured */}
        {summary.monthly_salary && (
          <div className="space-y-4">
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-muted-foreground mb-3">Salary Analysis</h4>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="space-y-2 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-muted-foreground font-medium">Monthly Salary</p>
                  <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    {formatCurrency(summary.monthly_salary)}
                  </p>
                </div>
                <div className="space-y-2 p-3 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  <p className="text-sm text-muted-foreground font-medium">Salary Savings</p>
                  <p className="text-xl font-bold text-green-600 dark:text-green-400">
                    {summary.salary_savings ? formatCurrency(summary.salary_savings) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2 p-3 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-muted-foreground font-medium">Salary Utilization</p>
                  <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    {summary.salary_utilization_percentage ? `${summary.salary_utilization_percentage.toFixed(1)}%` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 