// Types for the hotel and room data from sample.json

export interface ImageVariant {
  square: string;
  portrait: string;
  landscape: string;
  thumbnail: string;
  fullscreen: string;
  transcoded: string;
}

export interface ImageSet {
  twoX: ImageVariant;
  threeX: ImageVariant;
}

export interface VideoData {
  item_id: string;
  video_id: string;
  position: number;
  image: ImageSet;
  video_caption: string;
  video_url: {
    med: string;
  };
}

export interface RoomProperties {
  room_capacity?: {
    max_children: number;
  };
  bed_type?: string;
  video_url?: {
    med: string;
  };
  room_images?: ImageSet[];
}

export interface Room {
  name: string;
  room_type_code: string;
  variants_count: number;
  images: ImageSet[] | null;
  properties: RoomProperties;
}

export interface PriceInfo {
  is_discount_present: boolean;
  total_price: number;
  discounted_price: number;
  unit: string;
}

export interface HotelDetails {
  item_id: string;
  display_name: string;
  name: string;
  description: string;
  images: ImageSet[];
  new_videos: VideoData[];
  price_info: PriceInfo;
  properties: {
    price: Array<{
      unit: string;
      value: number;
    }>;
    star_rating: number;
  };
}

export interface RoomsBySerialNo {
  serial_no: number;
  rooms: Room[];
}

export interface HotelData {
  hotel_details: HotelDetails;
  rooms_by_serial_no: RoomsBySerialNo[];
}
