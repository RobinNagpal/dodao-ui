import { revalidateTag } from 'next/cache';

export const TARIFF_SECTIONS_LISTING_TAG = 'tariff_sections_listing' as const;

export const revalidateTariffSectionsListingTag = () => revalidateTag(TARIFF_SECTIONS_LISTING_TAG);

export const TARIFF_CHAPTERS_LISTING_TAG = 'tariff_chapters_listing' as const;

export const revalidateTariffChaptersListingTag = () => revalidateTag(TARIFF_CHAPTERS_LISTING_TAG);

export const tariffChapterDetailCacheTag = (chapterNumber: number) => `tariff_chapter_detail_${chapterNumber.toString().padStart(2, '0')}` as const;

export const revalidateTariffChapterDetailTag = (chapterNumber: number) => revalidateTag(tariffChapterDetailCacheTag(chapterNumber));

export const candidateCodesCacheTag = (hts10: string) => `tariff_candidate_codes_${hts10}` as const;

export const revalidateCandidateCodesTag = (hts10: string) => revalidateTag(candidateCodesCacheTag(hts10));
