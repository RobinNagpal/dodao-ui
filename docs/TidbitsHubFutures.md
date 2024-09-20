# Current Features
- [ ] Allows creation of Tidbits, Clickable Demos, and Short Videos
- [ ] Tidbits, Clickable Demos, and Short Videos are part of Tidbit Collections.
- [ ] We can create a whitelabel site for Tidbits which can be used as a subdomain or a root domain.
- [ ] We can set custom themes for the Tidbits site
- [ ] We have a chrome extension which can be used for easy creation of Clickable Demos


# Vision

Every website needs to share some information or educate its users. They way they try to do it using blogs, user & 
tech docs, or videos. Which these are good, they require dedicated time to read and they users normally are looking for 
quick information. This is the reason Youtube shorts, reels, or twitter have gained so much popularity.

With GenerativeAI demand for crisp content with further increase and we are in a good position to provide that.


# Next Features

### Self provisioning of space
For this we need to
1. Create a space
2. Create a user
3. Include that user as admin of the space
4. Then take the user to the admin screen

This means the user will be created twice, once in DoDAO space, and then when we create a new space, we need to create 
a user as well. We also need to use a “I am a human” captcha

### Allow adding custom domains via Admin console
For this we need to make an API Call to vercel.

### Alternative views for Tidbits
Right now we have a step-by-step view for Tidbits. We can also have a accordion view, or a carousel view etc.

### Include Photos on Tidbit Steps

Right now photos can be included in the markdown and we can show them, but the person needs to find the photos, and 
have to upload them. So to simplify it we want to provide ways to include photos. For this we can

1. Generate images using Dalle 3
2. Include some functionality to search and include videos via google. Check copyright issues
3. See any other providers like istockphoto.com


### Social Sharing on Twitter/Linkedin
We should be able to share the Tidbit on Twitter and Linkedin.
1. For linked in we can show a carousel
2. For Twitter we can show an image which includes all steps, or a long post
We can also try to integrate with huitsuite or some other Saas solution which allows us to publish the content to the 
social media platforms

### Generation of Tidbits Site from URLs
We already have most of this code in place. We can use this to generate a tidbits site from a URL.
