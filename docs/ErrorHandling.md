# Handling Error on server side(API)
We should add a try catch around the main function of the route that catches the error and returns a 500 status code 
with the error message.

### Example
```typescript
import { withErrorHandlingV1 } from '@/app/api/helpers/middlewares/withErrorHandling';
import { CreateClickableDemoHtmlCaptureRequest } from '@/types/request/ClickableDemoHtmlCaptureRequests';
import { CreateClickableDemoHtmlCaptureResponse } from '@/types/response/ClickableDemoHtmlCaptureResponses';
import { NextRequest, NextResponse } from 'next/server';

async function postHandler(
  req: NextRequest,
  { params }: { params: { spaceId: string } }
): Promise<NextResponse<CreateClickableDemoHtmlCaptureResponse>> {
  const args: CreateClickableDemoHtmlCaptureRequest = await req.json();
  /// logic here
  return NextResponse.json({ capture }, { status: 200 });
}

export const POST = withErrorHandlingV1<CreateClickableDemoHtmlCaptureResponse>(postHandler);
```

### Important things to Note
- We have not added a try catch block in the main function of the route.
- We have used `withErrorHandlingV1` middleware to catch the error and return the error response.
- This `withErrorHandlingV1` middleware will catch the error and return the error response with a 500 status code.
- We have added the type `CreateClickableDemoHtmlCaptureResponse` to the `withErrorHandlingV1` middleware. This is 
important to make sure that the error response is of the same type as the response type of the route.
- There is an old `withErrorHandling` middleware that should not be used anymore. We should use `withErrorHandlingV1` middleware.

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
