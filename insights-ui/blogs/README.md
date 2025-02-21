# Some naming conventions to follow
- file names  should be lowercase and separated by hyphens for example `my-file-name.md`
- folder names should be lowercase and separated by hyphens for example `my-folder-name`
- image names should be lowercase and separated by hyphens for example `my-image-name.png`
- images should be present in the `images` folder and in a nested folder with `same fodler name` as the name of blog markdown file's name

# Adding a new blog
## Top Metadata Fields
- id: A unique identifier for the blog post. It should be a hyphen-separated lowercase string.
- title: The title of the blog post.
- slug: The (unique) URL slug for the blog post. It should be a hyphen-separated lowercase string.
- abstract: A brief description of the blog post which will be shown in the blog card.
- date: The date of the blog post in the format "Month DD, YYYY". This is used for display purposes only.
- datetime: The date of the blog post in the format "YYYY-MM-DD". This is used for sorting purposes.
- category: An object containing the title and href of the blog post's category. It will be of the form `{ title: 'Category Title', slug: 'category-slug' }`.
- seoKeywords: An array of keywords for SEO purposes. for example `["keyword1", "keyword2", "Key word 3"]`
- seoImage: The path to the image that will be used as the SEO image for the blog post. 
- bannerImage: The path to the image that will be used as the banner image for the blog post.

