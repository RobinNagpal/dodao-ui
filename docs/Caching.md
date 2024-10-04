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
reload, then it will again
1) Fetch the space
2) Fetch the collections
3) Fetch other items

So `revalidateTag` seems to be a better option.

# Revalidate Tag
We have added tags for each entity in `academy-ui/src/utils/api/fetchTags.ts`. Make sure to add the tag for the 
entity you are fetching. Ideally for every fetch(get) request, we should add a tag.


# Checklist
- [ ] I understand why my data is not loading again when I navigate to the page
- [ ] I know the difference in `revalidatePath` and `revalidateTag`
- [ ] I clearly know when and how to use `revalidatePath` and `revalidateTag`
- [ ] I know how to add tags for the entities I am fetching
