import FavouritesClient from '@/app/favourites/FavouritesClient';
import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import { KoalaGainsSpaceId } from '@/types/koalaGainsConstants';
import { getServerSession } from 'next-auth/next';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

async function fetchFavouritesData() {
  try {
    const cookieStore = await cookies();
    
    // Convert cookies to header string
    const cookieHeader = cookieStore.getAll()
      .map(cookie => `${cookie.name}=${cookie.value}`)
      .join('; ');

    const [favouritesRes, listsRes, tagsRes] = await Promise.all([
      fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/favourite-tickers`, {
        headers: {
          Cookie: cookieHeader,
        },
        cache: 'no-store',
      }),
      fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-lists`, {
        headers: {
          Cookie: cookieHeader,
        },
        cache: 'no-store',
      }),
      fetch(`${getBaseUrl()}/api/${KoalaGainsSpaceId}/users/user-ticker-tags`, {
        headers: {
          Cookie: cookieHeader,
        },
        cache: 'no-store',
      }),
    ]);

    const favourites = favouritesRes.ok ? (await favouritesRes.json()).favouriteTickers : [];
    const lists = listsRes.ok ? (await listsRes.json()).lists : [];
    const tags = tagsRes.ok ? (await tagsRes.json()).tags : [];

    return { favourites, lists, tags };
  } catch (err) {
    console.error('Error loading data:', err);
    return { favourites: [], lists: [], tags: [] };
  }
}

export default async function FavouritesPage() {
  const session = await getServerSession();

  if (!session) {
    redirect('/login');
  }

  const { favourites, lists, tags } = await fetchFavouritesData();

  console.log('favourites123', favourites);

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto">
        <FavouritesClient
          initialFavourites={favourites}
          initialLists={lists}
          initialTags={tags}
        />
      </div>
    </PageWrapper>
  );
}

