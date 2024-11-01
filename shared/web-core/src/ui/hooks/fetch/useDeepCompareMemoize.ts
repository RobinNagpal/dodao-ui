import isEqual from 'lodash/isEqual';
import { useRef } from 'react';

export function useDeepCompareMemoize<T>(value: T): T {
  const ref = useRef<T>();

  if (!isEqual(value, ref.current)) {
    ref.current = value;
  }

  return ref.current as T;
}
