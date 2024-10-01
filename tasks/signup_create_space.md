# DoDAO UI Checklist

# Setup requirements

### Subdomain on local

- We need to have wildcard subdomain working on our local for `http://*.tidbitshub-localhost.org`
- After the space is created we will redirect the user to `http://<spaceId>.tidbitshub-localhost.org:3000/space/finish-space-setup`

### Making subdomains work on local

One simple option is to add a bunch of subdomains in etc file and then use those space names/ids for creating the spaces.
This means you will have to delete/create the data again. Also you might have to **comment out the uuid logic** for space id generation.

Add the following to your `/etc/hosts` file

```
127.0.0.1 space1.tidbitshub-localhost.org space2.tidbitshub-localhost.org space3.tidbitshub-localhost.org space4.tidbitshub-localhost.org space5.tidbitshub-localhost.org space6.tidbitshub-localhost.org space7.tidbitshub-localhost.org space8.tidbitshub-localhost.org space9.tidbitshub-localhost.org space10.tidbitshub-localhost.org
```

Or setup a wildcard domain on your local machine.

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

- [x] UI Change: Move the signup form and create space form to the web-core as that flow will be common for all applications.
      We can have the callback function(we pass to the form component. The callback will be different for each application)
      which we pass to the form and it will be called after the form is submitted. Use `WebCoreSpace`
- [x] API Change: Add a new route in the academy ui for the create space at route `/api/[spaceId]/actions/space/new-tidbit-space/route.ts`.
  - [x] Use error logging as explained here - https://github.com/RobinNagpal/dodao-ui/blob/main/docs/ErrorHandling.md
  - [x] Simplify the logic to just update the spaceId
  - [x] For the `space` create fields, we set the fields as null, which we dont pass
  - [x] Create a new Request type for the route. See https://github.com/RobinNagpal/dodao-ui/blob/main/docs/TypeDefinitions.md
- [x] API Change: Add route does two things

  - [x] Create a new space in the database
  - [x] Update the user with the new spaceId. See `base-ui/src/components/spaces/create/createSpace.tsx` for the
        current implementation. Both things can be done together in the same route call.

- [x] Upon creation of the space, we show a message to the user, that "Your space is created. Click [here](http://<spaceId>.tidbitshub-localhost.org:3000/spaces/finish-space-setup) to finish the setup"
- [x] Once the users go to that domain, they will need to re-login, as the cookies are not shared. May be the cookies we create right now can be shared across the subdomains to prevent this
      step. Check this and talk to Robin if you are not able to figure it out easily.
- [x] On screen `/finish-space-setup` we can show a message that "Your space is created. Now you can upload your logo, update the theme, add admins etc."
- [x] Add a new page in the academy ui at the path `/finish-space-setup`. This can have dummy text and in the next PR we
      can add functionality to this page. i.e. upload logo, updating the theme, adding usernames etc. NO NEED TO DO IN THIS PR
- [ ] Add login option on subdomain

# Checkpoints

- [x] Making sure user is created in the database and they login and successfully land on to create space page
  - [x] Use context as "setupNewSpace" instead of signup to make the flow explicit
- [x] Add new route for space creation and calling it from UI. The route has logic for creating space, and updating the user with the spaceId
- [x] Show message to user that space is created and they can click here to go to the space
- [x] Make the cookie sharing work for subdomains
- [x] Setup a new page at `spaces/finish-space-setup` and show a dummy message
