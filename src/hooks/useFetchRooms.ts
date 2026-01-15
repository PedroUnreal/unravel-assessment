import { useCallback, useEffect, useState } from "react";
import hotelData from '../../sample.json';
import type { HotelData, Room } from "../types/hotel";

const ALL_ROOMS = (hotelData as HotelData).rooms_by_serial_no[0]?.rooms || [];

/**
 * API calls simulation
 */
export function useFetchRooms(pageSize: number) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [hasMoreRooms, setHasMoreRooms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const fetchRooms = useCallback(() => {
    console.log('Fetching rooms...');
    setIsLoading(true);

    try {
      setRooms((prev) => [...prev, ...ALL_ROOMS.slice(prev.length, prev.length + pageSize)]);
    } catch (err) {
      console.log(err)
      setError('Failed to load rooms. Please try again.');
    } finally {
      setTimeout(() => {
        setIsLoading(false);
      }, 500); // Simulate network delay
    }
  }, [pageSize]);

  useEffect(() => {
    setHasMoreRooms(rooms.length < ALL_ROOMS.length);
  }, [rooms.length]);

  return {
    rooms,
    error,
    isLoading,
    hasMoreRooms,
    fetchRooms,
  }
}