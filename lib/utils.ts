import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get monthly salary from environment variable
 * @returns Monthly salary amount or undefined if not configured
 */
export function getMonthlySalary(): number | undefined {
  if (typeof window !== 'undefined') {
    // Client-side: use environment variable
    return process.env.NEXT_PUBLIC_SALARY_INHAND ? 
      parseFloat(process.env.NEXT_PUBLIC_SALARY_INHAND) : undefined;
  }
  return undefined;
}

/**
 * Calculate salary-based metrics
 * @param totalPlanned Total planned expenses
 * @returns Object with salary savings and utilization percentage
 */
export function calculateSalaryMetrics(totalPlanned: number) {
  const monthlySalary = getMonthlySalary();
  
  if (!monthlySalary) {
    return {
      salarySavings: undefined,
      salaryUtilizationPercentage: undefined,
    };
  }

  return {
    salarySavings: monthlySalary - totalPlanned,
    salaryUtilizationPercentage: (totalPlanned / monthlySalary) * 100,
  };
} 