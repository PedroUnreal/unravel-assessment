import { useEffect, useRef } from 'react';
import { RoomCard } from './RoomCard';
import { RoomCardSkeleton } from './RoomCardSkeleton';
import { useFetchRooms } from '../../hooks/useFetchRooms';
import { Toast } from '../common/Toast';

const BATCH_SIZE = 6;

export function RoomList() {
  const { rooms, error, isLoading, hasMoreRooms, fetchRooms } =
    useFetchRooms(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchRooms();
  }, [fetchRooms]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading && hasMoreRooms) {
          fetchRooms();
        }
      },
      {
        rootMargin: '0px 0px 200px 0px',
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [fetchRooms, isLoading, hasMoreRooms]);

  if (!error && rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">No rooms available</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {rooms.map((room, index) => (
          <li key={`${index}_${room.room_type_code}`}>
            <RoomCard room={room} />
          </li>
        ))}

        {isLoading &&
          Array.from({ length: BATCH_SIZE }).map((_, index) => (
            <RoomCardSkeleton key={`skeleton-${index}`} />
          ))}
      </ul>

      <div className="flex items-center justify-center min-h-10">
        {hasMoreRooms ? (
          <div className="text-xs text-gray-400">Scroll to load more rooms</div>
        ) : (
          <div className="text-sm text-gray-400">
            You have reached the end of the list
          </div>
        )}
      </div>

      {error && (
        <Toast
          message={error || 'Failed to fetch rooms. Please try again later.'}
        />
      )}

      <div ref={sentinelRef} className="h-4" aria-hidden="true" />
    </div>
  );
}
