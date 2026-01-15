import { useEffect, useMemo, useRef, useState } from 'react';

export interface CarouselImageSource {
  src: string;
  srcSet?: string;
  sizes?: string;
  placeholder?: string;
}

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

/**
 * Renders a media block that prefers video and falls back to an image carousel
 * with clickable dots in the bottom-left corner.
 */
export function MediaCarousel({
  videoUrl,
  imageSources,
  alt,
  autoRotate = true,
  rotateInterval = DEFAULT_ROTATE_INTERVAL,
  isActive = true,
}: MediaCarouselProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const slides: CarouselSlide[] = useMemo(() => {
    const items: CarouselSlide[] = [];

    // Show videos only if present, otherwise show images
    if (videoUrl) {
      items.push({ type: 'video', url: videoUrl });
    } else {
      imageSources.forEach(source => items.push({ type: 'image', source }));
    }

    return items;
  }, [videoUrl, imageSources]);

  const slidesKey = useMemo(() => JSON.stringify(slides), [slides]);
  const [mediaLoadedKey, setMediaLoadedKey] = useState(slidesKey);
  const [currentIndexKey, setCurrentIndexKey] = useState(slidesKey);
  const [mediaLoaded, setMediaLoaded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
      setCurrentIndex(prev => (prev + 1) % slides.length);
    }, rotateInterval);

    return () => window.clearInterval(intervalId);
  }, [autoRotate, slides.length, rotateInterval, isActive]);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || slides[currentIndex]?.type !== 'video') {
      return;
    }

    if (isActive) {
      const playPromise = node.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.catch(() => {
          // Autoplay might be blocked; ignore errors silently.
        });
      }
    } else {
      node.pause();
    }
  }, [isActive, currentIndex, slides]);

  if (slides.length === 0) {
    return null;
  }

  const currentSlide = slides[currentIndex];
  const handleMediaLoad = () => setMediaLoaded(true);
  const isVideo = currentSlide.type === 'video';

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setCurrentIndex(prev => (prev + 1) % slides.length);
    } else if (isRightSwipe) {
      setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
    }
  };

  return (
    <div
      className="relative h-56 w-full bg-gray-100 overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isVideo ? (
        <video
          ref={videoRef}
          src={currentSlide.url}
          autoPlay={isActive}
          muted
          loop
          playsInline
          preload={isActive ? 'auto' : 'none'}
          className={`h-full w-full object-cover transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoadedData={handleMediaLoad}
          onError={handleMediaLoad}
        />
      ) : (
        <img
          src={currentSlide.source.src}
          srcSet={currentSlide.source.srcSet}
          sizes={currentSlide.source.sizes}
          alt={alt}
          loading="lazy"
          decoding="async"
          onLoad={handleMediaLoad}
          onError={handleMediaLoad}
          style={currentSlide.source.placeholder ? { backgroundImage: `url(${currentSlide.source.placeholder})` } : undefined}
          className={`h-full w-full object-cover transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
        />
      )}

      {!mediaLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

      {slides.length > 1 && (
        <div className="absolute left-4 bottom-4 flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2.5 w-2.5 rounded-full border border-white transition-colors cursor-pointer ${currentIndex === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
                }`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
