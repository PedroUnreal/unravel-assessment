export interface ResponsiveImageProps {
    src: string;
    srcSet?: string;
    sizes?: string;
    alt: string;
    className?: string;
    loading?: 'lazy' | 'eager';
    decoding?: 'async' | 'sync' | 'auto';
    placeholder?: string;
    onLoad?: () => void;
    onError?: () => void;
}

export function ResponsiveImage({
    src,
    srcSet,
    sizes,
    alt,
    className = '',
    loading = 'lazy',
    decoding = 'async',
    placeholder,
    onLoad,
    onError,
}: ResponsiveImageProps) {
    return (
        <img
            src={src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            loading={loading}
            decoding={decoding}
            onLoad={onLoad}
            onError={onError}
            style={placeholder ? { backgroundImage: `url(${placeholder})` } : undefined}
            className={className}
        />
    );
}
