# Features

## Login

- [ ] User clicks "Login" button and is asked to for email and verification link is sent to email and shown a message that the email has been sent and gives a link to the user to open email depending on the domain they input
- [ ] user clicks on the link in the email and is redirected to the spaces list page
- [ ] User is shown two list of spaces, one which the user himself created and one where the user is an admin
- [ ] If no spaces are found, user is shown a message that no spaces are found and a button to create a new space

## Setup space

- [ ] If not logged in:
  - [ ] User clicks "Get Started" button and is asked to for email and verification link is sent to email and shown a message that the email has been sent and gives a link to the user to open email depending on the domain they input
  - [ ] user clicks on the link in the email and is redirected to the create space page
  - [ ] User enters a space name and clicks "Create Space" button and is shown a dialog box with a message that the space has been created and a button to go to the space
  - [ ] User clicks on the "Click Here" button and is taken to the finish space setup page

- [ ] If logged in:
  - [ ] User clicks "Get Started" button and is taken to the spaces list page
  - [ ] User is shown two list of spaces, one which the user himself created and one where the user is an admin
  - [ ] If no spaces are found, user is shown a message that no spaces are found and a button to create a new space


## Finish setup

- [ ] User is asked for logo and admins for the newly created space
- [ ] User clicks the "Finish Setup" button and is taken to the space homepage where user is shown help tidbit collection and add new tidbit collection button

## Help Tidbit Collection & Tidbits

- [ ] Logged in admin is shown a help tidbit collection with some help tidbits
- [ ] Help tidbit collection is shown till 2 tidbit collections are created and then it is hidden
- [ ] Help tidbit collection cant be edited or deleted

## Profile Editing Options

- [ ] Logged in admin is shown the profile icon with following options:
  - [ ] Edit Space
    - [ ] Edit Space Logo
    - [ ] Edit Space admins
  - [ ] Edit Profile
    - [ ] Edit Name
    - [ ] Edit Phone Number
    - [ ] Only see the email/username and not edit it 
  - [ ] Sign Out

## View Tidbit Collections

- [ ] Any user can see the tidbit collections of the space
- [ ] above 768px screen width, there are two columns of tidbit collections and below 768px screen width, there is one column of tidbit collections
- [ ] Tidbits/clickable demos/short videos are shown with different icons before they are completed, afterwards its a tick icon

## Edit Tidbit Collections

- [ ] Only logged in admin:
  - [ ] is given the option (ellipsis/three dots) to edit the tidbit collection
  - [ ] is given the option to create a new tidbit collection
  - [ ] is shown the "Add new item" button which upon clicking shows three options:
    - [ ] Create Tidbit
    - [ ] Create Clickable Demo
    - [ ] Create Short Video
  - [ ] is shown the option to archive a tidbit collection (three dots menu) but wont be able to do it, only super admin can do it
  - [ ] can create and edit a tidbit collection's name, description, video url and also set priority which decides the ordering of the tidbit collections

## View Tidbits

- [ ] Any user can see the tidbits of the space
- [ ] In case of swiper mode:
  - [ ] user can see a "Scroll Down" button at the bottom of the screen on the first step
  - [ ] above 1024px screen width:
    - [ ] user sees a swipeable section of tidbits headings and numbering on the right side of the screen
  - [ ] below 1024px screen width:
    - [ ] user sees a swipeable section of tidbits numbering only on the right of the screen
- [ ] When user has gone through all the tidbit steps and clicks complete button, a notification congrats the user on completing the tidbit successfully
- [ ] After a user has completed a tidbit and closes it, that tidbit icon will now be a green tick

## Edit Tidbits

- [ ] Only logged in admin:
  - [ ] is given the option (ellipsis/three dots) to edit, archive and sort the tidbit steps
  - [ ] can edit a tidbit's:
    - [ ] name - if left empty shows an error message and error notification when saved
    - [ ] summary - if left empty shows an error message and error notification when saved
    - [ ] admins
    - [ ] video url
    - [ ] Byte Steps - which further includes these fields:
      - [ ] icons to move a step up and down so easy ordering
      - [ ] icon to remove the whole step
      - [ ] icon to add input or question which basically offers to have a simple or multiple choice question as a step
      - [ ] name - if left empty shows an error message and error notification when saved
      - [ ] image display mode (will only work if an image is uploaded)
      - [ ] step content - which is a rich text editor giving options like bold, italic, right/left/center/justify text aligment, hyperlink, numbering, bullets, upload image, code block, AI content generation
      - [ ] image upload - which when hovered shows a plus icon if image is not uploaded yet and if image has been uploaded then shows edit and remove icons
    - [ ] Add completion screen

## View Clickable demos
- [ ] Any user can see the clickable demos of the space
- [ ] User opens a demo and is taken through a set of steps one by one with some info on each step
- [ ] After a user has completed a demo and closes it, that demo icon will now be a green tick


## Edit Clickable demos
- [ ] Only logged in admin:
  - [ ] is given the option (ellipsis/three dots) to edit and archive the demo entity
  - [ ] can edit a demo's:
    - [ ] title
    - [ ] summary 
    - [ ] Clickable demo Steps - which further includes these fields:
      - [ ] icons to move a step up and down so easy ordering
      - [ ] icon to remove the whole step
      - [ ] tooltip information - if left empty shows an error message and error notification when saved
      - [ ] tooltip position
      - [ ] upload HTML capture which shows the captures done through our extension - if left empty shows an error message and error notification when saved
      - [ ] element selector which opens the html capture so we can select something around which tooltip will be positioned - if left empty shows an error message and error notification when saved


## View Short Videos
- [ ] Any user can see the short videos of the space
- [ ] Three dots menu at the bottom right of the video
  - [ ] User can download the video 
  - [ ] User can change the playback speed of the video
  - [ ] User can enable picture in picture mode which lets the user change the tab but still see the video in a small box so that user can follow along with the video tutorial or do something else while still looking and listening to the video


## Edit Short Videos
- [ ] Only logged in admin:
  - [ ] is given the option (ellipsis/three dots) to edit and archive the video
  - [ ] can edit a video's:
    - [ ] title - if left empty shows an error message and error notification when saved
    - [ ] description - if left empty shows an error message and error notification when saved
    - [ ] thumbnail - if left empty shows an error message and error notification when saved
    - [ ] video  - if left empty shows an error message and error notification when saved
