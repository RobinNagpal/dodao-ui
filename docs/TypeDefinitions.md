# Why Type Definitions?
- Types make sure the code doesn't have basic bugs and makes it easy to refactor the code.
- Types make sure that the code is self-documented.

# Important rules for type definitions
- [ ] Never use the type `any` in the code.
- [ ] When ever we have multiple string values which we compare, always use enum. Create the enum in the `types` folder.
      We keep it string in the database, but in the code we use enum. Keeping it string in Database allows more flexibility.



# Request and Response Types
- [ ] Earlier we used to use `graphql` types, but now we are not using `graphql` so we should not use `graphql` types.

### Response Types
- We use `prisma` which generates types for us. We should use those in the API code, when saving or fetching data from 
  the database.
- However when we return the data to the front end, we should not use the `prisma` types. We should create our own 
  types. This helps in decoupling the prisma from the front end code.
- We can use a `Dto` object very similar to the prisma type. Then this `Dto` object can be used on the frontend. See 
  `academy-ui/src/types/html-captures/ClickableDemoHtmlCaptureDto.ts` for an example.
- If you see `academy-ui/src/app/api/[spaceId]/html-captures/route.ts` we don't need to convert the `prisma` type 
  to `Dto` object, because we both have the exact same structure.
- We should not try to use nesting in the types. We should keep the types flat. Like in the above case we just return 
  the `ClickableDemoHtmlCaptureDto` rather than something like `{capture: ClickableDemoHtmlCaptureDto}`.

### Request Types
- When creating a new object, there is no need to pass the id. The `id` can be calculated by the server.
- For some cases when we have `upsert` i.e. create and update as the same request, then we can pass the `id` in the 
  request. But in most cases we don't need to pass the `id` in the request for creating a new object.
- `id` can be created using the function `createNewEntityId` declared in `shared/web-core/src/utils/space/createNewEntityId.ts`. 
- May be we include part of spaceId in the `id` as well. This is to make sure that the `id` is unique across all spaces.
- If the request is not same as Dto, then we should create a new type for the request in the `types/request` folder.


# Declaring request and response types
**NOTE: There is no need to use graphql types now. Create types explicitly**

In our project, defining clear request and response types is essential for maintaining type safety and improving code readability. This practice helps ensure that our API interactions are consistent and manageable.

### Type Definition Process

1. **Create Type Definitions**: For each request and response type, create an interface within the appropriate `types` folder. Specifically, place request interfaces in the `request` folder and response interfaces in the `response` folder. This organization promotes clarity and easy access to type definitions.

2. **Example Usage**: Below are examples of request and response types for deleting a item. These interfaces define the expected structure of the API interactions.

#### Example of Request and Response Types

**Response Type**

**Usage Example**
```typescript
async function postHandler(req: NextRequest, { params }: { params: { spaceId: string } }): Promise<NextResponse<ClickableDemoHtmlCaptureDto>> {

  // ... handle request logic ...
}
```

- [ ] Note: Make sure to add a concrete type similar to `Promise<NextResponse<ClickableDemoHtmlCaptureDto>>` as the return type
- [ ] Also we now use `withErrorHandlingV1` instead of `withErrorHandling` for the API routes for handling the errors in 
the api routes. This is because `withErrorHandlingV1` is more flexible and allows us to define the response type explicitly.

```typescript
export const POST = withErrorHandlingV1<ClickableDemoHtmlCaptureDto>(postHandler);
```
