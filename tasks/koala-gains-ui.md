# Must have fixes
We need to add the notifications provider. The `usePostData` hook already has the notifications stuff, so see if that works.


## User Tickers Page
- [ ] We should show the reporting period on that page. This can be saved as another field. For example we should know
if we are still showing the data for sept end or dec end or march end now. 
- [ ] We should also show the link to the SEC 10q report. At the top of the report we can say this is an AI generated
report based on the latest 10Q. We show the reporting period and the link next to this message

for this we can have
```
latest10QInformation: {
  reportingPeriod: string,
  sec10QLink: string
}
```

## Matching Criteria Updates
Currently the matching criteria takes a lot of time and  there is no way to know where we are with it. Only way is to check
the logs. Many times the lambda also times out. We should move the lambda code to the python backed we have, so that we
dont get any timeouts. We already use flask there so moving should be quite easy.
- [ ] Moving the code to the python backend
- [ ] We should add two new fields to `CriteriaMatchesOfLatest10Q`. Attachments to process and attachments processed.
We should keep updating the attachments processed as we process the attachments.
- [ ] We should update the database structure. to have attachment inside may be `latest10QInformation` as `matchingAttachments` 
and then the mathching criteria inside them. This is natural way we process the information. (We didn't update it as we wanted
to avoid the time it will take to update the DB. IF we feel it will take more than 3hrs, we should delay this).

## Login Button
- [ ] We get some hydration error. You will see it on your localhost.

## Chart Fixes
- [ ] The pie chart doesn't appear on the first page load
- [ ] Use subtle colors that match the theme like shades of blue, grey


## On Debug Page
- [ ] Make sure the loaders, and errors work fine and are handled properly. This will improve the debugging experience for
  Maira and save her time.
- [ ] After success, we should re-fetch the ticker and show the updated data, that means we can do the first fetch of the
  ticker client side, and then pass a function `postUpdateTickerInfo` to the child components. The child components can
  make the url call to update the info and then call the `postUpdateTickerInfo` function to update the state.

Make sure to use `no-cache` in the fetch call to avoid caching issues.

```ts
const [tickerInfo, setTickerInfo] = useState(null);

const postUpdateTickerInfo = async () => {
  const url = `${process.env.NEXT_PUBLIC_API_URL}/api/ticker/${ticker}`;
  const response = await fetch(url, {cache: 'no-cache'});
  const data = await response.json();
  setTickerInfo(data);
}

```
This needs to be done for criteria definition also.


Example of the cases where we will be using this code is
- Updating of financial data(re-generate)
- Updating of reports (re-generate)
- Criteria matching is different and that doesn't need to be handled here.

In this case we want to show the updated status and the loading status of the button of that report. Here we don't want
to disable the button, but we want to show the loading status of the button.

## Loading of the page if in process
We can use the `useEffect` hook to check if any of the reports is in process, and we can then refetch the data every 15
secs.

We can also show a small text on the top right corner of the page that says `Refreshing page in next (15-x) secs` or something

## SEO
- Index home page of koala gains
- Index all the blogs
- Add meta tags
- Add sitemap
- Add robots.txt

# Contact us form
- This should work and have proper email

# Good to have

## Tickers Page
- Probably we can add industry and sub-industry as dropdowns and save it at the backend. Then show then as `tags` round/square
  buttons in the ticker list.


