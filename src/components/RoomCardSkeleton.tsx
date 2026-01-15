/**
 * Skeleton component for RoomCard
 * Displays animated placeholder while room data is loading
 */
export function RoomCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-[4/3] bg-gray-200" />

      <div className="p-5 flex flex-col gap-4">
        {/* Variants section skeleton */}
        <div className="space-y-3 pt-3 border-t border-gray-100">
          {/* Variant cards skeleton - showing 2 variants */}
          <div className="space-y-3">
            {[1, 2].map((index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-3 flex flex-col gap-2"
              >
                {/* Variant title skeleton */}
                <div className="h-4 bg-gray-200 rounded w-2/3" />

                {/* Variant details skeleton */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-col gap-1.5 flex-1">
                    {/* Bed type skeleton */}
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    {/* Cancellation policy skeleton */}
                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                  </div>

                  {/* Price skeleton */}
                  <div className="flex flex-col items-end gap-1">
                    <div className="h-5 bg-gray-200 rounded w-16" />
                    <div className="h-3 bg-gray-200 rounded w-12" />
                  </div>
                </div>

                {/* Select button skeleton */}
                <div className="h-8 bg-gray-200 rounded-md w-full mt-2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
