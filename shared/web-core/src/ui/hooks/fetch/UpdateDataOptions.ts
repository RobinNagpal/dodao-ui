export interface UpdateDataOptions {
  successMessage?: string;
  errorMessage: string;
  /** Show the server's error message (the response's `error` field) instead of `errorMessage` when the request fails with one. */
  showServerErrorMessage?: boolean;
  redirectPath?: string;
}
