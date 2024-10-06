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
