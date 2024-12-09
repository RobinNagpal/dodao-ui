import Homepage from '@/components/home/Home';
import getBaseUrl from '@dodao/web-core/utils/api/getBaseURL';

export default async function Home() {
  const data = await fetch(`${getBaseUrl()}/api/tweet-collections`);
  const tweetCollections = await data.json();

  return <Homepage tweetCollections={tweetCollections} />;
}
