import { Utensils, Bed, User, Users } from 'lucide-react';
import { VariantPrice } from './VariantPrice';
import { CancellationPolicy } from './CancellationPolicy';
import type { RoomVariant } from '../../types/hotel';

export type VariantDetailKey =
  | 'mealsIncluded'
  | 'bedType'
  | 'adultOccupancy'
  | 'familyOccupancy';

const PROPERTY_ICONS: Record<
  string,
  React.ComponentType<{ size?: number; className?: string }>
> = {
  'Meals included': Utensils,
  'Bed type': Bed,
  'Adult occupancy': User,
  'Family occupancy': Users,
};

export interface VariantCardProps {
  variant: RoomVariant;
  isSelected: boolean;
  onSelect: () => void;
  onSelectClick?: () => void;
  roomTypeCode?: string;
}

/**
 * VariantCard renders a selectable block showing the structured attributes
 * for a room variant (meals included, bed/occupancy details, etc.).
 */
export function VariantCard({
  variant,
  isSelected,
  onSelect,
  onSelectClick,
}: VariantCardProps) {
  const name = variant.name || 'Variant';
  const displayProperties = variant.display_properties ?? [];

  const variantClasses = `w-full text-left rounded-xl border p-4 space-y-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 cursor-pointer ${
    isSelected
      ? 'border-teal-500 bg-teal-50 shadow-sm'
      : 'border-gray-100 bg-gray-50 hover:border-teal-200'
  }`;

  return (
    <div
      aria-pressed={isSelected}
      className={variantClasses}
      onClick={onSelect}
    >
      <div className="text-sm font-semibold text-gray-900">
        {name || 'Variant'}
      </div>

      {displayProperties.length > 0 ? (
        <div className="space-y-3">
          {displayProperties.map((prop, index) => {
            const Icon = prop.display_name
              ? PROPERTY_ICONS[prop.display_name]
              : null;
            return prop.display_name ? (
              <div key={index} className="flex items-center gap-2">
                {Icon && (
                  <Icon size={16} className="text-gray-500 flex-shrink-0" />
                )}
                <span className="text-sm text-gray-900">
                  {prop.value || '—'}
                </span>
              </div>
            ) : null;
          })}
        </div>
      ) : (
        <div className="text-xs text-gray-500">
          No additional details provided.
        </div>
      )}

      {/* Price Information */}
      <VariantPrice variant={variant} />

      {/* Cancellation Policy */}
      <CancellationPolicy cancellationInfo={variant.cancellation_info} />

      {/* Select Button */}
      {onSelectClick && (
        <div className="pt-2" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectClick();
            }}
            className="w-full rounded-xl bg-green-600 hover:bg-green-700 text-white py-2 font-medium transition cursor-pointer"
          >
            Select
          </button>
        </div>
      )}
    </div>
  );
}
