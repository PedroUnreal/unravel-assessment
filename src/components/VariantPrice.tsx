import { BadgePercent } from 'lucide-react';
import type { RoomVariant } from "../types/hotel";

export interface VariantPriceInfo {
    currency: string;
    originalPrice: number | null;
    finalPrice: number | null;
    offerLabel?: string | null;
}

interface VariantPriceProps {
    variant: RoomVariant;
}

const calculateVariantPrice = (variant: RoomVariant): VariantPriceInfo | null => {
    const variantPricing = variant?.total_price;
    const variantCurrency = variantPricing?.currency;

    if (!variantCurrency) {
        return null;
    }

    const promoEntry = variantPricing?.promo_list?.find((entry) =>
        typeof entry?.offer_discounted_total_price === 'number' || typeof entry?.offer_total_price === 'number'
    );

    if (promoEntry) {
        const offerTotal = promoEntry.offer_total_price ?? null;
        const offerDiscounted = promoEntry.offer_discounted_total_price ?? offerTotal;
        return {
            currency: variantCurrency,
            originalPrice: offerTotal != null ? Math.round(offerTotal) : null,
            finalPrice: offerDiscounted != null ? Math.round(offerDiscounted) : null,
            offerLabel: promoEntry.offer_title ?? null,
        };
    }

    if (variantPricing) {
        const { total_price, discounted_price } = variantPricing;
        const hasDiscount = Boolean(
            typeof total_price === 'number' && typeof discounted_price === 'number' && discounted_price < total_price,
        );

        return {
            currency: variantCurrency,
            originalPrice: hasDiscount && total_price != null ? Math.round(total_price) : null,
            finalPrice: discounted_price != null ? Math.round(discounted_price) : total_price != null ? Math.round(total_price) : null,
        };
    }

    return {
        currency: variantCurrency,
        originalPrice: null,
        finalPrice: null,
    };
};

export function VariantPrice({ variant }: VariantPriceProps) {
    const priceInfo = calculateVariantPrice(variant);

    if (!priceInfo) {
        return null;
    }

    return (
        <div className="pt-3 border-t border-gray-200">
            <div className="space-y-1">
                <div className="text-xs text-gray-500">Price for 1 night</div>
                <div className="text-xs text-gray-400">Includes taxes & fees</div>
            </div>

            <div className="flex items-center gap-2 flex-wrap pt-2">
                {priceInfo.originalPrice != null && (
                    <span className="text-sm line-through text-gray-400">
                        {priceInfo.currency} {priceInfo.originalPrice.toLocaleString()}
                    </span>
                )}

                <span className="text-lg font-bold text-gray-900">
                    {priceInfo.finalPrice != null
                        ? `${priceInfo.currency} ${priceInfo.finalPrice.toLocaleString()}`
                        : `${priceInfo.currency} —`}
                </span>

                {priceInfo.offerLabel && (
                    <span className="text-xs font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 px-2 py-1 rounded-full flex items-center gap-1">
                        <BadgePercent size={14} />
                        {priceInfo.offerLabel}
                    </span>
                )}
            </div>
        </div>
    );
}
