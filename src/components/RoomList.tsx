import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Room } from '../types/hotel';
import { RoomCard } from './RoomCard';

interface RoomListProps {
  rooms: Room[];
}

const BATCH_SIZE = 9;

export function RoomList({ rooms }: RoomListProps) {
  const [visibleCount, setVisibleCount] = useState(BATCH_SIZE);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const visibleRooms = useMemo(() => rooms.slice(0, visibleCount), [rooms, visibleCount]);
  const hasMoreRooms = visibleCount < rooms.length;

  const triggerLoadMore = useCallback(() => {
    if (visibleCount >= rooms.length) {
      return;
    }
    setVisibleCount(prev => Math.min(prev + BATCH_SIZE, rooms.length));
  }, [visibleCount, rooms.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          triggerLoadMore();
        }
      },
      {
        rootMargin: '200px',
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [triggerLoadMore]);

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No rooms available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
        {visibleRooms.map(room => (
          <RoomCard
            key={room.room_type_code}
            room={room}
          />
        ))}
      </div>

      <div ref={sentinelRef} className="h-4" aria-hidden="true" />

      <div className="flex items-center justify-center min-h-10">
        {hasMoreRooms ? (
          <div className="text-xs text-gray-400">Scroll to load more rooms</div>
        ) : (
          <div className="text-sm text-gray-400">You have reached the end of the list</div>
        )}
      </div>
    </div>
  );
}
