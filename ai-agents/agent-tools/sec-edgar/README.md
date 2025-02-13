We can keep each lambda simple and use requirements.txt to add the dependencies and `https://github.com/aws/chalice` to deploy the lambda functions.

Reason is because chalice might provide a better way to deploy the lambda functions and add support of other things like lambda functions urls.

See `lambdas/pull-tweets` for an example of a lambda function that pulls tweets from Twitter using the Tweepy library.

The lambda file can be names as `scraper.py`.

We can create 10-20 of these small lambda functions and it will be scalable and cost effective.
