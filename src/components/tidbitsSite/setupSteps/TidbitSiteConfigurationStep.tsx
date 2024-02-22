import Button from '@/components/core/buttons/Button';
import {
  useGetSpaceFromCreatorQuery,
  useRoute53RecordQuery,
  useUpsertRoute53RecordMutation,
  useUpsertVercelDomainRecordMutation,
  useVercelDomainRecordQuery,
} from '@/graphql/generated/generated-types';
import { useSession } from 'next-auth/react';

export default function TidbitSiteConfigurationStep() {
  const { data: session } = useSession();
  const { data: spaceResponse, loading } = useGetSpaceFromCreatorQuery({
    variables: {
      creatorUsername: session?.username!,
    },
  });

  const { data: route53Record } = useRoute53RecordQuery({
    variables: {
      spaceId: spaceResponse?.getSpaceFromCreator?.id!,
    },
    skip: !spaceResponse?.getSpaceFromCreator?.id,
  });

  const { data: vercelDomainRecord } = useVercelDomainRecordQuery({
    variables: {
      spaceId: spaceResponse?.getSpaceFromCreator?.id!,
    },
    skip: !spaceResponse?.getSpaceFromCreator?.id,
  });

  const [upsertRoute53RecordMutation] = useUpsertRoute53RecordMutation();

  const [upsertVercelDomainRecordMutation] = useUpsertVercelDomainRecordMutation();

  const upsertRoute53Record = async () => {
    try {
      await upsertRoute53RecordMutation({
        variables: {
          spaceId: spaceResponse?.getSpaceFromCreator?.id!,
        },
        refetchQueries: ['Route53Record'],
      });
    } catch (e) {
      console.error('Error upserting route53 record', e);
    }
  };

  const upsertVercelDomainRecord = async () => {
    try {
      await upsertVercelDomainRecordMutation({
        variables: {
          spaceId: spaceResponse?.getSpaceFromCreator?.id!,
        },
        refetchQueries: ['VercelDomainRecord'],
      });
    } catch (e) {
      console.error('Error upserting vercel domain record', e);
    }
  };

  if (loading) return <div className="flex justify-center items-center">Loading...</div>;
  if (!spaceResponse) return <div className="flex justify-center items-center">No data found</div>;

  return (
    <div className="flex justify-center items-center flex-col mt-16">
      <h1 className="text-3xl font-bold">{'You already have a space named ' + spaceResponse.getSpaceFromCreator?.name}</h1>
      <p className="text-2xl mt-4">{'Space id is ' + spaceResponse.getSpaceFromCreator?.id}</p>
      <p className="text-2xl mt-4">{'Route53 record is ' + JSON.stringify(route53Record || {})}</p>
      <p className="text-2xl mt-4">{'Vercel domain record is ' + JSON.stringify(vercelDomainRecord || {})}</p>

      <Button onClick={upsertRoute53Record} className="mt-4" variant="contained" primary>
        Create Route 53 Record
      </Button>

      <Button onClick={upsertVercelDomainRecord} className="mt-4" variant="contained" primary>
        Create Vercel Domain Record
      </Button>
    </div>
  );
}
