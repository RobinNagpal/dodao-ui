import { useGetSpaceFromCreatorQuery } from '@/graphql/generated/generated-types';
import { useSession } from 'next-auth/react';

export default function Configuration() {
  const { data: session } = useSession();
  const { data, loading } = useGetSpaceFromCreatorQuery({
    variables: {
      creatorId: session?.username!,
    },
  });

  if (loading) return <div className="flex justify-center items-center">Loading...</div>;
  if (!data) return <div className="flex justify-center items-center">No data found</div>;

  return (
    <div className="flex justify-center items-center flex-col mt-16">
      <h1 className="text-3xl font-bold">{'You already have a space named ' + data.getSpaceFromCreator?.name}</h1>
      <p className="text-2xl mt-4">{'Space id is ' + data.getSpaceFromCreator?.id}</p>
    </div>
  );
}
