import { useState, useMemo, useEffect } from 'react';
import type { Room } from '../types/hotel';
import { useInView } from '../hooks/useInView';
import { MediaCarousel, type CarouselImageSource } from './utils/MediaCarousel';
import { VariantCard } from './VariantCard';

interface RoomCardProps {
  room: Room;
}

const DEFAULT_IMAGE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
const OBSERVER_OPTIONS = { once: false, rootMargin: '150px', threshold: 0.15 };
const INITIAL_VISIBLE_VARIANTS = 2;

const collectRoomImageSources = (room: Room): CarouselImageSource[] => {
  return (
    room.properties?.room_images?.flatMap(resource =>
      resource.image_urls?.filter(Boolean).map(url => ({
        src: url,
        sizes: DEFAULT_IMAGE_SIZES,
      })) ?? []
    ) ?? []
  );
};

export function RoomCard({ room }: RoomCardProps) {
  const { ref, isInView: isCardInView, hasEnteredView } = useInView(OBSERVER_OPTIONS);
  const [showAllVariants, setShowAllVariants] = useState(false);
  const variants = useMemo(() => room.variants ?? [], [room.variants]);

  const initialVariantKey = useMemo(() => {
    if (variants.length > 0) {
      return variants[0].variant_id;
    }
    return null;
  }, [variants]);

  const [selectedVariantKey, setSelectedVariantKey] = useState<string | null>(initialVariantKey);

  const imageSources = useMemo(() => collectRoomImageSources(room), [room]);
  const roomVideoUrl = room.properties?.video_url?.med;

  const hasMoreVariants = variants.length > INITIAL_VISIBLE_VARIANTS;
  const visibleVariants = useMemo(
    () => variants.slice(0, showAllVariants ? variants.length : INITIAL_VISIBLE_VARIANTS),
    [variants, showAllVariants]
  );

  // Reset variant selection when room changes
  useEffect(() => {
    setSelectedVariantKey(initialVariantKey);
  }, [initialVariantKey]);

  return (
    <div
      ref={ref}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-full"
    >
      {hasEnteredView && (
        <MediaCarousel
          videoUrl={roomVideoUrl}
          imageSources={imageSources}
          alt={room.name}
          isActive={isCardInView}
        />
      )}

      <div className="p-5 flex flex-col gap-4">
        <div className="text-lg font-semibold text-gray-900 truncate">{room.name}</div>
        {variants.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-gray-100">
            <div className="text-sm font-semibold text-gray-00">Available variants</div>
            <div className="space-y-3">
              {visibleVariants.map((variant) => {
                const variantKey = variant.variant_id;
                const isSelected = selectedVariantKey === variantKey;

                return (
                  <VariantCard
                    key={variantKey}
                    variant={variant}
                    isSelected={isSelected}
                    onSelect={() => setSelectedVariantKey(variantKey)}
                    onSelectClick={() => {
                      // Handle select action here
                      console.log('Selected variant:', variantKey);
                    }}
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
      </div>
    </div>
  );
}
