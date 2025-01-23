export function getGTagId(space: { id: string }) {
  if (space.id === 'uniswap-eth-1') {
    return 'G-GHYGJ5DYRF';
  } else if (space.id === 'dodao-1') {
    return 'G-4WB58RV063';
  } else {
    return 'G-BJX2V8FE7L';
  }
}
