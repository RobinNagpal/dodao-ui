We can keep each lambda simple and use requirements.txt to add the dependencies and zappa to deploy the lambda functions.

See `lambdas/pull-tweets` for an example of a lambda function that pulls tweets from Twitter using the Tweepy library.

The lambda file can be names as `scraper.py`.

We can create 10-20 of these small lambda functions and it will be scalable and cost effective.
