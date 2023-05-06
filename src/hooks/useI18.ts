// read from default.json
// turn a function $t from this hook which takes a sting and returns a string
// the input string is the key to the json file
// for every "." in the key, it will go one level deeper in the json file

import DefaultLocale from './default.json';
export function useI18() {
  const $t = (key: string): string => {
    // Split the key by "."
    const keys = key.split('.');

    // Get the value by traversing the JSON object using the keys
    let value: any = DefaultLocale;
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    return value;
  };
  return {
    $t,
  };
}
