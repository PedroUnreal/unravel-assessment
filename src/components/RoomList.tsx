import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Room, ImageSet, VideoData } from '../types/hotel';
import { RoomCard } from './RoomCard';

interface RoomListProps {
  rooms: Room[];
  hotelImages: ImageSet[];
  hotelVideos: VideoData[];
  basePrice?: number;
  currency?: string;
}

/**
 * Reusable RoomList component that displays a list of rooms
 * Applies infinite scrolling with simulated large datasets for UX testing
 */
export function RoomList({ rooms, hotelImages, hotelVideos, basePrice = 241, currency = 'EUR' }: RoomListProps) {
  const uniqueRooms = useMemo(() => {
    return rooms.reduce((acc: Room[], room) => {
      if (!acc.find(r => r.room_type_code === room.room_type_code)) {
        acc.push(room);
      }
      return acc;
    }, []);
  }, [rooms]);

  const simulatedRooms = useMemo(() => {
    if (uniqueRooms.length === 0) {
      return uniqueRooms;
    }

    const targetCount = 120;
    if (uniqueRooms.length >= targetCount) {
      return uniqueRooms;
    }

    const multipliedRooms: Room[] = [];
    const multiplier = Math.ceil(targetCount / uniqueRooms.length);

    for (let i = 0; i < multiplier; i += 1) {
      uniqueRooms.forEach((room, index) => {
        const clone: Room = {
          ...room,
          room_type_code: `${room.room_type_code}-${i + 1}-${index + 1}`,
          name: `${room.name} · Stack ${i + 1}`,
        };
        multipliedRooms.push(clone);
      });
    }

    return multipliedRooms.slice(0, targetCount);
  }, [uniqueRooms]);

  const BATCH_SIZE = 9;
  const FETCH_DELAY_MS = 500;
  const [visibleCount, setVisibleCount] = useState(() => Math.min(BATCH_SIZE, simulatedRooms.length));
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const fetchTimeoutRef = useRef<number | null>(null);
  const hasMoreRooms = visibleCount < simulatedRooms.length;

  useEffect(() => {
    setVisibleCount(prev => {
      if (simulatedRooms.length === 0) {
        return 0;
      }
      const initialBatch = Math.min(BATCH_SIZE, simulatedRooms.length);
      if (prev === 0) {
        return initialBatch;
      }
      return Math.min(prev, simulatedRooms.length);
    });
    setIsFetchingMore(false);
  }, [simulatedRooms.length]);

  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current !== null) {
        window.clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const triggerLoadMore = useCallback(() => {
    if (!hasMoreRooms || isFetchingMore) {
      return;
    }

    setIsFetchingMore(true);
    fetchTimeoutRef.current = window.setTimeout(() => {
      setVisibleCount(prev => {
        if (prev >= simulatedRooms.length) {
          return prev;
        }
        return Math.min(prev + BATCH_SIZE, simulatedRooms.length);
      });
      setIsFetchingMore(false);
    }, FETCH_DELAY_MS);
  }, [hasMoreRooms, isFetchingMore, simulatedRooms.length]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      entries => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          triggerLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0,
      },
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
    };
  }, [triggerLoadMore]);

  const visibleRooms = simulatedRooms.slice(0, visibleCount);

  if (simulatedRooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No rooms available</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleRooms.map((room, index) => (
          <RoomCard
            key={`${room.room_type_code}-${index}`}
            room={room}
            hotelImages={hotelImages}
            hotelVideos={hotelVideos}
            price={basePrice + index * 15}
            currency={currency}
          />
        ))}
      </div>

      {isFetchingMore && hasMoreRooms && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: Math.min(3, simulatedRooms.length - visibleRooms.length) || 3 }).map((_, index) => (
            <div
              key={`room-skeleton-${index}`}
              className="h-72 rounded-2xl border border-gray-100 bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      )}

      <div ref={sentinelRef} className="h-4" aria-hidden="true" />

      <div className="flex items-center justify-center min-h-10">
        {isFetchingMore && hasMoreRooms ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-4 w-4 rounded-full border-2 border-teal-500 border-t-transparent animate-spin" />
            <span>Loading more rooms...</span>
          </div>
        ) : hasMoreRooms ? (
          <div className="text-xs text-gray-400">Scroll to load more rooms</div>
        ) : (
          <div className="text-sm text-gray-400">You have reached the end of the list</div>
        )}
      </div>
    </div>
  );
}
