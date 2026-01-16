import { useEffect, useMemo, useRef, useState } from 'react';
import { ResponsiveImage } from './ResponsiveImage';

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
const MIN_SWIPE_DISTANCE = 50;

interface VideoSlideProps {
  url: string;
  isActive: boolean;
  onLoad: () => void;
}

function VideoSlide({ url, isActive, onLoad }: VideoSlideProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const node = videoRef.current;
    if (!node) return;

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
  }, [isActive]);

  return (
    <video
      ref={videoRef}
      src={url}
      autoPlay={isActive}
      muted
      loop
      playsInline
      preload={isActive ? 'auto' : 'none'}
      className="w-full h-full object-cover object-center"
      onLoadedData={onLoad}
      onError={onLoad}
    />
  );
}

interface ImageSlideProps {
  source: CarouselImageSource;
  alt: string;
  onLoad: () => void;
}

function ImageSlide({ source, alt, onLoad }: ImageSlideProps) {
  return (
    <ResponsiveImage
      src={source.src}
      srcSet={source.srcSet}
      sizes={source.sizes}
      alt={alt}
      placeholder={source.placeholder}
      onLoad={onLoad}
      onError={onLoad}
      className="w-full h-full object-cover object-center"
    />
  );
}

interface SlidesSwitcherProps {
  totalSlides: number;
  currentIndex: number;
  onSlideChange: (index: number) => void;
}

function SlidesSwitcher({ totalSlides, currentIndex, onSlideChange }: SlidesSwitcherProps) {
  if (totalSlides <= 1) {
    return null;
  }

  return (
    <div className="absolute left-4 bottom-4 flex items-center gap-2">
      {Array.from({ length: totalSlides }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`Go to slide ${index + 1}`}
          className={`h-2.5 w-2.5 rounded-full border border-white transition-colors cursor-pointer ${currentIndex === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'
            }`}
          onClick={() => onSlideChange(index)}
        />
      ))}
    </div>
  );
}

interface SwipeHandlers {
  handleTouchStart: (e: React.TouchEvent) => void;
  handleTouchMove: (e: React.TouchEvent) => void;
  handleTouchEnd: () => void;
}

function useSwipeNavigation(
  onNavigate: (direction: 'next' | 'prev') => void
): SwipeHandlers {
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

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
    const isLeftSwipe = distance > MIN_SWIPE_DISTANCE;
    const isRightSwipe = distance < -MIN_SWIPE_DISTANCE;

    if (isLeftSwipe) {
      onNavigate('next');
    } else if (isRightSwipe) {
      onNavigate('prev');
    }
  };

  return {
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
  };
}

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
      imageSources.forEach(source => items.push({ type: 'image', source }));
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
      setCurrentIndex(prev => (prev + 1) % slides.length);
    } else {
      setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
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
      setCurrentIndex(prev => (prev + 1) % slides.length);
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
      <div className={`transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}>
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

      {!mediaLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}

      <SlidesSwitcher
        totalSlides={slides.length}
        currentIndex={currentIndex}
        onSlideChange={setCurrentIndex}
      />
    </div>
  );
}
