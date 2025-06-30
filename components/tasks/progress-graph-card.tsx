"use client";

import { Task } from "../../lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { AreaChart, Area, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay, parseISO, differenceInDays, isAfter, differenceInHours, subHours, addHours } from 'date-fns';
import { TrendingUp } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { useState } from "react";

interface ProgressGraphCardProps {
  tasks: Task[];
}

interface DailyProgress {
  date: string;
  dateObj: Date;
  completed: number;
  onTime: number;
  late: number;
  taskDetails?: { title: string; status: string; time: string; progress: number }[];
}

type TimeFilter = "all" | "day" | "12h";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: DailyProgress;
  }>;
  label?: string;
}

export function ProgressGraphCard({ tasks }: ProgressGraphCardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const getDateRangeData = (): DailyProgress[] => {
    if (tasks.length === 0) return [];

    const now = new Date();
    let startDate: Date;
    const endDate = now;
    let dataPointInterval = 1; // Default to hourly data points

    // Set date range based on time filter
    switch (timeFilter) {
      case "day":
        startDate = startOfDay(now);
        break;
      case "12h":
        startDate = subHours(now, 12);
        dataPointInterval = 1; // Create data points every hour
        break;
      default: // "all"
        const dates = tasks
          .filter(task => task.created)
          .map(task => parseISO(task.created!));
        
        if (dates.length === 0) return [];
        
        const earliestDate = new Date(Math.min(...dates.map(d => d.getTime())));
        const daysDiff = differenceInDays(now, earliestDate);
        startDate = daysDiff <= 7 ? earliestDate : subDays(now, 6);
    }

    const data: DailyProgress[] = [];
    let currentDate = startDate;

    while (currentDate <= endDate) {
      const nextDate = addHours(currentDate, dataPointInterval);
      const dateStr = format(currentDate, 'MMM dd HH:mm');

      // Get tasks relevant for this time point
      const timePointTasks = tasks.filter(task => {
        if (!task.created || !task.updated || !task.deadline) return false;
        const created = parseISO(task.created);
        const updated = parseISO(task.updated);
        const deadline = parseISO(task.deadline);

        // Include tasks that were active up to this point
        return (
          (created <= currentDate) &&
          (updated <= currentDate || !task.is_done) &&
          (deadline >= currentDate || task.is_done)
        );
      });

      // Count completed tasks up to this point
      const completedTasks = timePointTasks.filter(task => {
        if (!task.updated) return false;
        return parseISO(task.updated) <= currentDate;
      });

      // Count on-time and late tasks up to this point
      const onTimeTasks = completedTasks.filter(task => {
        if (!task.deadline || !task.updated) return false;
        const deadline = parseISO(task.deadline);
        const updated = parseISO(task.updated);
        return !isAfter(updated, deadline);
      });

      const lateTasks = completedTasks.filter(task => {
        if (!task.deadline || !task.updated) return false;
        const deadline = parseISO(task.deadline);
        const updated = parseISO(task.updated);
        return isAfter(updated, deadline);
      });

      // Store task details for tooltip
      const taskDetails = timePointTasks.map(task => ({
        title: task.title,
        status: task.is_done 
          ? (isAfter(parseISO(task.updated!), parseISO(task.deadline!)) ? 'Late' : 'On Time')
          : (isAfter(currentDate, parseISO(task.deadline!)) ? 'Overdue' : 'Pending'),
        time: format(parseISO(task.updated || task.created!), 'HH:mm'),
        progress: task.progress,
        deadline: format(parseISO(task.deadline!), 'HH:mm')
      }));

      data.push({
        date: dateStr,
        dateObj: currentDate,
        completed: completedTasks.length,
        onTime: onTimeTasks.length,
        late: lateTasks.length,
        taskDetails
      });

      currentDate = nextDate;
    }

    return data;
  };

  const calculateEfficiencyRate = (tasks: Task[]): number => {
    const completedTasks = tasks.filter(task => task.is_done && task.created && task.updated && task.deadline);
    
    if (completedTasks.length === 0) return 0;

    const efficiencyScores = completedTasks.map(task => {
      const created = parseISO(task.created!);
      const updated = parseISO(task.updated!);
      const deadline = parseISO(task.deadline!);

      // Calculate total time available (from creation to deadline)
      const totalTimeAvailable = differenceInHours(deadline, created);
      
      // Calculate time taken to complete
      const timeTaken = differenceInHours(updated, created);

      // If completed after deadline, score is 0
      if (isAfter(updated, deadline)) return 0;

      // If completed before deadline, calculate efficiency score
      // Score is higher if task is completed faster relative to available time
      const efficiencyScore = ((totalTimeAvailable - timeTaken) / totalTimeAvailable) * 100;
      
      // Cap the score at 100 and ensure it's not negative
      return Math.min(100, Math.max(0, efficiencyScore));
    });

    // Calculate average efficiency rate
    const averageEfficiency = efficiencyScores.reduce((sum, score) => sum + score, 0) / completedTasks.length;
    return Math.round(averageEfficiency);
  };

  const calculateTrend = (data: DailyProgress[]): number => {
    if (data.length < 2) return 0;

    // Calculate completion rates for each interval
    const intervalRates = data.map(interval => {
      const intervalTasks = tasks.filter(task => {
        if (!task.created || !task.updated || !task.deadline) return false;
        const created = parseISO(task.created);
        const updated = parseISO(task.updated);
        const deadline = parseISO(task.deadline);
        
        const intervalStart = parseISO(interval.date.split(' - ')[0]);
        const intervalEnd = addHours(intervalStart, timeFilter === "12h" ? 12 : 24);
        
        // Include tasks that were active in this interval
        return (
          (created >= intervalStart && created < intervalEnd) ||
          (updated >= intervalStart && updated < intervalEnd) ||
          (deadline >= intervalStart && deadline < intervalEnd)
        );
      });

      if (intervalTasks.length === 0) return 0;

      // Calculate completion rate for the interval
      const completedTasks = intervalTasks.filter(task => task.is_done);
      return (completedTasks.length / intervalTasks.length) * 100;
    });

    // Calculate trend as percentage change between first and last interval
    const firstIntervalRate = intervalRates[0];
    const lastIntervalRate = intervalRates[intervalRates.length - 1];

    if (firstIntervalRate === 0) return 0;
    return ((lastIntervalRate - firstIntervalRate) / firstIntervalRate) * 100;
  };

  const data = getDateRangeData();
  
  // Calculate totals from the last data point only
  const lastDataPoint = data[data.length - 1];
  const totalOnTime = lastDataPoint?.onTime || 0;
  const totalLate = lastDataPoint?.late || 0;

  const efficiencyRate = calculateEfficiencyRate(tasks);
  const trend = calculateTrend(data);

  // Ensure we have at least one data point
  const chartData = data.length > 0 ? data : [
    {
      date: format(new Date(), 'MMM dd'),
      completed: 0,
      onTime: 0,
      late: 0
    }
  ];

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#1a1a1a] border border-border rounded-lg shadow-lg p-4 min-w-[280px] z-[9999] relative">
          <p className="font-medium mb-2 text-white">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-400">Completed:</span>
              <span className="font-medium text-white">{data.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">On Time:</span>
              <span className="font-medium text-success">{data.onTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Late:</span>
              <span className="font-medium text-destructive">{data.late}</span>
            </div>
            {data.taskDetails && data.taskDetails.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-700">
                <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  <div className="space-y-1.5">
                    {data.taskDetails.map((task, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-[#1a1a1a] backdrop-blur-none"
                      >
                        <span className="text-white truncate max-w-[180px] bg-[#1a1a1a]">{task.title}</span>
                        <span
                          className={`ml-2 shrink-0 bg-[#1a1a1a] ${
                            task.status === 'On Time'
                              ? 'text-success'
                              : task.status === 'Late' || task.status === 'Overdue'
                              ? 'text-destructive'
                              : 'text-gray-400'
                          }`}
                        >
                          {task.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Task Overview</CardTitle>
            <CardDescription className="text-sm">
              Showing task completion trends over time
            </CardDescription>
          </div>
          <Select
            value={timeFilter}
            onValueChange={(value: TimeFilter) => setTimeFilter(value)}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="day">Last 24h</SelectItem>
              <SelectItem value="12h">Last 12h</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="pt-0 pb-2">
        <div className="grid grid-cols-3 gap-4 mb-3">
          <div>
            <p className="text-sm text-muted-foreground">Efficiency Rate</p>
            <div className="flex items-center gap-2">
              <p className={`text-lg font-bold ${efficiencyRate >= 70 ? 'text-success' : efficiencyRate >= 40 ? 'text-warning' : 'text-destructive'}`}>
                {efficiencyRate}%
              </p>
              <TrendingUp 
                className={`h-4 w-4 ${
                  efficiencyRate >= 70 
                    ? 'text-success' 
                    : efficiencyRate >= 40 
                      ? 'text-warning' 
                      : 'text-destructive'
                }`} 
              />
              {trend !== 0 && (
                <span className={`text-sm ${
                  efficiencyRate >= 70 
                    ? 'text-success' 
                    : efficiencyRate >= 40 
                      ? 'text-warning' 
                      : 'text-destructive'
                }`}>
                  {Math.abs(Math.round(trend))}%
                </span>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">On-Time Tasks</p>
            <p className={`text-lg font-bold ${totalOnTime > totalLate ? 'text-success' : 'text-destructive'}`}>
              {totalOnTime}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Late Tasks</p>
            <p className={`text-lg font-bold ${totalLate === 0 ? 'text-success' : 'text-destructive'}`}>
              {totalLate}
            </p>
          </div>
        </div>
        <div className="h-[120px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                left: 12,
                right: 12,
                top: 12,
                bottom: 8,
              }}
              stackOffset="expand"
            >
              <defs>
                <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorOnTime" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--destructive))" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="hsl(var(--destructive))" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                stroke="hsl(var(--muted-foreground))"
                interval="preserveStartEnd"
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
              />
              <Area
                dataKey="late"
                type="monotone"
                fill="url(#colorLate)"
                stroke="hsl(var(--destructive))"
                stackId="a"
              />
              <Area
                dataKey="onTime"
                type="monotone"
                fill="url(#colorOnTime)"
                stroke="hsl(var(--success))"
                stackId="a"
              />
              <Area
                dataKey="completed"
                type="monotone"
                fill="url(#colorCompleted)"
                stroke="hsl(var(--primary))"
                stackId="a"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}