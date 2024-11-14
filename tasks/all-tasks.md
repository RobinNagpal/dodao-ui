Must have features


# 1st Priority

### Login issue for admins
- [ ] the admin is not able to login to the subdomain from list of spaces


# 2nd Priority

### Clickable Demos
- [ ] View modal - upon completion, successful toast is missing just like the one on tidbit completion. Reduce the time of the toast when you add it. - This PR Dawood
- [ ] Edit modal - when saved without creating any step, gives an error that clickable demo not found and loader keeps on spinning - This PR Dawood
- [ ] View modal - the top bar is not visible on some of the steps - see step#4 onwards `https://alchemix.tidbitshub.org/clickable-demos/view/withdraw-from-transmuter-8288`
- [ ] Edit modal - html capture and selector arent showing the error message when left empty - This PR Dawood

### Login issue for admins
- [ ] homepage - ellipsis not visible against tidbits on subdomain when admin is logged in - needs to be verified

### Tidbit Collections
- [ ] homepage - If admin cant archive a collection then lets not show the option to. We can allow admin to archive - Sami
- [ ] homepage - remove the 'testing' collection from the homepage - `https://alchemix.tidbitshub.org`
- [ ] homepage - use the switch component to add functionality of showing archived, not archived. When archived selected, we can show archived collections and also archived items. And may be show a badge against the archived ones - Sami

### Short videos
- [ ] Edit modal - needs to use the box wrapper for all the fields just like tidbits and demos - This PR Dawood
- [ ] Edit modal - if mandatory field left empty and saved, shows error message with the field but doesnt show an error toast - This PR Dawood

### Post signup - Help text
- [ ] Add couple of clickable demos. One for creating tidbit, and other for creating a clickable demo.


# 3rd Priority

### Clickable Demos
- [ ] Edit modal - stepper- flickering when hovered over in error state - Next PR Dawood
- [ ] View modal - only looks fine above 1024px, down that its all a mess so we can detect the screen size and show a message like view the demo on a large screen
- [ ] Edit modal - remove showing of url from upload fields - new design is needed

### Login issue for admins
- [ ] Go to /login on a subdomain:
  - [ ] if already logged in then welcome screen can look better
  - [ ] (for tidbitshub only) if not logged in then single section modal is showing but behind it Full Screen Modal is showing - just gotta make the single section modal background opacity-100 for this flow only
### Tidbits
- [ ] Edit modal - stepper- flickering when hovered over in error state - Next PR Dawood
- [ ] Edit modal - remove showing of url from upload fields - new design is needed
### Tidbit Collections
- [ ] homepage - Have a way to separate the tidbits and clickable demos so that its clear to the user
- [ ] homepage - Ellipsis of an entity when opened, shows the ellipsis of the lower entity like its just appearing maybe due to z-index issue - Next PR Dawood
- [ ] homepage - Collection archive modal shows collection name but archive modal of other entities arent showing the entity name - Next PR Dawood
- [ ] homepage - last entity's ellipsis is cutting from the bottom

### Short videos
- [ ] Edit modal - remove showing of url from upload fields - new design is needed
- [ ] View modal - add border to the video
### Edit Space
- [ ] Edit space name field

### Home page styling
- [ ] Styling fixes for large screen as currently the content is not properly aligned


# 4th Priority

### Others
- [ ] Remove the hardcoded messages of notifications and errors. Make use of `default.json` file for all the messages 
### Clickable Demos
- [ ] View modal - cross button outline getting cutoff where the first demo step has a tooltip that is closer to the bottom of the screen
- [ ] View modal - we can show a "Try it" button when clickable demo gets completed which takes user to some link relevant to the demo
- [ ] Edit modal - add border to tooltip position dropdown
- [ ] Edit modal - errors at the bottom (before save button) are in reverse order

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
- [ ] Add edit profile option back
- [ ] Email/username field is coming to be empty
- [ ] Home screen button can be added


# Extension
- [ ] The input box is not focused for some scenarios. Try creating demo of transaction builder, or check with Dawood
- [ ] Remove the options from the extension. 
- [ ] Try capturing 15-20 screenshots and see if we get any error. 
- [ ] Add a close button on the bottom bar which can close the extension. Discuss the design before implementing
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
