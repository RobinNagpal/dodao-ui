# Caching
When we load data on the server side(in server side components) using fetch, nextjs caches the data and reuses it. 

Note: If we are using `axios` switch to using `fetch`.

Many times we want to load the data again when the user navigates to the page. For this nextjs provides utlities. 

See [revalidatePath](https://nextjs.org/docs/app/api-reference/functions/revalidatePath) and [revalidateTag](https://nextjs.org/docs/app/api-reference/functions/revalidateTag) for more information.
for more information.


# Checklist
- [ ] I understand why my data is not loading again when I navigate to the page
- [ ] I know the difference in `revalidatePath` and `revalidateTag`
- [ ] I clearly know when and how to use `revalidatePath` and `revalidateTag`
