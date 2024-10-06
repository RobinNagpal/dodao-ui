# Caching

When we load data on the server side(in server side components) using fetch, nextjs caches the data and reuses it.

Note: If we are using `axios` switch to using `fetch`.

Many times we want to load the data again when the user navigates to the page. For this nextjs provides utlities.

See [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) and [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) for more information.
for more information.

# Revalidate Path

See the docs on what is [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath)

We prefer to use `revalidateTag` over `revalidatePath` as causes lesser data to refresh.

For e.g.
There is a page `/tidbit-collections`, now if change some small thing on one of the entities, and call this page to
reload using `revalidatePath`, then it will again

1. Fetch the space
2. Fetch the collections
3. Fetch other items

So `revalidateTag` seems to be a better option.

# Revalidate Tag

We have added tags for each entity in `academy-ui/src/utils/api/fetchTags.ts`. Make sure to add the tag for the
entity you are fetching. Ideally for every fetch(get) request, we should add a tag.

## How to use revalidateTag

First we need to tag the data which we want to be refreshed.

For example: Lets say we are fetching a space and we want it to be refreshed whenever we update the
space. So, we tag the space fetching so to revalidate this tag later:

```typescript
const response = await fetch(`${getBaseUrl()}/api/spaces?domain=${host}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
  },
  next: {
    tags: [SpaceTags.GET_SPACE.toString()],
  },
});
```

Now there are two ways to invalidate this tag causing it to fetch refreshed data next time.

1. Using `revalidateTag` directly in the route handler related to updating

   ```typescript
   async function putHandler(req: NextRequest): Promise<NextResponse<Space>> {
     const { spaceInput } = await req.json();

     const updatedSpace = await prisma.space.update({
       data: {
         ...spaceInputArgs,
       },
       where: {
         id: spaceInput.id,
       },
     });

     revalidateTag(SpaceTags.GET_SPACE.toString());

     return NextResponse.json(updatedSpace as Space, { status: 200 });
   }

   export const PUT = withErrorHandlingV1<Space>(putHandler);
   ```

2. Making a server action and calling it after an update api call

   ```typescript
   'use server';

   import { revalidateTag } from 'next/cache';

   export async function action(tag: string) {
     revalidateTag(tag);
   }
   ```

   ```typescript
   const response = await fetch(
     `/api/${space.id}/actions/spaces/finish-space-setup`,
     {
       method: 'PUT',
       headers: {
         'Content-Type': 'application/json',
       },
       body: JSON.stringify({ spaceInput: spaceReq }),
     }
   );

   if (response?.ok) {
     await action(SpaceTags.GET_SPACE.toString());

     showNotification({
       type: 'success',
       message: 'Space upserted successfully',
     });
     router.push('/');
   } else {
     showNotification({
       type: 'error',
       message: 'Error while upserting space',
     });
   }
   ```

# Checklist

- [ ] I understand why my data is not loading again when I navigate to the page
- [ ] I know the difference in `revalidatePath` and `revalidateTag`
- [ ] I clearly know when and how to use `revalidatePath` and `revalidateTag`
- [ ] I know how to add tags for the entities I am fetching
