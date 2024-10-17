# In Next PR - Multiple spaces for user

- [x] Add a page where user can see all of his spaces
- [x] Handle current logic to have multiple users with different space ids
  - [x] In login request, see if the spaceId is same as tidbitshub, then fetch the first user. You can refer to PredefinedSpaces as used in `academy-ui/src/app/page.tsx`. May be move `PredefinedSpaces` to some other location.
  - [x] In login request, if spaceId is not same as tidbitshub, then we create a new user with that spaceId. (current logic)
- [x] fetch user spaces according to new logic
- [x] Add a button to create a new space. This can be added on the grid screen.

# In next PR - Login using selected Space

- [ ] When the user clicks on one of the spaces, we should login using that spaceId and then redirect the user to that domain

# In Next PR - Image Upload

- just show uploaded image. No need to show URL.
- We can just show image upload square like many other websites show.
