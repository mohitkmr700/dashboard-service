import { Shimmer } from "./ui/shimmer";

export function PageShimmer() {
  return (
    <div className="h-[calc(100vh-4rem)] overflow-hidden">
      <div className="h-full flex flex-col p-4 md:p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Shimmer className="h-8 w-48 rounded" />
          <Shimmer className="h-10 w-32 rounded" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-6">
          {/* Main content area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Card 1 */}
              <div className="rounded-lg border bg-card p-6">
                <div className="space-y-4">
                  <Shimmer className="h-6 w-32 rounded" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="space-y-2">
                        <Shimmer className="h-4 w-full rounded" />
                        <Shimmer className="h-4 w-3/4 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div className="rounded-lg border bg-card p-6">
                <div className="space-y-4">
                  <Shimmer className="h-6 w-40 rounded" />
                  <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="space-y-2">
                        <Shimmer className="h-4 w-20 rounded" />
                        <Shimmer className="h-8 w-16 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-6">
              {/* Sidebar card */}
              <div className="rounded-lg border bg-card p-6">
                <div className="space-y-4">
                  <Shimmer className="h-6 w-24 rounded" />
                  <div className="space-y-3">
                    {[1, 2, 3, 4].map((index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <Shimmer className="h-4 w-4 rounded" />
                        <Shimmer className="h-4 flex-1 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats card */}
              <div className="rounded-lg border bg-card p-6">
                <div className="space-y-4">
                  <Shimmer className="h-6 w-20 rounded" />
                  <div className="space-y-3">
                    {[1, 2, 3].map((index) => (
                      <div key={index} className="space-y-2">
                        <Shimmer className="h-4 w-16 rounded" />
                        <Shimmer className="h-6 w-12 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 