# DoDAO UI Checklist

# Setup requirements
### Subdomain on local
- We need to have wildcard subdomain working on our local for `http://*.tidbitshub-localhost.org`
- After the space is created we will redirect the user to `http://<spaceId>.tidbitshub-localhost.org:3000/space/finish-space-setup`

# Understanding needed
- How space loading works using subdomains. See `docs/UnderstandingSpace.md`

## 1. Base ui

- [x] Write readme with setup steps
- [x] Add `init.sql` file
- [x] Add `docker-compose.yaml` file
- [x] Run base ui locally
- [ ] Update routes (e.g, homepage, space edit)

## 2. Academy ui

- [x] update readme
- [x] Run academy ui locally
- [ ] Add create space functionality in academy ui

## 3. Tidbitshub


- [x] Call to action button on tidbitshug.org
- [x] Sign up page where call to action button will take the user to
- [x] notification on sign out
- [ ] redirect to tidbitshub home page on sign out (for now it goes to localhost instead of tidbithub-localhost)
- [x] create space page where user will come after clicking verification email link
- [x] user is shown a message that space is created now click this link to go to that
- [ ] space-setup page where user will come after clicking create space
- [ ] creation of new space link and rerouting user to that
- [x] upon signup, user should go to /space/create but currently login also takes to /space/create
- [x] upon closing the verification link sign up modal, email password sign up modal appears for a split sec



# Changes - Tidbits Hub home page
- [x] Add call to action button on tidbitshub.org

# Changes - Academy UI

- [ ] UI Change: Move the signup form and create space form to the web-core as that flow will be common for all applications.
      We can have the callback function(we pass to the form component. The callback will be different for each application) 
      which we pass to the form and it will be called after the form is submitted.
- [ ] API Change: Add a new route in the academy ui for the create space at route `/api/[spaceId]/actions/space/new-tidbit-space/route.ts`.
- [ ] API Change: Add route does two things
      - [ ] Create a new space in the database
      - [ ] Update the user with the new spaceId. See `base-ui/src/components/spaces/create/createSpace.tsx` for the
        current implementation. Both things can be done together in the same route call.

- [ ] Upon creation of the space, we show a message to the user, that "Your space is created. Click [here](http://<spaceId>.tidbitshub-localhost.org:3000/space/finish-space-setup) to finish the setup"
- [ ] Once the users go to that domain, they will need to re-login, as the cookies are not shared. May be the cookies we create right now can be shared across the subdomains to prevent this
      step. Check this and talk to Robin if you are not able to figure it out easily.
- [ ] On screen `/finish-space-setup` we can show a message that "Your space is created. Now you can upload your logo, update the theme, add admins etc."
- [ ] Add a new page in the academy ui at the path `/finish-space-setup`. This can have dummy text and in the next PR we 
      can add functionality to this page. i.e. upload logo, updating the theme, adding usernames etc. NO NEED TO DO IN THIS PR 



- [ ] Update the logic in 
