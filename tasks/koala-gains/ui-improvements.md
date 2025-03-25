# Must have fixes

## Add notifications and make sure they work
This is what we have in academy UI
```jsx
  return (
  <html lang="en" className="h-full">
  <body className={'max-h-screen'} style={{ ...style, backgroundColor: 'var(--bg-color)' }}>
  <StyledComponentsRegistry>
    <NotificationProvider>
      <ChildLayout session={session} space={space} spaceError={!space}>
        {children}
      </ChildLayout>
    </NotificationProvider>
  </StyledComponentsRegistry>
  </body>
  </html>
);
```
We need to add the notifications provider. The `usePostData` hook already has the notifications stuff, so see if that works.

## Criteria Definition Page
- [ ] Use json schema form - https://github.com/rjsf-team/react-jsonschema-form
- [ ] Just make sure the experience is good in terms of showing the notification, and showing the updated data.

## User Tickers Page
- Add `companyName` and `shortDescription` for the ticker. 
- Update the table by using template for tailwindui. Talk to Dawood or Robin
- Remove all the actions from the table, move them to the debug page.
- "Sec Filings" should also not be shown in this table

## Login Button
We can show the authentication page/component in the modal. When a user enters the code, we make a call to the api to
check if the code matches, and then we can save the code in the local storage and close the modal, else we show an error.

This at-least make it look to the user that there is authentication implemented and it works. We can make it work very well
with all the checks later.

Show the avatar of the user in the top right corner, and show the logout button. (It it takes more than 30 mins that skip 
this feature.)

## REITs Criteria details page
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


