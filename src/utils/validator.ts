export const isAddress = (type: string): boolean => type.indexOf('address') === 0;
export const isBoolean = (type: string): boolean => type.indexOf('bool') === 0;
export const isString = (type: string): boolean => type.indexOf('string') === 0;
export const isUint = (type: string): boolean => type.indexOf('uint') === 0;
export const isInt = (type: string): boolean => type.indexOf('int') === 0;
export const isByte = (type: string): boolean => type.indexOf('byte') === 0;

export const isArrayParameter = (parameter: string): boolean => /(\[\d*])+$/.test(parameter);

export const isStringArray = (text: string): boolean => {
  try {
    const values = JSON.parse(text);
    return Array.isArray(values);
  } catch (e) {
    return false;
  }
};

export function isValidURL(str: string): boolean {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return pattern.test(str);
}
