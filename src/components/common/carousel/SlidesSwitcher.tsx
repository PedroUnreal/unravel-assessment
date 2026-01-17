interface SlidesSwitcherProps {
  totalSlides: number;
  currentIndex: number;
  onSlideChange: (index: number) => void;
}

export function SlidesSwitcher({
  totalSlides,
  currentIndex,
  onSlideChange,
}: SlidesSwitcherProps) {
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
          className={`h-2.5 w-2.5 rounded-full border border-white transition-colors cursor-pointer ${
            currentIndex === index
              ? 'bg-white'
              : 'bg-white/40 hover:bg-white/70'
          }`}
          onClick={() => onSlideChange(index)}
        />
      ))}
    </div>
  );
}
