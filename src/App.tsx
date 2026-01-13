import { RoomList } from './components/RoomList';
import type { HotelData } from './types/hotel';
import hotelData from '../sample.json';
import './App.css'

function App() {
  const data = hotelData as HotelData;
  const { hotel_details, rooms_by_serial_no } = data;
  
  // Get all rooms from the first serial_no entry
  const rooms = rooms_by_serial_no[0]?.rooms || [];
  
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
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
                <div className="flex">
                  {[...Array(hotel_details.properties.star_rating)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-sm text-gray-500">Dubai, UAE</span>
              </div>
            </div>
          </div>
          
          {/* Price Info */}
          {hotel_details.price_info && (
            <div className="mt-4 flex items-center gap-3">
              {hotel_details.price_info.is_discount_present && (
                <span className="bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                  {Math.round(((hotel_details.price_info.total_price - hotel_details.price_info.discounted_price) / hotel_details.price_info.total_price) * 100)}% OFF
                </span>
              )}
              <span className="text-gray-400 line-through">
                {hotel_details.price_info.unit} {hotel_details.price_info.total_price}
              </span>
              <span className="text-xl font-bold text-gray-900">
                {hotel_details.price_info.unit} {hotel_details.price_info.discounted_price}
              </span>
              <span className="text-sm text-gray-500">per night</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Select Your Room</h2>
          <p className="text-gray-600">
            Choose from {rooms.length > 0 ? new Set(rooms.map(r => r.room_type_code)).size : 0} room types available
          </p>
        </div>

        {/* Room List */}
        <RoomList
          rooms={rooms}
          hotelImages={hotel_details.images}
          hotelVideos={hotel_details.new_videos}
          basePrice={hotel_details.price_info?.discounted_price || 241}
          currency={hotel_details.price_info?.unit || 'EUR'}
        />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center text-gray-500 text-sm">
          <p>© 2026 Hotel Booking Assessment. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
