import { RoomList } from '../components/RoomList';
import type { HotelData } from '../types/hotel';
import hotelData from '../../sample.json';

export function HotelPage() {
  const data = hotelData as HotelData;
  const { hotel_details, rooms_by_serial_no } = data;

  // Get all rooms from the first serial_no entry
  const rooms = rooms_by_serial_no[0]?.rooms || [];

  return (
    <div>
      {/* Hotel sticky header */}
      <section className="bg-white shadow-sm" >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {hotel_details.images[0] && (
              <img
                src={hotel_details.images[0].twoX.thumbnail}
                alt={hotel_details.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {hotel_details.display_name}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <div className="text-yellow-400 text-base leading-none">
                  {'★'.repeat(hotel_details.properties.star_rating)}
                </div>
                <span className="text-sm text-gray-500">Dubai, UAE</span>
              </div>
            </div>
          </div>
        </div>
      </section >

      {/* Rooms list Container */}
      <section className="max-w-7xl mx-auto px-4 py-8" >
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your Room</h2>
          {rooms.length > 0 && (
            <div className="text-gray-600">
              Choose from {rooms.length} room types available
            </div>
          )}
        </div>

        {rooms.length === 0 ? (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Rooms Available</h2>
            <p className="text-gray-600">Currently, there are no rooms available for this hotel.</p>
          </div>
        ) : (
          <RoomList
            rooms={rooms}
          />
        )}
      </section >
    </div>
  )
}