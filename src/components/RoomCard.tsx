import { useState } from 'react';
import type { Room, ImageSet, VideoData } from '../types/hotel';
import { useInView } from '../hooks/useInView';

interface RoomCardProps {
  room: Room;
  hotelImages: ImageSet[];
  hotelVideos?: VideoData[];
  price?: number;
  originalPrice?: number;
  currency?: string;
}

/**
 * Reusable RoomCard component that displays room details
 * with lazy loading for images and videos based on viewport visibility
 */
export function RoomCard({ room, hotelImages, price, originalPrice, currency = 'AED' }: RoomCardProps) {
  const { ref, isInView } = useInView();
  const [imageLoaded, setImageLoaded] = useState(false);

  // Get room image or fallback to hotel images
  const roomImages = room.properties?.room_images || room.images || hotelImages;
  const currentImage = roomImages?.[0];

  // Format room name for display
  const formatRoomName = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  // Get bed type display
  const bedType = room.properties?.bed_type || '1 King Bed';
  const maxChildren = room.properties?.room_capacity?.max_children ?? 0;

  // Calculate discount percentage
  const discountPercent = originalPrice && price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  return (
    <div 
      ref={ref}
      className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row"
    >
      {/* Image Section */}
      <div className="relative w-full sm:w-48 h-48 sm:h-auto flex-shrink-0 bg-gray-200">
        {isInView ? (
          <>
            {currentImage && (
              <img
                src={currentImage.twoX?.landscape || currentImage.twoX?.square}
                alt={room.name}
                loading="lazy"
                onLoad={() => setImageLoaded(true)}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
              />
            )}
            {/* Loading placeholder */}
            {!imageLoaded && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse" />
            )}
          </>
        ) : (
          <div className="w-full h-full bg-gray-200 animate-pulse" />
        )}
      </div>

      {/* Content Section */}
      <div className="flex-1 p-4 flex flex-col justify-between">
        <div>
          {/* Room Name */}
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {formatRoomName(room.name)}
          </h3>

          {/* Room Info Row */}
          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            {/* Occupancy */}
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>2 Adults{maxChildren > 0 && `, ${maxChildren} Child`}</span>
            </div>

            {/* Bed Type */}
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h18M3 12a9 9 0 0118 0M3 12a9 9 0 000 0m18 0a9 9 0 01-9 9m9-9a9 9 0 00-9-9m0 18c-4.97 0-9-4.03-9-9s4.03-9 9-9" />
              </svg>
              <span>{bedType}</span>
            </div>
          </div>

          {/* Meal Plan Tags */}
          <div className="flex flex-wrap gap-2 mb-3">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
              🍳 Breakfast
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-200">
              Room only
            </span>
            {room.variants_count > 2 && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                +{room.variants_count - 2} more
              </span>
            )}
          </div>
        </div>

        {/* Price and Book Section */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-baseline gap-2">
            {discountPercent > 0 && (
              <span className="text-xs font-semibold text-white bg-red-500 px-2 py-0.5 rounded">
                {discountPercent}% OFF
              </span>
            )}
            {originalPrice && originalPrice !== price && (
              <span className="text-sm text-gray-400 line-through">
                {currency} {originalPrice.toLocaleString()}
              </span>
            )}
            <span className="text-xl font-bold text-gray-900">
              {currency} {price?.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500">/night</span>
          </div>

          <button className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl transition-colors">
            Book
          </button>
        </div>
      </div>
    </div>
  );
}
