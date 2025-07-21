"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useGetPlansListQuery, useActivatePlanMutation } from "../../lib/api/apiSlice";
import { useToast } from "../ui/use-toast";
import { PlanListItem } from "../../lib/types";
import { CheckCircle, Loader2 } from "lucide-react";

interface PlanSelectorProps {
  selectedPlanId?: number;
  onPlanChange: (plan: PlanListItem) => void;
}

export function PlanSelector({ onPlanChange }: PlanSelectorProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const { toast } = useToast();

  // Fetch plans list
  const { data: plansResponse, isLoading: isLoadingPlans, refetch } = useGetPlansListQuery();
  const [activatePlan, { isLoading: isActivating }] = useActivatePlanMutation();

  // Auto-select the active plan when plans are loaded
  useEffect(() => {
    if (plansResponse?.data && !selectedPlan) {
      const activePlan = plansResponse.data.find(plan => plan.is_active);
      if (activePlan) {
        setSelectedPlan(activePlan.id.toString());
        onPlanChange(activePlan);
      }
    }
  }, [plansResponse?.data, selectedPlan, onPlanChange]);

  const plans = plansResponse?.data || [];

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    const plan = plans.find(p => p.id.toString() === planId);
    if (plan) {
      onPlanChange(plan);
    }
  };

  const handleActivatePlan = async () => {
    if (!selectedPlan) return;

    try {
      await activatePlan(parseInt(selectedPlan)).unwrap();
      
      // Refresh the plans list to get updated active status
      await refetch();
      
      toast({
        title: "Plan Activated",
        description: "The selected plan has been set as active.",
        variant: "default",
      });
    } catch (error) {
      console.error('Failed to activate plan:', error);
      
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { error?: string })?.error 
        : error instanceof Error 
          ? error.message 
          : "Failed to activate plan. Please try again.";
      
      toast({
        title: "Activation Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const formatPlanName = (plan: PlanListItem) => {
    const date = new Date(plan.month);
    const monthYear = date.toLocaleDateString('en-IN', { 
      month: 'long', 
      year: 'numeric' 
    });
    return `${plan.plan_name} (${monthYear})`;
  };

  if (isLoadingPlans) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-muted-foreground">Loading plans...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedPlan} onValueChange={handlePlanSelect}>
        <SelectTrigger className="w-[300px]">
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          {plans.map((plan) => (
            <SelectItem key={plan.id} value={plan.id.toString()}>
              <div className="flex items-center gap-2">
                {formatPlanName(plan)}
                {plan.is_active && (
                  <CheckCircle className="h-3 w-3 text-green-500" />
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      {selectedPlan && (
        <Button
          onClick={handleActivatePlan}
          disabled={isActivating}
          size="sm"
          variant="outline"
        >
          {isActivating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Set Active"
          )}
        </Button>
      )}
    </div>
  );
} 