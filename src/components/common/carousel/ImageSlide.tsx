import { ResponsiveImage } from '../ResponsiveImage';

export interface CarouselImageSource {
  src: string;
  srcSet?: string;
  sizes?: string;
  placeholder?: string;
}

interface ImageSlideProps {
  source: CarouselImageSource;
  alt: string;
  onLoad: () => void;
}

export function ImageSlide({ source, alt, onLoad }: ImageSlideProps) {
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
