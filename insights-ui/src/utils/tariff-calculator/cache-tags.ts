import { revalidateTag } from 'next/cache';

export const TARIFF_SECTIONS_LISTING_TAG = 'tariff_sections_listing' as const;

export const revalidateTariffSectionsListingTag = () => revalidateTag(TARIFF_SECTIONS_LISTING_TAG);
