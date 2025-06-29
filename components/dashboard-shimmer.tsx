import { Shimmer } from "./ui/shimmer";

export function DashboardStatsShimmer() {
  return (
    <>
      {[1, 2, 3, 4].map((index) => (
        <div key={index} className="border-none shadow-sm rounded-lg bg-card">
          <div className="p-4">
            <div className="flex items-center gap-4">
              <Shimmer className="h-9 w-9 rounded-lg" />
              <div>
                <Shimmer className="h-4 w-16 rounded mb-1" />
                <Shimmer className="h-8 w-12 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}

export function ProgressGraphShimmer() {
  return (
    <div className="rounded-lg border bg-card">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-1">
            <Shimmer className="h-6 w-32 rounded" />
            <Shimmer className="h-4 w-48 rounded" />
          </div>
          <div className="flex items-center gap-2">
            <Shimmer className="h-8 w-20 rounded" />
            <Shimmer className="h-8 w-8 rounded" />
          </div>
        </div>
        
        {/* Chart area */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Shimmer className="h-4 w-24 rounded" />
            <Shimmer className="h-4 w-16 rounded" />
          </div>
          <Shimmer className="h-64 w-full rounded" />
          
          {/* Legend */}
          <div className="flex gap-6 mt-4">
            {[1, 2, 3].map((index) => (
              <div key={index} className="flex items-center gap-2">
                <Shimmer className="h-3 w-3 rounded-full" />
                <Shimmer className="h-4 w-16 rounded" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TaskTableShimmer() {
  return (
    <div className="rounded-md border h-full flex flex-col bg-card">
      <div className="overflow-auto flex-1">
        <table className="w-full">
          <thead className="sticky top-0 bg-muted/50 z-10">
            <tr className="border-b bg-background">
              {["Title", "Status", "Progress", "Deadline", "Actions"].map((header) => (
                <th key={header} className="h-10 px-3 text-left align-middle font-medium text-xs">
                  <Shimmer className="h-4 w-16 rounded" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((index) => (
              <tr key={index} className="border-b">
                <td className="p-3">
                  <div className="space-y-2">
                    <Shimmer className="h-4 w-32 rounded" />
                    <Shimmer className="h-3 w-24 rounded" />
                  </div>
                </td>
                <td className="p-3">
                  <Shimmer className="h-6 w-16 rounded-full" />
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <Shimmer className="h-4 w-24 rounded-full" />
                    <Shimmer className="h-3 w-8 rounded" />
                  </div>
                </td>
                <td className="p-3">
                  <Shimmer className="h-4 w-20 rounded" />
                </td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <Shimmer className="h-7 w-7 rounded" />
                    <Shimmer className="h-7 w-7 rounded" />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DashboardShimmer() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Shimmer className="h-8 w-64 rounded" />
          <Shimmer className="h-10 w-32 rounded" />
        </div>

        <div className="flex-1 grid gap-4 overflow-hidden">
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <DashboardStatsShimmer />
          </div>
          
          {/* Progress Graph */}
          <ProgressGraphShimmer />

          {/* Task Table */}
          <div className="flex-1 overflow-hidden">
            <TaskTableShimmer />
          </div>
        </div>
      </div>
    </div>
  );
} 