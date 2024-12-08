# X News UI

## Cleanups
- [ ] TweetCollectionsGrid.tsx and TweetCollectionsCard.tsx can both be server side components. We can create components
related to edit controls which can first check if user is admin, then can render that control.
- [ ] Add admin checks on post, put handlers
- [ ] We can move `withErrorHandling.ts`, `errorLogger.ts`, `formatAxiosError.ts` and `logEventInDiscord.ts` from academy-ui 
to shared folder and use it here so that we don't have to repeat the code.
- [ ] We can cleanup some of the css code as many of the scss files are not being used.

