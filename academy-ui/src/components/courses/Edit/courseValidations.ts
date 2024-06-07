export function minValidation<T>(form: T, field: keyof T, minLength: number) {
  const length = ((form[field] as any as string) || undefined)?.length;
  return !length || length < minLength ? `Should be more than ${minLength} characters long` : undefined;
}

export function maxValidation<T>(form: T, field: keyof T, maxLength: number) {
  const length = ((form[field] as any as string) || undefined)?.length;
  return !length || length > maxLength ? `Should be less than ${maxLength} characters long` : undefined;
}

export function minMaxValidation<T>(form: T, field: keyof T, minLength: number, maxLength: number) {
  const minError = minValidation(form, field, minLength);
  if (minError) return minError;

  const maxError = maxValidation(form, field, maxLength);
  if (maxError) return maxError;
}
