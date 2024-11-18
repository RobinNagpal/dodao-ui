import os
import asyncio
from chalice import Chalice, Response, ChaliceViewError
from twscrape import API
from dotenv import load_dotenv
import boto3

# Load environment variables from .env file in development
if os.environ.get("ENVIRONMENT") != "production":
    load_dotenv()

app = Chalice(app_name='pull-tweets')
app.log.setLevel("INFO")

# Initialize the API variable globally
api = None
api_initialized = False
api_lock = asyncio.Lock()

if os.environ.get("ENVIRONMENT") == "production":
    # Production environment (AWS Lambda)
    s3_bucket = os.environ.get("S3_BUCKET_NAME")
    s3_accounts_db_key = os.environ.get("S3_ACCOUNTS_DB_KEY", "accounts.db")
    local_accounts_db_path = "/tmp/accounts.db"

    s3_client = boto3.client('s3')

    # Function to download accounts.db from S3
    def download_accounts_db():
        try:
            s3_client.download_file(s3_bucket, s3_accounts_db_key, local_accounts_db_path)
            app.log.info("Downloaded accounts.db from S3")
        except Exception as e:
            app.log.error(f"Could not download accounts.db from S3: {e}")
            # If the file doesn't exist, proceed without it; it will be created when adding accounts

    # Function to upload accounts.db to S3
    def upload_accounts_db():
        try:
            s3_client.upload_file(local_accounts_db_path, s3_bucket, s3_accounts_db_key)
            app.log.info("Uploaded accounts.db to S3")
        except Exception as e:
            app.log.error(f"Could not upload accounts.db to S3: {e}")
else:
    # Development or local environment
    local_accounts_db_path = "accounts.db"

# Function to load Twitter accounts from environment variables
async def load_twitter_accounts():
    account_index = 1
    app.log.info(f"Loading Twitter accounts from environment variables for account index {account_index} onwards...")
    while True:
        username = os.environ.get(f"TWITTER_USERNAME_{account_index}")
        if not username:
            app.log.error(f"TWITTER_USERNAME_{account_index} not found in environment variables.")
            break

        app.log.info(f"Checking for account {username}...")
        account = api.pool.get_account(username)
        app.log.info(f"Account {username} found: {account}")
        if account is None:
            app.log.info(f"Account {username} does not exist, creating...")
            password = os.environ.get(f"TWITTER_PASSWORD_{account_index}")
            email = os.environ.get(f"TWITTER_EMAIL_{account_index}")
            email_password = os.environ.get(f"TWITTER_EMAIL_PASSWORD_{account_index}")
            cookies = os.environ.get(f"TWITTER_COOKIES_{account_index}")
            user_agent = None  # Assuming no user_agent is provided in your environment
            proxy = None  # Assuming no proxy is provided in your environment
            await api.pool.add_account(username, password, email, email_password, user_agent, proxy, cookies)
            account = api.pool.get_account(username)
            app.log.info(f"Added account {username}")

        # Assuming that 'login' will update the 'last_used' and 'active' status upon successful login
        if not account.active or not account.last_used:
            app.log.info(f"Attempting to log in account {username}...")
            success = await api.pool.login_account(account)
            if success:
                app.log.info(f"Logged in account {username} successfully.")
            else:
                app.log.error(f"Failed to log in account {username}.")
        else:
            app.log.info(f"Account {username} is already active and was last used on {account.last_used}")

        account_index += 1

async def initialize_api():
    global api, api_initialized
    app.log.info("Initializing API...")

    async with api_lock:
        if not api_initialized:
            app.log.info("API not initialized yet")
            if os.environ.get("ENVIRONMENT") == "production":
                app.log.info("Downloading accounts.db from S3...")
                download_accounts_db()
                app.log.info("Loaded accounts.db from S3")
            else:
                app.log.info("Loaded accounts.db locally")

            api_db_path = local_accounts_db_path
            app.log.info(f"Initializing API with accounts.db at {api_db_path}")
            api = API(api_db_path)
            app.log.info("Initialized API")

            await load_twitter_accounts()
            app.log.info("Loaded Twitter accounts")

            api_initialized = True
        else:
            app.log.info("API already initialized")

@app.route('/tweets/{handle}', methods=['GET'])
async def get_latest_tweets(handle):
    app.log.info(f"Fetching tweets for handle {handle}")
    try:
        limit_param = app.current_request.query_params.get('limit', '5') if app.current_request.query_params else '5'
        try:
            limit = int(limit_param)
        except ValueError:
            limit = 5

        await initialize_api()


        user = await api.user_by_login(handle)
        user_id = user.id
        tweets = []
        async for tweet in api.user_tweets(user_id, limit=limit):
            tweets.append(tweet)
        # Manually construct the tweet data
        tweets_data = []
        for tweet in tweets:
            tweet_data = {
                "id": tweet.id,
                "date": tweet.date.isoformat() if tweet.date else None,
                "content": tweet.rawContent,
                "username": tweet.user.username,
                # Add other fields as needed, ensuring they are serializable
            }
            tweets_data.append(tweet_data)
        response_data = {
            "handle": handle,
            "tweets": tweets_data,
        }

        if os.environ.get("ENVIRONMENT") == "production":
            upload_accounts_db()

        return response_data
    except Exception as e:
        app.log.error(f"Error fetching tweets for handle {handle}: {e}")
        raise ChaliceViewError("This is a bad request")

@app.route('/')
def index():
    app.log.info("Index route called")
    return {'hello': 'world'}
