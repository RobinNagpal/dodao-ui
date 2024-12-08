# X News UI

## Cleanups
- [ ] TweetCollectionsGrid.tsx and TweetCollectionsCard.tsx can both be server side components. We can create components
related to edit controls which can first check if user is admin, then can render that control.
- [ ] Add admin checks on post, put handlers
- [ ] We can move `withErrorHandling.ts`, `errorLogger.ts`, `formatAxiosError.ts` and `logEventInDiscord.ts` from academy-ui 
to shared folder and use it here so that we don't have to repeat the code.
- [ ] We can cleanup some of the css code as many of the scss files are not being used.

# Lambdas
- [ ] Cleanup the folder structure. We can right now have a flat structure inside `dodao-lambdas` folder. When we have more
than 8-10 lambdas, we can create a folder for each project and then have the lambdas inside that folder.
- [ ] `pull-tweets` will have `pull-tweets` and `x-news-updater` lambdas.
  - [ ] `pull-tweets` has `twscrape` related stuff.
  - [ ] `x-news-updater` has call twscrape and then update the database. This lambda can be invoked by calling api or 
    by a cron job.
