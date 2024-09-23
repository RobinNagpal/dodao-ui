#### Overview

This document outlines a structured approach to form validation within our Next.js application, designed to ensure consistency and maintainability across different forms. It describes a method for validating forms based on mandatory fields, utilizing an interface for field definitions and a helper function for validation. It's important to note that while `validateCategory` is used here for illustration purposes, the actual function name will vary according to the form being validated.

#### Interface Definition

For each form requiring validation, we define an interface within `error.ts` that enumerates all mandatory fields. For example, in a form for creating a category where "name" and "excerpt" are mandatory, these fields would be included in the interface. This interface acts as a foundation for the validation process, ensuring all required checks are implemented.

#### Helper Function: Example `validateCategory`

At the heart of our validation approach is a helper function exemplified here as `validateCategory`. This function's purpose is to validate the form's inputs against the criteria specified in our interface, determining if the mandatory fields are adequately completed.

**Functionality:**

- The function evaluates each mandatory field for completeness and correctness.
- An error object is populated based on the validation outcome, identifying any fields that fail the validation.
- It returns a boolean indicating the form's validity. This boolean is essential for managing form submission and for displaying error messages where necessary.

#### Usage

The validation function (e.g., `validateCategory` in this example) should be invoked with the form's current state as input prior to submission. Depending on the return value:

- A return value of `true` indicates that the form meets all validation criteria, allowing for submission.
- A return value of `false` signals the presence of validation errors. The accompanying error object, detailed by the function, should then be used to guide error display in the UI, informing users about which fields require attention.




## Showing Notifications

In our application, we utilize a notification system to provide feedback to users regarding the success or failure of their actions. This enhances the user experience by keeping users informed about the status of their interactions.

### Implementation

We use a context provider to manage notifications globally throughout the application. Below is an example of how notifications are implemented, particularly in the context of deleting items.

### Example Usage

Here’s how we manage notifications during the deletion of an item:

```typescript
   import { useNotificationContext } from '@dodao/web-core/ui/contexts/NotificationContext';
   
   const { showNotification } = useNotificationContext();
   
   {deleteItemModalState.isVisible && (
     <DeleteConfirmationModal
       title={`Delete ${
         deleteItemModalState.itemType === ByteCollectionItemType.Byte
           ? 'Byte'
           : deleteItemModalState.itemType === ByteCollectionItemType.ClickableDemo
           ? 'Clickable Demo'
           : deleteItemModalState.itemType === ByteCollectionItemType.ShortVideo
           ? 'Short Video'
           : 'Item'
       }`}
       open={deleteItemModalState.isVisible}
       onClose={closeItemDeleteModal}
       deleting={deleteItemModalState.deleting}
       onDelete={async () => {
         if (!deleteItemModalState.itemId || !deleteItemModalState.itemType) {
           showNotification({ message: 'Some Error occurred', type: 'error' });
           closeItemDeleteModal();
           return;
         }
   
         setDeleteItemModalState({
           ...deleteItemModalState,
           deleting: true,
         });
   
         await revalidateTidbitCollections();
         const deleteRequest: DeleteByteItemRequest = {
           itemId: deleteItemModalState.itemId,
           itemType: deleteItemModalState.itemType,
         };
   
         const response = await fetch(`${getBaseUrl()}/api/${space.id}/byte-items/${byteCollection.id}`, {
           method: 'DELETE',
           headers: {
             'Content-Type': 'application/json',
           },
           body: JSON.stringify(deleteRequest),
         });
   
         if (response.ok) {
           const message =
             deleteItemModalState.itemType === ByteCollectionItemType.Byte
               ? 'Byte Archived Successfully'
               : deleteItemModalState.itemType === ByteCollectionItemType.ClickableDemo
               ? 'Clickable Demo Archived Successfully'
               : deleteItemModalState.itemType === ByteCollectionItemType.ShortVideo
               ? 'Short Video Archived Successfully'
               : 'Item Archived Successfully';
   
           setDeleteItemModalState({
             ...deleteItemModalState,
             deleting: false,
           });
   
           closeItemDeleteModal();
           showNotification({ message, type: 'success' });
           const timestamp = new Date().getTime();
           router.push(`/?update=${timestamp}`);
         } else {
           setDeleteItemModalState({
             ...deleteItemModalState,
             deleting: false,
           });
   
           closeItemDeleteModal();
           return showNotification({ message: 'Failed to archive the item. Please try again.', type: 'error' });
         }
       }}
     />
   )}
```

### Notification Types

In our implementation, we use two types of notifications:

- **Success**: Indicates that an action was completed successfully, providing positive feedback to the user.
- **Error**: Indicates that an action failed, alerting the user to an issue that requires attention.

## Testing Different Screen Sizes

To ensure our application is responsive and functions well across various devices, we utilize the **Responsive Viewer** extension. This tool allows us to easily test our UI on different screen sizes, helping us identify layout issues and ensure a consistent user experience.

### Using Responsive Viewer

1. **Installation**: Add the Responsive Viewer extension to your browser. It is available for Chrome and can be found in the Chrome Web Store.

2. **Testing Process**:
   - Once installed, open the Responsive Viewer from your browser's extensions menu.
   - Input the URL of your application and select from a variety of preset screen sizes or add custom dimensions to test specific scenarios.
   - Observe how your application responds to different screen sizes and make adjustments as necessary to ensure a smooth user experience across all devices.

## Form Validation

### Form Validation Process Documentation
