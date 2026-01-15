import { useState, useMemo, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import type { Room, ImageSet, VideoData, ImageVariant } from '../types/hotel';
import { useInView } from '../hooks/useInView';
import { MediaCarousel, type CarouselImageSource } from './MediaCarousel';
import { VariantCard, type VariantDetailKey, type VariantDetail } from './VariantCard';

interface RoomCardProps {
  room: Room;
  hotelImages: ImageSet[];
  hotelVideos?: VideoData[];
  price?: number;
  originalPrice?: number;
  currency?: string;
}

const DISPLAY_NAME_PROP_MAP: Record<string, VariantDetailKey> = {
  'meals included': 'mealsIncluded',
  'bed type': 'bedType',
  'adult occupancy': 'adultOccupancy',
  'family occupancy': 'familyOccupancy',
};

const IMAGE_FIELD_PRIORITY: Array<keyof ImageVariant> = [
  'landscape',
  'portrait',
  'square',
  'fullscreen',
  'thumbnail',
  'transcoded',
];

const DEFAULT_IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

const buildSrcSet = (imageSet?: ImageSet | null) => {
  if (!imageSet) {
    return null;
  }

  const oneX = IMAGE_FIELD_PRIORITY.map(field => imageSet.twoX?.[field]).find(Boolean);
  const twoX = IMAGE_FIELD_PRIORITY.map(field => imageSet.threeX?.[field]).find(Boolean);

  if (!oneX && !twoX) {
    return null;
  }

  const baseSrc = oneX || twoX;
  const srcSetParts: string[] = [];
  if (oneX) {
    srcSetParts.push(`${oneX} 1x`);
  }
  if (twoX) {
    srcSetParts.push(`${twoX} 2x`);
  }

  return {
    src: baseSrc as string,
    srcSet: srcSetParts.length > 0 ? srcSetParts.join(', ') : undefined,
    placeholder: imageSet.twoX?.thumbnail || imageSet.threeX?.thumbnail,
  };
};

const collectRoomImageSources = (room: Room, hotelImages: ImageSet[]): CarouselImageSource[] => {
  const sourceMap = new Map<string, CarouselImageSource>();

  const addSource = (source?: CarouselImageSource | null) => {
    if (!source || !source.src || sourceMap.has(source.src)) {
      return;
    }

    sourceMap.set(source.src, {
      ...source,
      sizes: source.sizes || DEFAULT_IMAGE_SIZES,
    });
  };

  room.properties?.room_images?.forEach(resource => {
    resource.image_urls?.forEach(url => {
      if (url) {
        addSource({ src: url, sizes: DEFAULT_IMAGE_SIZES });
      }
    });
  });

  room.images?.forEach(imageSet => {
    const responsiveSource = buildSrcSet(imageSet);
    addSource(responsiveSource);
  });

  hotelImages?.forEach(imageSet => {
    const responsiveSource = buildSrcSet(imageSet);
    addSource(responsiveSource);
  });

  return Array.from(sourceMap.values());
};

interface VariantPriceInfo {
  currency: string;
  originalPrice: number | null;
  finalPrice: number | null;
  badge?: string;
  offerTotalPrice?: number | null;
  offerDiscountedPrice?: number | null;
  offerTitle?: string | null;
}

/**
 * Reusable RoomCard component that displays room details
 * with lazy loading for images and videos based on viewport visibility
 */
export function RoomCard({ room, hotelImages, price, originalPrice, currency = 'AED' }: RoomCardProps) {
  const observerOptions = useMemo(() => ({ once: false, rootMargin: '150px', threshold: 0.15 }), []);
  const { ref, isInView: isCardInView, hasEnteredView } = useInView(observerOptions);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(null);
  const [showCancellation, setShowCancellation] = useState(false);
  const imageSources = useMemo(() => collectRoomImageSources(room, hotelImages), [room, hotelImages]);
  const roomVideoUrl = room.properties?.video_url?.med;

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
  const capacityLabel = `2 Adults${maxChildren > 0 ? `, ${maxChildren} Child${maxChildren > 1 ? 'ren' : ''}` : ''}`;
  const variants = room.variants ?? [];
  const hasMoreVariants = variants.length > 2;
  const visibleVariants = variants.slice(0, showAllVariants ? variants.length : 2);

  // Reset variant view state whenever the room changes
  useEffect(() => {
    setShowAllVariants(false);
    setShowCancellation(false);
    if (variants.length > 0) {
      const firstVariantKey = variants[0].variant_id || variants[0].variant_code || `${room.room_type_code}-0`;
      setSelectedVariantKey(firstVariantKey);
    } else {
      setSelectedVariantKey(null);
    }
  }, [room.room_type_code, variants]);

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) {
      return null;
    }

    const matchedVariant = variants.find((variant, index) => {
      const variantKey = variant.variant_id || variant.variant_code || `${room.room_type_code}-${index}`;
      return variantKey === selectedVariantKey;
    });

    return matchedVariant ?? variants[0];
  }, [variants, selectedVariantKey, room.room_type_code]);

  const cancellationInfo = selectedVariant?.cancellation_info;

  const priceInfo = useMemo<VariantPriceInfo>(() => {
    const variantPricing = selectedVariant?.total_price;
    const variantCurrency = variantPricing?.currency ?? currency;
    const promoEntry = variantPricing?.promo_list?.find(entry =>
      typeof entry?.offer_discounted_total_price === 'number' || typeof entry?.offer_total_price === 'number'
    );

    if (promoEntry) {
      const offerTotal = promoEntry.offer_total_price ?? null;
      const offerDiscounted = promoEntry.offer_discounted_total_price ?? offerTotal;
      return {
        currency: variantCurrency,
        originalPrice: offerTotal,
        finalPrice: offerDiscounted,
        badge: promoEntry.offer_title ?? undefined,
        offerTotalPrice: offerTotal,
        offerDiscountedPrice: offerDiscounted,
        offerTitle: promoEntry.offer_title ?? null,
      };
    }

    if (variantPricing) {
      const { total_price, discounted_price } = variantPricing;
      const hasDiscount = Boolean(
        typeof total_price === 'number' && typeof discounted_price === 'number' && discounted_price < total_price,
      );

      return {
        currency: variantCurrency,
        originalPrice: hasDiscount ? total_price ?? null : null,
        finalPrice: discounted_price ?? total_price ?? null,
      };
    }

    const fallbackDiscountPercent =
      originalPrice && price && originalPrice !== price ? Math.round(((originalPrice - price) / originalPrice) * 100) : null;

    return {
      currency,
      originalPrice: originalPrice && price && originalPrice !== price ? originalPrice : null,
      finalPrice: price ?? null,
      badge: fallbackDiscountPercent ? `${fallbackDiscountPercent}% off` : undefined,
    };
  }, [selectedVariant, currency, originalPrice, price]);

  return (
    <div
      ref={ref}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col"
    >
      {hasEnteredView && (
        <MediaCarousel
          videoUrl={roomVideoUrl}
          imageSources={imageSources}
          alt={room.name}
          isActive={isCardInView}
        />
      )}

      <div className="flex-1 p-5 flex flex-col space-y-4">
        <div className="text-sm text-gray-500">{formatRoomName(room.name)}</div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 text-gray-400" />
            {bedType}
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="h-4 w-4 text-gray-400" />
            {capacityLabel}
          </div>
        </div>

        <div className="pt-2 space-y-1">
          <div className="text-xs text-gray-500">Price for 1 night</div>
          <div className="text-xs text-gray-400">Includes taxes & fees</div>
        </div>

        <div className="flex items-end justify-between pt-2">
          <div className="space-y-1">
            {priceInfo.offerTotalPrice != null ? (
              <div className="text-xs text-gray-500">
                Offer total price: <span className="line-through">{priceInfo.currency} {priceInfo.offerTotalPrice.toLocaleString()}</span>
              </div>
            ) : priceInfo.originalPrice != null ? (
              <div className="text-xs line-through text-gray-400">
                {priceInfo.currency} {priceInfo.originalPrice.toLocaleString()}
              </div>
            ) : null}

            {priceInfo.offerDiscountedPrice != null ? (
              <>
                <div className="text-xs text-gray-500">Offer discounted price:</div>
                <div className="text-lg font-semibold text-gray-900">
                  {priceInfo.currency} {priceInfo.offerDiscountedPrice.toLocaleString()}
                </div>
              </>
            ) : (
              <div className="text-lg font-semibold text-gray-900">
                {priceInfo.finalPrice != null
                  ? `${priceInfo.currency} ${priceInfo.finalPrice.toLocaleString()}`
                  : `${priceInfo.currency} —`}
              </div>
            )}

            {priceInfo.offerTitle && (
              <div className="text-xs font-medium text-green-700">Offer: {priceInfo.offerTitle}</div>
            )}
          </div>

          {priceInfo.badge && (
            <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
              {priceInfo.badge}
            </span>
          )}
        </div>

        {variants.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="text-sm font-semibold text-gray-900">Available variants</div>
            <div className="space-y-3">
              {visibleVariants.map((variant, index) => {
                const variantKey = variant.variant_id || variant.variant_code || `${room.room_type_code}-${index}`;
                const isSelected = selectedVariantKey === variantKey;

                const detailProps = (variant.display_properties ?? []).reduce<
                  Partial<Record<VariantDetailKey, VariantDetail>>
                >((acc, prop) => {
                  if (!prop.display_name) {
                    return acc;
                  }

                  const normalizedName = prop.display_name.trim().toLowerCase();
                  const detailKey = DISPLAY_NAME_PROP_MAP[normalizedName];

                  if (!detailKey) {
                    return acc;
                  }

                  acc[detailKey] = {
                    label: prop.display_name,
                    value: prop.value || '—',
                  };

                  return acc;
                }, {});

                return (
                  <VariantCard
                    key={variantKey}
                    name={variant.name || `Variant ${index + 1}`}
                    isSelected={isSelected}
                    onSelect={() => setSelectedVariantKey(variantKey)}
                    mealsIncluded={detailProps.mealsIncluded}
                    bedType={detailProps.bedType}
                    adultOccupancy={detailProps.adultOccupancy}
                    familyOccupancy={detailProps.familyOccupancy}
                  />
                );
              })}

              {hasMoreVariants && (
                <button
                  type="button"
                  onClick={() => setShowAllVariants(prev => !prev)}
                  className="text-xs font-semibold text-teal-600 hover:underline"
                >
                  {showAllVariants ? 'click to show less' : 'click to see more'}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <button
            type="button"
            className={`text-sm font-medium text-left flex items-center gap-1 transition-colors ${cancellationInfo ? 'text-green-600 hover:underline' : 'text-gray-400 cursor-not-allowed'
              }`}
            onClick={() => {
              if (!cancellationInfo) return;
              setShowCancellation(prev => !prev);
            }}
            aria-expanded={showCancellation}
            aria-controls={`cancellation-panel-${room.room_type_code}`}
            disabled={!cancellationInfo}
          >
            <span>Cancellation policy</span>
            <span aria-hidden="true">{showCancellation ? '^' : '>'}</span>
          </button>

          {showCancellation && cancellationInfo && (
            <div
              id={`cancellation-panel-${room.room_type_code}`}
              className="rounded-2xl border border-green-100 bg-green-50 p-4 text-sm text-gray-800 space-y-3"
            >
              {cancellationInfo.free_cancellation_info && (
                <p className="font-semibold text-gray-900">{cancellationInfo.free_cancellation_info}</p>
              )}
              {cancellationInfo.free_cancel_description && (
                <p className="whitespace-pre-line">{cancellationInfo.free_cancel_description}</p>
              )}
              {cancellationInfo.free_amendment_description && (
                <p className="text-xs text-gray-600 whitespace-pre-line">
                  {cancellationInfo.free_amendment_description}
                </p>
              )}

              {cancellationInfo.cancellation_rules?.length ? (
                <div className="space-y-2 pt-2 border-t border-green-100">
                  {cancellationInfo.cancellation_rules.map((rule, index) => (
                    <div key={`${rule.date_info ?? 'rule'}-${index}`} className="space-y-1">
                      {rule.date_info && <p className="font-medium text-gray-900">{rule.date_info}</p>}
                      {rule.description && (
                        <p className="text-gray-700 whitespace-pre-line">{rule.description}</p>
                      )}
                      {rule.cost !== undefined && rule.cost !== null && (
                        <p className="text-xs text-gray-600">Cost: {rule.cost}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>

        <button className="w-full mt-auto rounded-xl bg-green-600 hover:bg-green-700 text-white py-2 font-medium transition">
          Select
        </button>
      </div>
    </div>
  );
}
