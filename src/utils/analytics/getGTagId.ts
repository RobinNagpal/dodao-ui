import { SpaceWithIntegrationsFragment } from '@/graphql/generated/generated-types';

export function getGTagId(space?: SpaceWithIntegrationsFragment) {
  if (space?.id === 'uniswap-eth-1') {
    return 'G-BJX2V8FE7L';
  } else {
    return 'G-GHYGJ5DYRF';
  }
}
