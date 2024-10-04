'use server';

import { TidbitCollectionTags } from '@/utils/api/fetchTags';
import { revalidateTag } from 'next/cache';

export async function revalidateTidbitCollections() {
  revalidateTag(TidbitCollectionTags.GET_TIDBIT_COLLECTIONS.toString());
}

export async function action(tag: string) {
  revalidateTag(tag);
}
