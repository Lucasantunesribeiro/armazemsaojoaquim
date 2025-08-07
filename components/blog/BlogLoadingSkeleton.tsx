'use client'

export function BlogLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700">
      {/* Hero Section Skeleton */}
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-6">
            <div className="h-8 bg-amber-200 dark:bg-slate-700 rounded-lg w-64 mx-auto animate-pulse" />
            <div className="h-16 bg-amber-200 dark:bg-slate-700 rounded-lg w-96 mx-auto animate-pulse" />
            <div className="h-6 bg-amber-200 dark:bg-slate-700 rounded-lg w-80 mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      {/* Content Section Skeleton */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="space-y-12">
            {/* Featured Posts Skeleton */}
            <div className="space-y-8">
              <div className="h-10 bg-amber-200 dark:bg-slate-700 rounded-lg w-64 animate-pulse" />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-3xl shadow-lg overflow-hidden">
                    <div className="h-80 bg-amber-200 dark:bg-slate-700 animate-pulse" />
                    <div className="p-8 space-y-6">
                      <div className="h-6 bg-amber-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-4 bg-amber-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-4 bg-amber-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-6 bg-amber-200 dark:bg-slate-700 rounded-full w-16 animate-pulse" />
                        <div className="h-6 bg-amber-200 dark:bg-slate-700 rounded-full w-20 animate-pulse" />
                        <div className="h-6 bg-amber-200 dark:bg-slate-700 rounded-full w-14 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* All Posts Skeleton */}
            <div className="space-y-8">
              <div className="h-10 bg-amber-200 dark:bg-slate-700 rounded-lg w-48 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg overflow-hidden">
                    <div className="h-48 bg-amber-200 dark:bg-slate-700 animate-pulse" />
                    <div className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex space-x-4">
                          <div className="h-4 bg-amber-200 dark:bg-slate-700 rounded w-16 animate-pulse" />
                          <div className="h-4 bg-amber-200 dark:bg-slate-700 rounded w-20 animate-pulse" />
                        </div>
                        <div className="h-5 bg-amber-200 dark:bg-slate-700 rounded-full w-16 animate-pulse" />
                      </div>
                      <div className="h-6 bg-amber-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-4 bg-amber-200 dark:bg-slate-700 rounded animate-pulse" />
                      <div className="h-4 bg-amber-200 dark:bg-slate-700 rounded w-3/4 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-5 bg-amber-200 dark:bg-slate-700 rounded w-12 animate-pulse" />
                        <div className="h-5 bg-amber-200 dark:bg-slate-700 rounded w-16 animate-pulse" />
                      </div>
                      <div className="h-4 bg-amber-200 dark:bg-slate-700 rounded w-24 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}