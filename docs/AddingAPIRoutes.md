# About Rest

In REST i.e. API we normally use the same route and different HTTP functions related to an entity. We try to have this
consistency, but many times its not possible.

# Basic Rules

Read about REST conventions here

- https://medium.com/@nadinCodeHat/rest-api-naming-conventions-and-best-practices-1c4e781eb6a5
- https://restfulapi.net/resource-naming/

This means the routes which we should have are

- `GET - /api/[spaceId]/programs` This should return the list of programs
- `POST - /api/[spaceId]/programs` - can be used for adding a new program
- `GET - /api/[spaceId]/programs/{programId}` Return the specific program
- `PUT - /api/[spaceId]/programs/{programId}` can be used for updating a program
- `DELETE - /api/[spaceId]/programs/{programId}` can be used for deleting a program

Similarly we can do the same for rubrics.

There can be other things like share on social media and for those this theme doesn’t apply,
so we can probably do something like

`/api/[spaceId]/actions/programs/share-on-social-media`

And if it is related to fetching of data like fetching user by username, so we can do it like this

- `/api/[spaceId]/queries/users/by-username` - See file `academy-ui/src/app/api/[spaceId]/queries/users/by-username/route.ts`
- `/api/[spaceId]/queries/spaces/by-creator` - See file `academy-ui/src/app/api/[spaceId]/queries/spaces/by-creator/route.ts`

This is for specific routes which don't qualify for simple REST routes.

# Lists
- `GET - /api/[spaceId]/programs` This should return the list of programs

# Single Entity

- `GET - /api/[spaceId]/programs/{programId}` Return the specific program
- `PUT - /api/[spaceId]/programs/{programId}` can be used for updating a program and returns the updated program
- `DELETE - /api/[spaceId]/programs/{programId}` can be used for deleting a program and returns the archived program
- `POST - /api/[spaceId]/programs` - can be used for adding a new program and returns the new program

# Request and Response Types

See the [TypeDefinitions](TypeDefinitions.md) for details on how to define the types for the API routes.

# Nested Routes

Normally all of our routes are nested in spaceId. This is because all the requests are related to a space.

For example `academy-ui/src/app/api/[spaceId]/clickable-demos/[demoId]/route.ts`
