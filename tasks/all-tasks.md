Must have features


# 1st Priority

### Demos Extension
- [ ] input still needs to be clicked more than once to get it into focus
- [ ] when taking the screenshot, use height of viewport instead of the height of the page - Sami
- [ ] when creating a new demo, there was an error (due to incorrect api route) - Sami verify

### Clickable Demos
- [ ] Edit modal - Element selector - Overlay shows over the buttons - Sami
- [ ] View modal - tooltips are not appearing correctly for the new iframe changes
- [ ] Edit modal - bottom padding needs to be added to the box wrapper

### Login issue for admins
- [ ] the admin is not able to login to the subdomain from list of spaces
### Tidbits
- [ ] Edit modal - bottom padding needs to be added to the box wrapper

### Tidbit Collections
- [ ] Edit modal - input field background color has been messed up, its white everywhere 
### Short videos
- [ ] Edit modal - when saved and view modal opens up and when it is closed and we are on the homepage, the newly added video is not shown - needs to add `?updated=${Date.now()}` to the close modal url
### Edit Space
### Edit Profile
- [ ] Email/username field is coming to be empty
### Post signup - Help text
### Home page styling




# 2nd Priority

### Demos Extension
### Clickable Demos
- [ ] View modal - upon completion, successful toast is missing just like the one on tidbit completion
- [ ] Edit modal - summary error should be changed from "Excerpt is required" to "Summary is required"
### Login issue for admins
- [ ] homepage - ellipsis not visible against tidbits on subdomain when admin is logged in - needs to be verified
### Tidbits
- [ ] Edit modal - header should be "Edit Tidbit" instead of Edit Byte
- [ ] Edit modal - steps heading should be "Tidbit Steps" instead of Byte Steps
- [ ] Edit modal - name & summary field placeholder should use tidbit instead of byte
- [ ] Edit modal - in stepper - if step content isnt mandatory then remove the star from heading "Step Content*"
- [ ] Edit modal - errors should be consistent 
  - [ ] name error : Name is required
  - [ ] summary error with field: Summary is required and should be less than 64 characters long
  - [ ] summary error above upload button: Content cannot be empty.
### Tidbit Collections
- [ ] Edit modal - Archive notification needs to be updated from "Failed to archive ByteCollection" to "Failed to archive Tidbit Collection"
- [ ] homepage - If admin cant archive a collection then lets not show the option to
### Short videos
- [ ] Edit modal - needs to use the box wrapper for all the fields just like tidbits and demos
- [ ] Edit modal - description text area height needs to be reduced
- [ ] View modal - an ellipsis is shown with options (Edit, Edit SEO) but we dont have such ellipsis for tidbits/clickable demos
- [ ] Edit modal - remove the priority field, its not working
- [ ] Edit modal - if mandatory field left empty and saved, shows error message with the field but doesnt show an error toast
### Edit Space
### Edit Profile
### Post signup - Help text
- [ ] Add couple of clickable demos. One for creating tidbit, and other for creating a clickable demo.
### Home page styling


# 3rd Priority
### Demos Extension
### Clickable Demos
- [ ] View modal - only looks fine above 1024px, down that its all a mess so we can detect the screen size and show a message like view the demo on a large screen
- [ ] Edit modal - remove showing of url from upload fields - new design is needed

### Login issue for admins
- [ ] Go to /login on a subdomain:
  - [ ] if already logged in then welcome screen can look better
  - [ ] (for tidbitshub only) if not logged in then single section modal is showing but behind it Full Screen Modal is showing - just gotta make the single section modal background opacity-100 for this flow only
### Tidbits
- [ ] Edit modal - remove showing of url from upload fields - new design is needed
### Tidbit Collections
- [ ] homepage - Have a way to separate the tidbits and clickable demos so that its clear to the user
- [ ] homepage - Ellipsis of an entity when opened, shows the ellipsis of the lower entity like its just appearing maybe due to z-index issue
- [ ] homepage - Collection archive modal shows collection name but archive modal of other entities arent showing the entity name
### Short videos
- [ ] Edit modal - remove showing of url from upload fields - new design is needed
### Edit Space
- [ ] Edit space name field
- [ ] Make the heading "Space Setup" bold and large
### Edit Profile
- [ ] Make the heading "Edit User Profile" bold and large
- [ ] Add form footer
### Post signup - Help text
### Home page styling
- [ ] Styling fixes for large screen as currently the content is not properly aligned


# 4th Priority
### Demos Extension
### Clickable Demos
- [ ] View modal - cross button outline getting cutoff where the first demo step has a tooltip that is closer to the bottom of the screen
- [ ] View modal - we can show a "Try it" button when clickable demo gets completed which takes user to some link relevant to the demo
- [ ] Edit modal - add border to tooltip position dropdown
### Login issue for admins
- [ ] Making it easy for the admin to login. Right now we are not showing any login button. May be we show in the footer? or somewhere else where its not too visible?
### Tidbits
- [ ] Edit modal - in stepper - icon to duplicate a step 
- [ ] Edit modal - in stepper - bit of padding left & right for the closed accordion content (name+arrow)
- [ ] Edit modal - in stepper - add border to image display mode dropdown
- [ ] Edit modal - Instead of show an icon for `Add Input or Questions`, which on clicking shows a modal with various buttons, we 
can directly show these buttons below the `Step Content` field. This would make adding questions more explicit for new 
users - Skipped
- [ ] Edit modal - Add some hovering effect on `Add Question`, `Move up`, `Move down`, and `Delete step` icons - Skipped
### Tidbit Collections
- [ ] homepage - whole entity (tidbit/clickable demo/short video) tile should be clickable
- [ ] homepage - entity tile should change background color when hovered over
- [ ] Either we should use delete everywhere because archive means that there is a place where we can see all the archived ones
### Short videos
- [ ] homepage - icon can be changed (its same as tidbit)
- [ ] homepage - when video has been watched, its icon doesnt change to a tick
### Edit Space
- [ ] Home screen button can be added
### Edit Profile
- [ ] Home screen button can be added
### Post signup - Help text
### Home page styling


--------
Optional features

# Social Sharing


---------



# Experiments
- [ ] AI Agent to collect data from the web on a given topic
- [ ] AI Agent to collect data from the web for a company

---------
# Hassaan

### DoDAO site
- [ ] Improve the styling of the pages
- [ ] Make sure each page has the right meta tags and has SEO optimized
- [ ] Check how the page looks on google search. Make sure if someone serches for DoDAO the link for DoDAO looks good.
- [ ] Finds ways of improving DoDAO's + Tidbits SEO on. Create a simple word doc with the recommendations.
     - Micro Learning
     - User Education
     - Clickable Demos
     - Guided Demos


### Tidbits Hub Site
- [ ] Update gif
- [ ] Add a separate section and gif of clickable demos. This quite and important feature.

### Decentralized Solutions and Reviews Website
- [ ] Create content for the website

### Chained Assets
- [ ] Ecosystem page for Service providers
---------
