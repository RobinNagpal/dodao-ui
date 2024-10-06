# DoDAO UI Checklist

---

# This PR - Finish Space Setup

### Changes - Academy UI

- [ ] Add login option on subdomain (Have to see whats the right approach)
- [x] User log in on `tidbitshub.org` and then should be redirected to his space(subdomain) or to a page where all of the user's spaces are listed
- [x] Create finish setup space (space setup with logo, theme, and admin usernames) screen. The admin can come back and edit it.
- [x] Edit space can have all the settings, and for now we don't need to show it to an admin. Only to super admin.
- [x] Add profile edit page. Just name is needed on it, and may be avatar, and phone? Email/username is un-editable
- [ ] page wrapper on profile-edit & finish-space-setup
- [x] remove withSpace from finish-space-setup

### Changes - Base UI

- [x] reuse the create use form from the web-core
- [x] reuse the create space form from the web-core
- [x] reuse the finish-space-setup from the web-core
  - [x] input to this component will be of the type WebCoreSpace
  - [x] another input would be callback function. the callback function will take the webcorespace and it will be calling the api
  - [x] this callback is implemented in academyui
  - [x] the baseui component will call this callback on submit

# Checklist

- [x] Update documentation for API routes to include queries and point to the `by-username` example

---

# In Next PR - move the update profile to the core and use it in base UI

- [ ] moving revalidate for tidbits collections

---

# In Next PR - Handle when user is created but space is not created

---

# In Next PR - Multiple spaces for user

---

# In Next PR - Image Upload

- just show uploaded image. No need to show URL.
- We can just show image upload square like many other websites show.
