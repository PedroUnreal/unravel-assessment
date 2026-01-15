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

export interface CancellationRule {
  date_info?: string;
  description?: string;
  cost?: string | number | null;
}

export interface CancellationInfo {
  free_cancellation: number;
  free_cancellation_info?: string;
  free_cancel_description?: string;
  free_amendment_description?: string | null;
  cancellation_rules?: CancellationRule[];
}

export interface VariantPromoEntry {
  discount?: number | null;
  offer_type?: string | null;
  offer_title?: string | null;
  offer_description?: string | null;
  offer_condition?: string | null;
  offer_note?: string | null;
  offer_stay?: string | null;
  offer_pay?: string | null;
  offer_upgrade_to_room_id?: string | null;
  offer_upgrade_to_meal_id?: string | null;
  offer_discounted_nights?: string | null;
  offer_total_price?: number | null;
  offer_discounted_total_price?: number | null;
}

export interface VariantTotalPrice {
  total_price?: number | null;
  discounted_price?: number | null;
  total_price_rounded?: number | null;
  discounted_price_rounded?: number | null;
  currency?: string;
  promo_list?: VariantPromoEntry[];
}

export interface VariantDisplayProperty {
  name: string;
  display_name: string;
  icon_name: string;
  order: string;
  value: string;
}

export interface RoomVariant {
  variant_id: string;
  variant_code?: string;
  name: string;
  display_properties?: VariantDisplayProperty[];
  cancellation_info?: CancellationInfo;
  total_price?: VariantTotalPrice;
}

export interface Room {
  name: string;
  room_type_code: string;
  variants_count: number;
  images: ImageSet[] | null;
  properties: RoomProperties;
  variants?: RoomVariant[];
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
