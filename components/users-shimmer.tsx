import { Shimmer } from "./ui/shimmer";

export function UsersShimmer() {
  return (
    <div className="space-y-4 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Shimmer className="h-8 w-24 rounded" />
        <div className="flex gap-2">
          <Shimmer className="h-10 w-40 rounded" />
          <Shimmer className="h-10 w-20 rounded" />
        </div>
      </div>

      {/* Description */}
      <Shimmer className="h-4 w-80 rounded" />

      {/* Table */}
      <div className="rounded-md border bg-card">
        <div className="overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/50 z-10">
              <tr className="border-b bg-background">
                {["Name", "Role", "Status", "Created At", "Actions"].map((header) => (
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
                    <div className="flex items-center gap-3">
                      <Shimmer className="h-8 w-8 rounded-full" />
                      <div className="space-y-1">
                        <Shimmer className="h-4 w-24 rounded" />
                        <Shimmer className="h-3 w-32 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Shimmer className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="p-3">
                    <Shimmer className="h-6 w-16 rounded-full" />
                  </td>
                  <td className="p-3">
                    <Shimmer className="h-4 w-20 rounded" />
                  </td>
                  <td className="p-3">
                    <div className="flex gap-1">
                      <Shimmer className="h-7 w-7 rounded" />
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
    </div>
  );
} 