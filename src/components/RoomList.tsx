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
 * Filters out duplicate rooms and renders them in a responsive grid
 */
export function RoomList({ rooms, hotelImages, hotelVideos, basePrice = 241, currency = 'EUR' }: RoomListProps) {
  // Remove duplicate rooms based on room_type_code
  const uniqueRooms = rooms.reduce((acc: Room[], room) => {
    if (!acc.find(r => r.room_type_code === room.room_type_code)) {
      acc.push(room);
    }
    return acc;
  }, []);

  if (uniqueRooms.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No rooms available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {uniqueRooms.map((room, index) => (
        <RoomCard
          key={`${room.room_type_code}-${index}`}
          room={room}
          hotelImages={hotelImages}
          hotelVideos={hotelVideos}
          price={basePrice + (index * 15)} // Simulate different prices
          currency={currency}
        />
      ))}
    </div>
  );
}
