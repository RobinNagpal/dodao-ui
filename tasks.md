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

## 3. Create space

- [ ] resolve the SES issue so that user can easily sign up
- [ ] after sign up, user can create a space
- [ ] user cannot edit a space unless he is the super admin (email address in .env at DODAO_SUPERADMINS)
- [ ] separate out create space functionality in shared core
- [ ] how user will access the created space and then do things in it (tidbits/clickable demos)
