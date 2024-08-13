'use server';

import { revalidateTag } from 'next/cache';

export async function revalidateTidbitCollections() {
  revalidateTag('tidbit-collections');
}
