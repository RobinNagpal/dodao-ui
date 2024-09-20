## Declaring request and response types
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
