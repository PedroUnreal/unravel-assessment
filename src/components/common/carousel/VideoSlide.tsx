import { useEffect, useRef } from 'react';

interface VideoSlideProps {
  url: string;
  isActive: boolean;
  onLoad: () => void;
}

export function VideoSlide({ url, isActive, onLoad }: VideoSlideProps) {
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
