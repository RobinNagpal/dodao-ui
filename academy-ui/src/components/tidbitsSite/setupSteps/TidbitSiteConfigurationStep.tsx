import ByteCollectionsCard from '@/components/byteCollection/ByteCollections/ByteCollectionsCard/ByteCollectionsCard';
import UpdateThemeModal, { ColorLabels, ThemeColorsKeys } from '@/components/spaces/Edit/Theme/UpdateThemeModal';
import {
  ByteCollectionFragment,
  ThemeColors,
  useGetSpaceFromCreatorQuery,
  useRoute53RecordQuery,
  useVercelDomainRecordQuery,
} from '@/graphql/generated/generated-types';
import Button from '@dodao/web-core/components/core/buttons/Button';
import { CssTheme, ThemeKey, themes } from '@dodao/web-core/src/components/app/themes';
import { Session } from '@dodao/web-core/types/auth/Session';
import { isEmpty } from 'lodash';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import React, { CSSProperties, useEffect } from 'react';

export interface TidbitSiteConfigurationStepProps {
  goToPreviousStep: () => void;
}

export default function TidbitSiteConfigurationStep({ goToPreviousStep }: TidbitSiteConfigurationStepProps) {
  const [showThemeUpdateModal, setShowThemeUpdateModal] = React.useState(false);
  const { data: sessionData } = useSession();
  const session: Session | null = sessionData as Session | null;
  const { data: spaceResponse } = useGetSpaceFromCreatorQuery({
    variables: {
      creatorUsername: session?.username!,
    },
    skip: !session?.username,
  });

  const space = spaceResponse?.getSpaceFromCreator;
  const skin = space?.skin;
  const theme: ThemeKey = space?.skin && Object.keys(CssTheme).includes(skin || '') ? (skin as CssTheme) : CssTheme.GlobalTheme;
  const themeColors: ThemeColors = space?.themeColors || themes[theme];
  const router = useRouter();
  const style = {
    '--primary-color': themeColors.primaryColor,
    '--bg-color': themeColors.bgColor,
    '--text-color': themeColors.textColor,
    '--link-color': themeColors.linkColor,
    '--heading-color': themeColors.headingColor,
    '--border-color': themeColors.borderColor,
    '--block-bg': themeColors.blockBg,
  } as CSSProperties;
  const byteCollection: ByteCollectionFragment = {
    id: 'b757246b-1b08-42ce-a8cb-a9ce19bc78b3',
    name: 'About DEX',
    description: 'This collection of Tidbits explains different exchange models and the benefits of AMM',
    status: 'DRAFT',
    byteIds: ['centralized-vs-decentralized-exchange-uniswap', 'amm-benefits-uniswap'],
    priority: 50,
    bytes: [
      {
        byteId: 'centralized-vs-decentralized-exchange-uniswap_1',
        name: 'Centralized vs Decentralized Exchange',
        content: 'Centralized vs Decentralized Exchanges and AMMs',
        archive: false,
        __typename: 'ByteCollectionByte',
      },
      {
        byteId: 'amm-benefits-uniswap',
        name: 'AMM Benefits',
        content: 'Benefits of Automated Market Maker over Order Book',
        archive: false,
        __typename: 'ByteCollectionByte',
      },
      {
        byteId: 'centralized-vs-decentralized-exchange-uniswap_2',
        name: 'Centralized vs Decentralized Exchange',
        content: 'Centralized vs Decentralized Exchanges and AMMs',
        archive: false,
        __typename: 'ByteCollectionByte',
      },
    ],
    demos: [],
    shorts: [],
    __typename: 'ByteCollection',
  };

  const { data: route53Record, refetch: refetchRoute53Record } = useRoute53RecordQuery({
    variables: {
      spaceId: spaceResponse?.getSpaceFromCreator?.id!,
    },
    skip: !spaceResponse?.getSpaceFromCreator?.id,
  });

  const { data: vercelDomainRecord, refetch: refetchVercelRecord } = useVercelDomainRecordQuery({
    variables: {
      spaceId: spaceResponse?.getSpaceFromCreator?.id!,
    },
    skip: !spaceResponse?.getSpaceFromCreator?.id,
  });

  useEffect(() => {
    let route53Interval: NodeJS.Timeout | undefined;
    let vercelInterval: NodeJS.Timeout | undefined;
    if (isEmpty(route53Record?.payload)) {
      route53Interval = setInterval(() => {
        if (spaceResponse?.getSpaceFromCreator?.id) {
          refetchRoute53Record();
        }
      }, 2000);
    }
    if (isEmpty(vercelDomainRecord?.vercelDomainRecord)) {
      vercelInterval = setInterval(() => {
        if (spaceResponse?.getSpaceFromCreator?.id) {
          refetchVercelRecord();
        }
      }, 2000);
    }
    return () => {
      if (route53Interval) {
        clearInterval(route53Interval);
      }
      if (vercelInterval) {
        clearInterval(vercelInterval);
      }
    };
  });

  return (
    <div className="flex flex-col mt-16 sm:px-0 px-4">
      <div className="flex flex-col md:flex-row w-full">
        <div className="md:flex-auto">
          <h1 className="font-semibold leading-6 text-lg md:text-2xl">Theme Details</h1>
          <p className="mt-2 text-sm md:text-base">Please provide theme details for your space.</p>
        </div>
        <Button onClick={() => setShowThemeUpdateModal(true)} className="mt-4" variant="contained" primary>
          Edit
        </Button>
      </div>

      <div className="mt-4">
        <div className="flex flex-col md:flex-row flex-wrap">
          <div className="w-full md:w-1/2 mt-4">
            {Object.entries(ColorLabels).map((e) => {
              const [colorKey, label] = e as [ThemeColorsKeys, string];
              const colorValue = themeColors[colorKey];
              return (
                <div key={colorKey} className="flex justify-between mb-2">
                  <label className="ml-7">{label}</label>
                  <div className="grid grid-cols-2	">
                    <input type="color" className="w-12 h-8 mr-8" value={colorValue} disabled />
                    <div>{colorValue}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="w-full md:mt-0 mt-4 md:w-1/2 p-2 md:p-4" style={style}>
            <ByteCollectionsCard byteCollection={byteCollection} isEditingAllowed={false} viewByteBaseUrl={'/'} space={space!} />
          </div>
        </div>
      </div>
      {showThemeUpdateModal && (
        <UpdateThemeModal byteCollection={byteCollection} space={space!} open={showThemeUpdateModal} onClose={() => setShowThemeUpdateModal(false)} />
      )}
      {JSON.stringify(route53Record || {})}
      {JSON.stringify(vercelDomainRecord || {})}
      <div className="flex items-center justify-start gap-x-4 mt-4">
        <Button onClick={goToPreviousStep} variant="outlined">
          <span className="font-bold mr-1">&#8592;</span>
          Previous
        </Button>
        <Button
          variant="contained"
          primary
          removeBorder={true}
          disabled={!space?.id || !route53Record?.payload || !vercelDomainRecord?.vercelDomainRecord}
          loading={
            !route53Record?.payload ||
            !vercelDomainRecord?.vercelDomainRecord ||
            !vercelDomainRecord.vercelDomainRecord.verified ||
            (vercelDomainRecord.vercelDomainRecord.verification?.length || 0) > 0
          }
          onClick={() => {
            if (space?.id) {
              window.location.href = `https://${space?.id}.tidbitshub.org`;
            }
          }}
        >
          Open my Tidbits Site
          <span className="ml-2 font-bold">&#8594;</span>
        </Button>
      </div>
    </div>
  );
}
