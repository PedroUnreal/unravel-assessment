import { RoomList } from '../components/RoomList';
import { ResponsiveImage } from '../components/utils/ResponsiveImage';
import type { HotelData } from '../types/hotel';
import hotelData from '../../sample.json';

export function HotelPage() {
  const data = hotelData as HotelData;
  const { hotel_details } = data;

  return (
    <div>
      {/* Hotel page header */}
      <section className="bg-white shadow-sm" >
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            {hotel_details.images[0] && (
              <ResponsiveImage
                src={hotel_details.images[0].twoX.thumbnail}
                srcSet={hotel_details.images[0].threeX.thumbnail}
                alt={hotel_details.name}
                className="w-16 h-16 rounded-lg object-cover"
                loading="eager"
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
      </section>

      {/* Rooms list container */}
      <section className="max-w-7xl mx-auto px-4 py-8" >
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your Room</h2>
        <RoomList />
      </section>
    </div>
  )
}