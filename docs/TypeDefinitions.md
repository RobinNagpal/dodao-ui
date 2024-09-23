# Why Type Definitions?
- Types make sure the code doesn't have basic bugs and makes it easy to refactor the code.
- Types make sure that the code is self-documented.

# Important rules for type definitions
- [ ] Never use the type `any` in the code.
- [ ] When ever we have multiple string values which we compare, always use enum. Create the enum in the `types` folder.
      We keep it string in the database, but in the code we use enum. Keeping it string in Database allows more flexibility.
- [ ] We use `prisma` which generates types for us. We should use those in the API code, when saving or fetching data from the database.
- [ ] We should return a custom type very similar to the one created by `prisma` and return it in the API response. This is
      done to decouple the prisma from the front end code.  
      Example:
    - Here we define a type `ClickableDemo` which is similar to the one created by `prisma`.
    - We should save this type in the `types/clicable-demoes` folder, with the file name `ClickableDemo.ts`
    - For request and response types, we should save them in the `types/request` and `types/response` folders respectively.
    - For creating a clickable demo, if we should not pass the `id` in the request, and it should be calculated by the server.
    - So the type for the request can be `Omit<ClickableDemo, 'id'>`
    - The response type can be `ClickableDemo`
      ```typescript
        export interface ClickableDemo {
          archive: boolean;
          createdAt: Date;
          excerpt: string;
          id: string;
          spaceId: string;
          title: string;
          updatedAt: Date;
          steps: ClickableDemoStep[];
        }
      ```
- [ ] Earlier we used to use `graphql` types, but now we are not using `graphql` so we should not use `graphql` types.


# Declaring request and response types
**NOTE: There is no need to use graphql types now. Create types explicitly**

In our project, defining clear request and response types is essential for maintaining type safety and improving code readability. This practice helps ensure that our API interactions are consistent and manageable.

### Type Definition Process

1. **Create Type Definitions**: For each request and response type, create an interface within the appropriate `types` folder. Specifically, place request interfaces in the `request` folder and response interfaces in the `response` folder. This organization promotes clarity and easy access to type definitions.

2. **Example Usage**: Below are examples of request and response types for deleting a item. These interfaces define the expected structure of the API interactions.

#### Example of Request and Response Types

**Request Type**

```typescript
import { ByteCollectionItemType } from '@/app/api/helpers/byteCollection/byteCollectionItemType';

export interface DeleteByteItemRequest {
  itemId: string;
  itemType: ByteCollectionItemType;
}
```

**Response Type**

```typescript
import { Byte, ClickableDemos, ShortVideo } from '@prisma/client';

export interface DeleteByteItemResponse {
  updated: Byte | ShortVideo | ClickableDemos;
}
```



**Usage Example**
```typescript
async function deleteHandler(req: NextRequest): Promise<NextResponse<DeleteByteItemResponse | ErrorResponse>> {
  const args: DeleteByteItemRequest = await req.json();

  // ... handle request logic ...
}
```

Note: Make sure to add a concrete type similar to `Promise<NextResponse<DeleteByteItemResponse | ErrorResponse>>` as the return type
