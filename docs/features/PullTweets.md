# Internal Requirements
We want to make ChainedAssets.com as the best page to find information and updates related to RWA. We have spent 
quite a lot of time on it. However, we don't want to spend too much maintainance time on it. We want to automate
getting and displaying of the news. 

This news is very important for us as well, as we plan to work in the RWA space. So it is important for us to know
what is happening in the space.

# Twitter Feed
Best place to find information is twitter. So we want to make it easy to pull the summary everyday for ~50-75 handles
related to RWAs.

### Side requirements
- Robin does stock investing and wanted to get updates on it in 10 mins everyday. Right now robin buys based on 
macro trends, as he is not having time to read much.
- Robin also has interested in politics and policies and for this we are developing our new product.
- All this information is also available on twitter without any filters.

# Solution
# Stage 1 - Displaying RWA tweets
So we want to make a very simple application, something we can build in 1-2 weeks, and later on see if anyone else 
also wants, then we can expand. For now we just want to build for ourselves to save time on RWAs.

- There will be a list of Areas/Categories. Each area/category will have comma separated twitter handles. Like RWA, Stock, Politics.
- For each twitter handle we will pull the tweets and store them in a database.
- Have a UI on chainedassets to embed and show these tweets

# Stage 2 - Relevance
- Using AI we will be doing some filtering and summarization of the tweets. This work will be coupled together with
the other AI effort needed on Tidbitshub or other areas.  Not sure when we will get to it, but hopefully in January. 

