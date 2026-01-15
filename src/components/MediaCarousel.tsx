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
    const [mediaLoaded, setMediaLoaded] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userInteracted, setUserInteracted] = useState(false);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    const sanitizedImages = useMemo(() => imageSources.filter(source => Boolean(source?.src)), [imageSources]);

    const slides: CarouselSlide[] = useMemo(() => {
        const items: CarouselSlide[] = [];
        if (videoUrl) {
            items.push({ type: 'video', url: videoUrl });
        }
        sanitizedImages.forEach(source => items.push({ type: 'image', source }));
        return items;
    }, [videoUrl, sanitizedImages]);

    const hasVideo = Boolean(videoUrl);

    useEffect(() => {
        setMediaLoaded(false);
    }, [slides, currentIndex]);

    useEffect(() => {
        setCurrentIndex(0);
        setUserInteracted(false);
    }, [slides.length, videoUrl]);

    useEffect(() => {
        if (!autoRotate || slides.length <= 1 || !isActive) {
            return;
        }

        if (hasVideo && !userInteracted) {
            return;
        }

        const intervalId = window.setInterval(() => {
            setCurrentIndex(prev => {
                const nextIndex = (prev + 1) % slides.length;
                if (slides[nextIndex].type === 'video' && slides.length > 1) {
                    return (nextIndex + 1) % slides.length;
                }
                return nextIndex;
            });
        }, rotateInterval);

        return () => window.clearInterval(intervalId);
    }, [autoRotate, slides, hasVideo, userInteracted, rotateInterval, isActive]);

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

    const handleDotClick = (index: number) => {
        setCurrentIndex(index);
        setUserInteracted(true);
    };

    return (
        <div className="relative h-56 w-full bg-gray-100 overflow-hidden">
            {currentSlide.type === 'video' ? (
                <>
                    <video
                        ref={videoRef}
                        src={currentSlide.url}
                        autoPlay={isActive}
                        muted
                        loop
                        playsInline
                        preload={isActive ? 'auto' : 'none'}
                        className={`h-full w-full object-cover transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                        onLoadedData={() => setMediaLoaded(true)}
                    />
                    {!mediaLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                </>
            ) : (
                <>
                    <img
                        src={currentSlide.source.src}
                        srcSet={currentSlide.source.srcSet}
                        sizes={currentSlide.source.sizes}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        onLoad={() => setMediaLoaded(true)}
                        style={currentSlide.source.placeholder ? { backgroundImage: `url(${currentSlide.source.placeholder})` } : undefined}
                        className={`h-full w-full object-cover transition-opacity duration-300 ${mediaLoaded ? 'opacity-100' : 'opacity-0'}`}
                    />
                    {!mediaLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse" />}
                </>
            )}

            <div className="absolute left-4 bottom-4 flex items-center gap-2">
                {slides.map((slide, index) => (
                    <button
                        key={`media-dot-${index}`}
                        type="button"
                        aria-label={`Show ${slide.type === 'video' ? 'video' : 'image'} ${index + 1}`}
                        className={`h-2.5 w-2.5 rounded-full border border-white transition-colors ${currentIndex === index ? 'bg-white' : 'bg-white/40 hover:bg-white/70'}`}
                        onClick={() => handleDotClick(index)}
                    />
                ))}
            </div>
        </div>
    );
}
