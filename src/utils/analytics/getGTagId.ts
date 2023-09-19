import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

export function getGTagId(space?: SpaceWithIntegrationsFragment | null) {
  if (space?.id === 'uniswap-eth-1') {
    return 'G-GHYGJ5DYRF';
  } else {
    return 'G-BJX2V8FE7L';
  }
}
