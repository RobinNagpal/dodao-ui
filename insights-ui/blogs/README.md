# Some naming conventions to follow
- file names  should be lowercase and separated by hyphens for example `my-file-name.md`
- folder names should be lowercase and separated by hyphens for example `my-folder-name`
- image names should be lowercase and separated by hyphens for example `my-image-name.png`
- images should be present in the `insights-ui/public/images/blogs` folder and in a nested folder with `same fodler name` as the name of blog markdown file's name

# Adding a new blog
## Top Metadata Fields
- title: The title of the blog post.
- abstract: A brief description of the blog post which will be shown in the blog card.
- date: The date of the blog post in the format "Month DD, YYYY". This is used for display purposes only.
- datetime: The date of the blog post in the format "YYYY-MM-DD". This is used for sorting purposes.
- category: An object containing the title and href of the blog post's category. It will be of the form `{ title: 'Category Title', slug: 'category-slug' }`.
- seoKeywords: An array of keywords for SEO purposes. for example `["keyword1", "keyword2", "Key word 3"]`
- seoImage: The path to the image that will be used as the SEO image for the blog post. 
- bannerImage: The path to the image that will be used as the banner image for the blog post.

# Including images in the blog
- Images should be present in the `insights-ui/public/images/blogs` folder and in a nested folder with `same fodler name` as the name of blog markdown file's name
- We use markdown syntax to include images in the blog post. For example, to include an image named `my-image.png` in the blog post, you would use the following syntax: `![Alt Text](/images/blogs/my-blog-name/my-image.png)`
