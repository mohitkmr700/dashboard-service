"use client";

import { Button } from "../ui/button";
import { RefreshCw, Loader2 } from "lucide-react";
import { useSyncPlanMutation } from "../../lib/api/apiSlice";
import { useToast } from "../ui/use-toast";
import { SyncPlanPayload } from "../../lib/types";

interface SyncPlanButtonProps {
  month: string;
  year: number;
  prompt?: string;
  onSyncComplete?: () => void;
}

export function SyncPlanButton({ month, year, prompt, onSyncComplete }: SyncPlanButtonProps) {
  const [syncPlan, { isLoading }] = useSyncPlanMutation();
  const { toast } = useToast();

  const handleSync = async () => {
    try {
      const payload: SyncPlanPayload = {
        month,
        year,
        prompt,
      };

      await syncPlan(payload).unwrap();
      
      toast({
        title: "Plan Synced Successfully",
        description: `Expense plan for ${month} ${year} has been updated with latest data.`,
        variant: "default",
      });

      onSyncComplete?.();
    } catch (error) {
      console.error('Failed to sync plan:', error);
      
      // Extract error message from the error response
      const errorMessage = error && typeof error === 'object' && 'data' in error 
        ? (error.data as { error?: string })?.error 
        : error instanceof Error 
          ? error.message 
          : "Failed to sync expense plan. Please try again.";
      
      toast({
        title: "Sync Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  return (
    <Button
      onClick={handleSync}
      disabled={isLoading}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <RefreshCw className="h-4 w-4" />
      )}
      {isLoading ? "Syncing..." : "Sync Plan"}
    </Button>
  );
} 