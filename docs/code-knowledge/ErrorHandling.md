# Handling Error on server side(API)
We should add a try catch around the main function of the route that catches the error and returns a 500 status code 
with the error message.

### Example
```typescript
import { withErrorHandlingV2 } from '@dodao/web-core/api/helpers/middlewares/withErrorHandling';
import { NextRequest } from 'next/server';

interface CreateCaptureRequest {
  // request fields
}

interface CaptureResponse {
  // response fields
}

async function postHandler(
  req: NextRequest,
  context: { params: Promise<{ spaceId: string }> }
) {
  const { spaceId } = await context.params;
  const args: CreateCaptureRequest = await req.json();
  /// logic here
  return capture;
}

export const POST = withErrorHandlingV2(postHandler);
```

### Important things to Note
- We have not added a try catch block in the main function of the route.
- We use `withErrorHandlingV2` middleware from `@dodao/web-core` to catch errors and return the error response with a 500 status code.
- Just throw an error for any exception scenarios and it will be handled by the middleware.
- In Next.js 15+, route handler params must be typed as `Promise<>` and awaited (e.g., `context: { params: Promise<{ spaceId: string }> }`).
- There are older `withErrorHandling` and `withErrorHandlingV1` middlewares that should not be used anymore. Always use `withErrorHandlingV2`.

# Displaying Error on UI
We should show the error message on the UI when there is an error. We should show a generic error message in the notification 

## Showing Notifications

In our application, we utilize a notification system to provide feedback to users regarding the success or failure of their actions. This enhances the user experience by keeping users informed about the status of their interactions.

### Implementation

We use a context provider to manage notifications globally throughout the application. Below is an example of how notifications are implemented, particularly in the context of deleting items.

### Example Usage

Here’s how we manage notifications during the deletion of an item:

```typescript
import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';


// This will go in the component
const { showNotification } = useNotificationContext();


// The below code will go in the function were you call the api
const response = await fetch(`${getBaseUrl()}/api/${space.id}/byte-items/${byteCollection.id}`, {
  method: 'DELETE',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(deleteRequest),
});

if (response.ok) {
  // logic to update the state here
  const message = 'Item archived successfully.';
  showNotification({ message, type: 'success' });
  const timestamp = new Date().getTime();
  router.push(`/?update=${timestamp}`);
} else {
  // logic to handle error
  return showNotification({ message: 'Failed to archive the item. Please try again.', type: 'error' });
}

```

### Notification Types
In our implementation, we use two types of notifications:
- **Success**: Indicates that an action was completed successfully, providing positive feedback to the user.
- **Error**: Indicates that an action failed, alerting the user to an issue that requires attention.
