
Must have features

# View Clickable Demos
- [ ] The `trash` icon (for deleting) on the `Completion Screen` doesn't work.    Sami - Next
- [ ] Placeholders missing from fields in `Completion Screen` accordion.  Sami - Next
- [ ] Use slightly bigger font on the accordion where we are showing the step name.   Sami - Next
- [ ] Create Byte collection for onboarding new users:
        1. This byte collection would only be shown to admins
        2. Only show this collection if total collections are less than 3 (including the onboarding collection)
        3. The collection would have:
            1. Introductory video about TidbitsHub platform
            2. Tidbits about `What is Tidbit`, `What is Clickable Demo`, and `What is Short Video`.
# Tidbits
- [ ] Instead of show an icon for `Add Input or Questions`, which on clicking shows a modal with various buttons, we 
can directly show these buttons below the `Step Content` field. This would make adding questions more explicit for new 
users - Skipped
- [ ] Add some hovering effect on `Add Question`, `Move up`, `Move down`, and `Delete step` icons - Skipped

# Signup/Login on Tidbitshub
- [ ] Styling of the login/"get started" modal. The modal is too big for a single input field.
- [ ] Remove avatar image which we show and we can show an empty avatar image there
- [ ] Test the following
    - Login with email works fine
    - The user sees the list of spaces they are part of after login
    - Users gets loggedin after selection of the space. The new JWT create has the spaceId of the space selected
- [ ] Fix issue in `academy-ui/src/app/api/[spaceId]/queries/spaces/by-admin/route.ts`
- [ ] There are some styling issues in the spaces list. The rows are not of the same height. some other improvements can be made
- [ ] use one of the two new hooks(`shared/web-core/src/ui/hooks/fetch/useFetchData.ts` or `academy-ui/src/utils/api/fetchDataServerSide.ts`) to fetch data in `academy-ui/src/components/spaces/ListSpaces.tsx`
- [ ] Sami reported that he is getting an error in backend(JWT), after he creates a new space and then does `finish-setup` of space.

3) Show some default missing icon image if the icon is not present. Just like you added a placeholder for image

# View Tidbit Collections
- [ ] Have a way to separate the tidbits and clickable demos so that its clear to the user
- [ ] ellipsis not visible against tidbits on subdomain

# Post signup - Help text
- [ ] After the user signs up, We should probably show some help tidbits or a help Tidbit collection, which has
information related to what is tidbit, what is clickable demo, what is a collections, a short video etc
- [ ] This collection can have a couple of clickable demoes too

# Login issue for admins
- [ ] Making it easy for the admin to login. Right now we are not showing any login button.
May be we show in the footer? or somewhere else where its not too visible?

# Signup email text and styling
- [ ] The email that is sent to the user after signup should be styled properly.
- [ ] The email should have a proper subject line

# Home page styling
- Styling fixes for large screen as currently the content is not properly aligned


--------

Optional features

# Social Sharing


# Signup updates
- When we send the email, show a link to the user to open email depending on the domain they input





---------



# Experiments
- [ ] AI Agent to collect data from the web on a given topic
- [ ] AI Agent to collect data from the web for a company

