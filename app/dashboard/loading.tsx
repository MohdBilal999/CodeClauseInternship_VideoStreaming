export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container py-8">
        {/* Header skeleton */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2"></div>
            <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
          </div>
          <div className="h-10 w-32 bg-muted animate-pulse rounded"></div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="h-4 w-24 bg-muted animate-pulse rounded mb-2"></div>
              <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
            </div>
          ))}
        </div>

        {/* Search and filters skeleton */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="h-10 flex-1 bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-48 bg-muted animate-pulse rounded"></div>
          <div className="h-10 w-48 bg-muted animate-pulse rounded"></div>
        </div>

        {/* Video list skeleton */}
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border rounded-lg p-6">
              <div className="flex space-x-4">
                <div className="w-48 aspect-video bg-muted animate-pulse rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-6 w-3/4 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-1/2 bg-muted animate-pulse rounded"></div>
                  <div className="h-4 w-1/3 bg-muted animate-pulse rounded"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="h-8 w-16 bg-muted animate-pulse rounded"></div>
                  <div className="h-8 w-20 bg-muted animate-pulse rounded"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
