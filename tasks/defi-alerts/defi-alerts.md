# All Tasks

## Initial Research and Docs
- [x] Listing down the requirements for alerts (what type of alerts we can make?)
- [x] Listing down already existing defi alerts projects
- [x] Lisitng down those platforms which are giving api access and webhooks
- [x] Listing down the libraries we can use to fetch real time data for markets and users

## WireFrames for Lending/Borrowing
- [x] Creating Wireframe screens for main alert listing
- [x] Creating Wireframe screens for adding alert
- [x] Creating Wireframe screens for login process

## WireFrames for History, Navbar and Notifications
- [ ] Creating Wireframe screen for history page specific to a alert
- [ ] Creating wireframe screen for navbar
- [ ] Creating wireframe screen for notifications
- [ ] Creating wireframe screen for profile page (if we have)

## Prisma Schema
- [x] Creating prisma schema for the project which can be used for different type of alerts
- [x] Setup of docker compose yaml and prisma database in local
- [ ] Add status thing 

## Setup New Project
- [x] Creating new Next.js project with same versions and file directory
- [x] Configure tailwind css and fonts
- [x] Configure shadcn/ui library 

## Implement Login Functionality
- [x] Creating UI Screens for login
- [x] Backend routes for dummy login process
- [ ] Implement login functionality (sending email and verification code process)

## Dashboard, Listing and History Page
- [ ] Creating UI Screens for main home page, history, profile and settings (if we have)
- [ ] Fetching real data from database to display
- [ ] Implement actions for alerts
- [ ] Implement status functionality of alerts (where user can paused the status)

## Create Alert Functionality
- [x] Created all UI Screens which are related to creating alerts (total 4 type of alerts) 
- [x] UI Screen for choosing general or personlized alerts
- [x] UI Screen for general market alerts for compound
- [x] UI Screen for general markets alerts when compound outperform
- [x] UI Screen for input wallet address
- [x] UI Screen for personalized market alerts for compound
- [x] UI Screen for personalized market alerts when compound outperform
- [x] Implement backend routes for saving those alerts into database

## Fetching real time markets from Defi Protocols
- [ ] As we have to show those active markets on create alert page, so we have to fetch those 
markets and show them in create alert screens
- [ ] Also in comparison alerts, we have to fetch common markets which exists in all Defi protocols 
we are comparing

## Fetching real time user active postions
- [ ] For personalized alerts, we need to get user active positions on compound and other defi protocols 
and display them
- [ ] We need to show exact chain, market, either its supply or borrow, and market APR for it

## Format of email and webhook
- [ ] Finalize the format of all 4 alerts (how the email will be structured)
- [ ] Similarly how can we send the alert details to webhook url

## Actual backend logic of checking and sending alerts
- [ ] 

## Tasks for today
- [x] Created all UI Screens which are related to creating alerts (total 4 type of alerts) 
- [x] UI Screen for choosing general or personlized alerts
- [x] UI Screen for general market alerts for compound
- [x] UI Screen for general markets alerts when compound outperform
- [x] UI Screen for input wallet address
- [x] UI Screen for personalized market alerts for compound
- [x] UI Screen for personalized market alerts when compound outperform
- [x] Implement backend routes for saving those alerts into database

## Tasks for tomorrow
- [ ] Test out the functionality of create alert (as i added types later)
- [ ] Removing all hardcoded colors to use dynammic classnames as we do insights-ui
- [ ] Finalize the styling and layout for all screens of creation of alerts with help of v0