"use client";

import { useEffect, useMemo, useState } from 'react';
import { useGetPlansListQuery } from '../../../lib/api/apiSlice';
import { useLoading } from '../../../lib/loading-context';
import { useToken } from '../../../lib/token-context';
import { useSidebar } from '../../../lib/sidebar-context';
import { useToast } from '../../../components/ui/use-toast';
import { PlanSummaryCard } from '../../../components/plan/plan-summary-card';
import { PlanProgressChart } from '../../../components/plan/plan-progress-chart';
import { PlanHistoryTable } from '../../../components/plan/plan-history-table';
import { SyncPlanButton } from '../../../components/plan/sync-plan-button';
import { PlanSelector } from '../../../components/plan/plan-selector';
import { PlanDetailsBox } from '../../../components/plan/plan-details-box';
import { PlanSummary, PlanListItem } from '../../../lib/types';
import { format } from 'date-fns';
import { getMonthlySalary, calculateSalaryMetrics } from '../../../lib/utils';

export default function PlanPage() {
  const { setIsLoading, setLoadingMessage } = useLoading();
  const { decodedToken, isLoading: isTokenLoading, token } = useToken();
  const { isLoading: isSidebarLoading } = useSidebar();
  const { toast } = useToast();

  // Get current month and year - use state to avoid hydration issues
  const [currentMonth, setCurrentMonth] = useState<string>('');
  const [currentYear, setCurrentYear] = useState<number>(0);

  useEffect(() => {
    const currentDate = new Date();
    setCurrentMonth(format(currentDate, 'MMMM'));
    setCurrentYear(currentDate.getFullYear());
  }, []);

  // State to track selected plan for details box
  const [selectedPlanForDetails, setSelectedPlanForDetails] = useState<PlanListItem | null>(null);

  // RTK Query hook for plans list
  const { 
    data: plansResponse, 
    isLoading: isPlansLoading, 
    error: plansError, 
    refetch: refetchPlans 
  } = useGetPlansListQuery(undefined, {
    skip: !decodedToken?.email || !token || isTokenLoading || isSidebarLoading
  });

  // Get the currently active plan from the plans list
  const activePlan = useMemo(() => {
    if (!plansResponse?.data) return null;
    return plansResponse.data.find(plan => plan.is_active);
  }, [plansResponse?.data]);

  // Set the selected plan for details to the active plan when data loads
  useEffect(() => {
    if (activePlan && !selectedPlanForDetails) {
      setSelectedPlanForDetails(activePlan);
    }
  }, [activePlan, selectedPlanForDetails]);

  // Convert active plan to ExpensePlan format for display
  const plan = useMemo(() => {
    if (!activePlan) return null;
    
    return {
      id: activePlan.id.toString(),
      name: activePlan.plan_name,
      month: activePlan.month,
      year: new Date(activePlan.month).getFullYear(),
      version: activePlan.version,
      total_planned: activePlan.planned_expense_items.reduce((sum, item) => sum + item.planned_amount, 0),
      total_actual: 0, // Will be populated when actual data is available
      total_variance: 0, // Will be calculated when actual data is available
      savings: 0, // Will be calculated when actual data is available
      is_active: activePlan.is_active,
      created: activePlan.created_at,
      updated: activePlan.created_at,
      planned_expense_items: activePlan.planned_expense_items.map(item => ({
        id: item.id.toString(),
        category: item.category,
        planned_amount: item.planned_amount,
        actual_paid: 0, // Will be populated when actual data is available
        variance: 0, // Will be calculated when actual data is available
      })),
    };
  }, [activePlan]);

  // Handle API errors with toast notifications
  useEffect(() => {
    if (plansError) {
      console.error('Plans API error:', plansError);
      
      // Only show error toast for actual API failures, not empty data
      // Check if it's a network error or server error, not just empty response
      const isActualError = plansError && typeof plansError === 'object' && (
        'status' in plansError || 
        'error' in plansError || 
        'message' in plansError
      );
      
      if (isActualError) {
        // Extract error message from RTK Query error
        let errorMessage = "Unable to fetch expense plans data. Please try again.";
        
        if (plansError && typeof plansError === 'object') {
          if ('data' in plansError && plansError.data && typeof plansError.data === 'object' && 'error' in plansError.data) {
            errorMessage = (plansError.data as { error: string }).error;
          } else if ('error' in plansError && plansError.error) {
            errorMessage = String(plansError.error);
          } else if ('message' in plansError && plansError.message) {
            errorMessage = String(plansError.message);
          }
        }
        
        toast({
          title: "Failed to Load Plans",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
  }, [plansError, toast]);

  // Check if we're fully authenticated and all data is loaded
  const isFullyAuthenticated = !isTokenLoading && !!token && !!decodedToken?.email;
  const isAllDataLoaded = !isSidebarLoading && !isPlansLoading;
  const isPageReady = isFullyAuthenticated && isAllDataLoaded;
  const isPageLoading = isTokenLoading || isSidebarLoading || (isFullyAuthenticated && isPlansLoading);

  // Calculate plan summary
  const planSummary = useMemo((): PlanSummary => {
    if (!plan || !plan.planned_expense_items) {
      return {
        total_planned: 0,
        total_actual: 0,
        total_variance: 0,
        percentage_fulfilled: 0,
        savings: 0,
        is_over_budget: false,
      };
    }

    const totalPlanned = plan.total_planned || 0;
    const totalActual = plan.total_actual || 0;
    const totalVariance = plan.total_variance || 0;
    const savings = totalPlanned - totalActual;
    const percentageFulfilled = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;
    const isOverBudget = totalVariance > 0;

    // Get monthly salary and calculate salary-based metrics
    const monthlySalary = getMonthlySalary();
    const { salarySavings, salaryUtilizationPercentage } = calculateSalaryMetrics(totalPlanned);

    return {
      total_planned: totalPlanned,
      total_actual: totalActual,
      total_variance: totalVariance,
      percentage_fulfilled: percentageFulfilled,
      savings: savings,
      is_over_budget: isOverBudget,
      monthly_salary: monthlySalary,
      salary_savings: salarySavings,
      salary_utilization_percentage: salaryUtilizationPercentage,
    };
  }, [plan]);

  // Check for overspending alerts
  useEffect(() => {
    if (plan && plan.planned_expense_items) {
      const overspendingCategories = plan.planned_expense_items.filter(item => (item.variance || 0) > 0);
      
      if (overspendingCategories.length > 0) {
        toast({
          title: "⚠️ Budget Alert",
          description: `${overspendingCategories.length} categor${overspendingCategories.length === 1 ? 'y' : 'ies'} over budget this month.`,
          variant: "destructive",
        });
      }

      if (planSummary.is_over_budget) {
        toast({
          title: "⚠️ Over Budget This Month",
          description: "Your total spending exceeds your planned budget.",
          variant: "destructive",
        });
      }
    }
  }, [plan, planSummary.is_over_budget, toast]);

  useEffect(() => {
    // If no token and token loading is done, redirect to login
    if (!isTokenLoading && !token) {
      window.location.href = '/login';
      return;
    }

    // If we have token but no decoded token, wait
    if (token && !decodedToken?.email) {
      setLoadingMessage("Validating authentication...");
      return;
    }

    // If we have decoded token, start loading plan
    if (decodedToken?.email) {
      setLoadingMessage("Loading your expense plan...");
    }
  }, [decodedToken, isTokenLoading, token, setLoadingMessage]);

  // Clear loading state once all data is loaded
  useEffect(() => {
    if (isPageReady && (!plansError || (plansResponse && (!plansResponse.data || plansResponse.data.length === 0)))) {
      setLoadingMessage("Plan tracker ready!");
      setIsLoading(false);
    }
  }, [isPageReady, plansError, plansResponse, setIsLoading, setLoadingMessage]);

  // Fallback: Clear loading state after a maximum time
  useEffect(() => {
    if (isFullyAuthenticated) {
      const maxLoadingTime = 8000; // 8 seconds max
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, maxLoadingTime);
      return () => clearTimeout(timer);
    }
  }, [isFullyAuthenticated, setIsLoading]);

  // Cleanup effect to reset loading state on unmount
  useEffect(() => {
    return () => {
      setIsLoading(false);
    };
  }, [setIsLoading]);

  const handleSyncComplete = () => {
    refetchPlans();
  };

  // Handle plan selection from dropdown
  const handlePlanChange = (selectedPlan: PlanListItem) => {
    setSelectedPlanForDetails(selectedPlan);
  };

  // Show loading if anything is still loading or not authenticated
  if (isPageLoading || !isFullyAuthenticated || !currentMonth) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-hidden">
        <div className="h-full flex flex-col p-3 md:p-4">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold">Plan Tracker</h1>
          </div>
          <div className="flex-1 grid gap-3 overflow-hidden">
            <div className="animate-pulse space-y-4">
              <div className="h-32 bg-muted rounded-lg"></div>
              <div className="h-64 bg-muted rounded-lg"></div>
              <div className="h-96 bg-muted rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if plan failed to load
  if (plansError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-destructive mb-4">Failed to fetch plan data</p>
          <button
            onClick={() => refetchPlans()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show empty state if no plans exist
  if (isPageReady && plansResponse && (!plansResponse.data || plansResponse.data.length === 0) && !plansError) {
    return (
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-xl font-bold">Expense Plan Tracker</h1>
            </div>
            <SyncPlanButton 
              month={currentMonth}
              year={currentYear}
              onSyncComplete={handleSyncComplete}
            />
          </div>
        </div>

        {/* Empty State Content */}
        <div className="flex-1 p-3 md:p-4 overflow-y-auto">
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <div className="w-24 h-24 mx-auto mb-4 bg-muted rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">No Expense Plans Found</h3>
                <p className="text-muted-foreground mb-6">
                  You haven&apos;t created any expense plans yet. Create your first plan to start tracking your monthly expenses.
                </p>
              </div>
              
              <div className="space-y-3">
                <SyncPlanButton 
                  month={currentMonth}
                  year={currentYear}
                  onSyncComplete={handleSyncComplete}
                />
                <p className="text-sm text-muted-foreground">
                  This will create a new expense plan for {currentMonth} {currentYear}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Only render content if we're fully ready
  if (!isPageReady || !currentMonth) {
    return (
      <div className="flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 p-3 md:p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Plan Tracker</h1>
          </div>
        </div>
        
        {/* Scrollable Content */}
        <div className="flex-1 p-3 md:p-4 overflow-y-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-96 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Header */}
      <div className="flex-shrink-0 p-3 md:p-4 border-b bg-background">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold">Expense Plan Tracker</h1>
            {plansResponse?.data && plansResponse.data.length > 0 && (
              <PlanSelector 
                selectedPlanId={plan?.id ? parseInt(plan.id) : undefined}
                onPlanChange={handlePlanChange}
              />
            )}
          </div>
          <SyncPlanButton 
            month={currentMonth}
            year={currentYear}
            onSyncComplete={handleSyncComplete}
          />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 p-3 md:p-4 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Main Content - 3 columns */}
          <div className="lg:col-span-3 grid gap-3">
            {/* Plan Summary Card - Full Width */}
            <PlanSummaryCard
              summary={planSummary}
              month={currentMonth}
              year={currentYear}
              planName={plan?.name || "Monthly Expense Plan"}
              version={plan?.version || 1}
            />
            
            {/* Plan Progress Charts */}
            <PlanProgressChart
              plannedItems={plan?.planned_expense_items || []}
              totalPlanned={planSummary.total_planned}
              totalActual={planSummary.total_actual}
            />
            
            {/* Plan History Table */}
            <PlanHistoryTable
              plannedItems={plan?.planned_expense_items || []}
              loading={isPlansLoading}
            />
          </div>

          {/* Plan Details Box - 1 column */}
          <div className="lg:col-span-1">
            <PlanDetailsBox
              selectedPlan={selectedPlanForDetails}
              isLoading={isPlansLoading}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 