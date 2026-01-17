import { useEffect, useMemo, useState } from 'react';
import { useSwipeNavigation } from './useSwipeNavigation';
import { VideoSlide } from './VideoSlide';
import { ImageSlide, type CarouselImageSource } from './ImageSlide';
import { SlidesSwitcher } from './SlidesSwitcher';

interface MediaCarouselProps {
  videoUrl?: string;
  imageSources: CarouselImageSource[];
  alt: string;
  autoRotate?: boolean;
  rotateInterval?: number;
  isActive?: boolean;
}

type CarouselSlide =
  | { type: 'video'; url: string }
  | { type: 'image'; source: CarouselImageSource };

const DEFAULT_ROTATE_INTERVAL = 10000;

export function MediaCarousel({
  videoUrl,
  imageSources,
  alt,
  autoRotate = true,
  rotateInterval = DEFAULT_ROTATE_INTERVAL,
  isActive = true,
}: MediaCarouselProps) {
  const slides: CarouselSlide[] = useMemo(() => {
    const items: CarouselSlide[] = [];

    // Show videos only if present, otherwise show images
    if (videoUrl) {
      items.push({ type: 'video', url: videoUrl });
    } else {
      imageSources.forEach((source) => items.push({ type: 'image', source }));
    }

    return items;
  }, [videoUrl, imageSources]);

  const slidesKey = useMemo(() => JSON.stringify(slides), [slides]);
  const [mediaLoadedKey, setMediaLoadedKey] = useState(slidesKey);
  const [currentIndexKey, setCurrentIndexKey] = useState(slidesKey);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNavigation = (direction: 'next' | 'prev') => {
    if (direction === 'next') {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    } else {
      setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
    }
  };

  const swipeHandlers = useSwipeNavigation(handleNavigation);

  // Reset states when slides change by comparing keys
  if (mediaLoadedKey !== slidesKey) {
    setMediaLoadedKey(slidesKey);
    setMediaLoaded(false);
  }

  if (currentIndexKey !== slidesKey) {
    setCurrentIndexKey(slidesKey);
    setCurrentIndex(0);
  }

  useEffect(() => {
    if (!autoRotate || slides.length <= 1 || !isActive) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, rotateInterval);

    return () => window.clearInterval(intervalId);
  }, [autoRotate, slides.length, rotateInterval, isActive]);

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];
  const handleMediaLoad = () => setMediaLoaded(true);
  const isVideo = currentSlide.type === 'video';

  return (
    <div
      className="relative h-56 w-full bg-gray-100 overflow-hidden"
      onTouchStart={swipeHandlers.handleTouchStart}
      onTouchMove={swipeHandlers.handleTouchMove}
      onTouchEnd={swipeHandlers.handleTouchEnd}
    >
      <div
        className={`transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        {isVideo ? (
          <VideoSlide
            url={currentSlide.url}
            isActive={isActive}
            onLoad={handleMediaLoad}
          />
        ) : (
          <ImageSlide
            source={currentSlide.source}
            alt={alt}
            onLoad={handleMediaLoad}
          />
        )}
      </div>

      {!mediaLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}

      <SlidesSwitcher
        totalSlides={slides.length}
        currentIndex={currentIndex}
        onSlideChange={setCurrentIndex}
      />
    </div>
  );
}
