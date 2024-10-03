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

- [ ] reuse the create use form from the web-core
- [x] reuse the create space form from the web-core
- [ ] reuse the finish-space-setup from the web-core
  - [ ] input to this component will be of the type WebCoreSpace
  - [ ] another input would be callback function. the callback function will take the webcorespace and it will be calling the api
  - [ ] this callback is implemented in academyui
  - [ ] the baseui component will call this callback on submit

# Checklist

- [x] Update documentation for API routes to include queries and point to the `by-username` example

---

# In Next PR - Update Profile and move the update profile to the base UI

---

# In Next PR - Handle when user is created but space is not created

---

# In Next PR - Multiple spaces for user
