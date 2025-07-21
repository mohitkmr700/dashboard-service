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
          <div>
            <CardTitle className="text-lg font-semibold">{planName}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {month} {year} • Version {version}
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Plan Fulfillment</span>
            <span className="font-medium">{summary.percentage_fulfilled.toFixed(1)}%</span>
          </div>
          <Progress value={Math.min(summary.percentage_fulfilled, 100)} className="h-2" />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Planned</p>
            <p className="text-lg font-semibold">{formatCurrency(summary.total_planned)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Total Actual</p>
            <p className="text-lg font-semibold">{formatCurrency(summary.total_actual)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Variance</p>
            <div className="flex items-center gap-1">
              {getVarianceIcon(summary.total_variance)}
              <span className={`text-lg font-semibold ${getVarianceColor(summary.total_variance)}`}>
                {formatCurrency(Math.abs(summary.total_variance))}
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Savings</p>
            <p className={`text-lg font-semibold ${summary.savings >= 0 ? 'text-green-600' : 'text-destructive'}`}>
              {formatCurrency(summary.savings)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 