# DoDAO UI Checklist

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

- [ ] user cannot edit a space unless he is the super admin (email address in .env at DODAO_SUPERADMINS)
- [ ] separate out create space functionality in shared core
- [ ] how user will access the created space and then do things in it (tidbits/clickable demos)
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
