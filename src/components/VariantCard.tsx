export interface VariantDetail {
    label: string;
    value: string;
}

export type VariantDetailKey = 'mealsIncluded' | 'bedType' | 'adultOccupancy' | 'familyOccupancy';

export interface VariantCardProps {
    name?: string;
    isSelected: boolean;
    onSelect: () => void;
    mealsIncluded?: VariantDetail;
    bedType?: VariantDetail;
    adultOccupancy?: VariantDetail;
    familyOccupancy?: VariantDetail;
}

const DETAIL_RENDER_ORDER: VariantDetailKey[] = [
    'mealsIncluded',
    'bedType',
    'adultOccupancy',
    'familyOccupancy',
];

/**
 * VariantCard renders a selectable block showing the structured attributes
 * for a room variant (meals included, bed/occupancy details, etc.).
 */
export function VariantCard({
    name,
    isSelected,
    onSelect,
    mealsIncluded,
    bedType,
    adultOccupancy,
    familyOccupancy,
}: VariantCardProps) {
    const detailMap: Record<VariantDetailKey, VariantDetail | undefined> = {
        mealsIncluded,
        bedType,
        adultOccupancy,
        familyOccupancy,
    };

    const detailKeys = DETAIL_RENDER_ORDER.filter(key => detailMap[key]);
    const variantClasses = `w-full text-left rounded-xl border p-4 space-y-3 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 ${isSelected ? 'border-teal-500 bg-teal-50 shadow-sm' : 'border-gray-100 bg-gray-50 hover:border-teal-200'
        }`;

    return (
        <button type="button" aria-pressed={isSelected} className={variantClasses} onClick={onSelect}>
            <div className="text-sm font-semibold text-gray-900">
                {name || 'Variant'}
            </div>

            {detailKeys.length > 0 ? (
                <div className="space-y-3">
                    {detailKeys.map(key => {
                        const detail = detailMap[key]!;
                        return (
                            <div key={key} className="flex flex-col gap-0.5">
                                <span className="text-xs text-gray-500">{detail.label}</span>
                                <span className="text-sm text-gray-900">{detail.value}</span>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-xs text-gray-500">No additional details provided.</div>
            )}
        </button>
    );
}
