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

export interface RoomImageResource {
  id: string;
  key: string;
  count: number;
  image_urls: string[];
  display_name: string;
}

export interface RoomProperties {
  room_capacity?: {
    max_children: number;
  };
  bed_type?: string;
  video_url?: {
    med: string;
  };
  room_images?: RoomImageResource[];
}

export interface CancellationInfo {
    free_cancellation_info?: string;
    free_cancel_description?: string;
    free_amendment_description?: string;
    cancellation_rules?: Array<{
        date_info?: string;
        description?: string;
        cost?: number | string;
    }>;
}

export interface VariantPricing {
    currency?: string;
    total_price?: number;
    discounted_price?: number;
    promo_list?: Array<{
        offer_total_price?: number;
        offer_discounted_total_price?: number;
        offer_title?: string;
    }>;
}

export interface RoomVariant {
    total_price?: VariantPricing;
    name?: string;
    variant_id: string;
    display_properties?: Array<{
        display_name?: string;
        value?: string;
    }>;
    cancellation_info?: CancellationInfo;
}

export interface Room {
  name: string;
  room_type_code: string;
  variants_count: number;
  images: ImageSet[] | null;
  properties: RoomProperties;
  variants?: RoomVariant[];
}


export interface HotelDetails {
  item_id: string;
  display_name: string;
  name: string;
  description: string;
  images: ImageSet[];
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
