import os
import logging
import asyncio
from quart import Quart, jsonify, request, abort
from twscrape import API
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from mangum import Mangum

# Load environment variables from .env file in development
if os.environ.get("ENVIRONMENT") != "production":
    load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("quart.app")
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setLevel(logging.INFO)
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(name)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.propagate = False

app = Quart(__name__)

# Initialize the API variable globally
api = None

# Determine the environment and set paths accordingly
if os.environ.get("ENVIRONMENT") == "production":
    # Production environment (AWS Lambda)
    import boto3

    # AWS S3 configurations
    s3_bucket = os.environ.get("S3_BUCKET_NAME")
    s3_accounts_db_key = os.environ.get("S3_ACCOUNTS_DB_KEY", "accounts.db")
    local_accounts_db_path = "/tmp/accounts.db"

    # Initialize S3 client
    s3_client = boto3.client('s3')

    # Function to download accounts.db from S3
    def download_accounts_db():
        try:
            s3_client.download_file(s3_bucket, s3_accounts_db_key, local_accounts_db_path)
            logger.info("Downloaded accounts.db from S3")
        except Exception as e:
            logger.error(f"Could not download accounts.db from S3: {e}")
            # If the file doesn't exist, proceed without it; it will be created when adding accounts

    # Function to upload accounts.db to S3
    def upload_accounts_db():
        try:
            s3_client.upload_file(local_accounts_db_path, s3_bucket, s3_accounts_db_key)
            logger.info("Uploaded accounts.db to S3")
        except Exception as e:
            logger.error(f"Could not upload accounts.db to S3: {e}")
else:
    # Development or local environment
    local_accounts_db_path = "accounts.db"

# Function to load Twitter accounts from environment variables
async def load_twitter_accounts():
    account_index = 1
    logger.info("Loading Twitter accounts from environment variables...")
    while True:
        username = os.environ.get(f"TWITTER_USERNAME_{account_index}")
        if not username:
            break

        account = await api.pool.get_account(username)
        if account is None:
            logger.info(f"Account {username} does not exist, creating...")
            password = os.environ.get(f"TWITTER_PASSWORD_{account_index}")
            email = os.environ.get(f"TWITTER_EMAIL_{account_index}")
            email_password = os.environ.get(f"TWITTER_EMAIL_PASSWORD_{account_index}")
            cookies = os.environ.get(f"TWITTER_COOKIES_{account_index}")
            user_agent = None
            proxy = None
            await api.pool.add_account(username, password, email, email_password, user_agent, proxy, cookies)
            account = await api.pool.get_account(username)
            logger.info(f"Added account {username}")

        if not account.active or not account.last_used:
            logger.info(f"Attempting to log in account {username}...")
            success = await api.pool.login(account)
            if success:
                logger.info(f"Logged in account {username} successfully.")
            else:
                logger.error(f"Failed to log in account {username}.")
        else:
            logger.info(f"Account {username} is already active.")

        account_index += 1

# Initialization code
@app.before_serving
async def initialize():
    global api
    logger.info("Starting up")
    if os.environ.get("ENVIRONMENT") == "production":
        # Download accounts.db from S3
        download_accounts_db()
        logger.info("Loaded accounts.db from S3")
    else:
        logger.info("Loaded accounts.db locally")

    # Initialize the API with the accounts database path
    api_db_path = local_accounts_db_path
    api = API(api_db_path)
    logger.info("Initialized API")

    # Run the async function to load Twitter accounts
    await load_twitter_accounts()
    logger.info("Loaded Twitter accounts")

# Cleanup code
@app.after_serving
async def cleanup():
    if os.environ.get("ENVIRONMENT") == "production":
        upload_accounts_db()
        logger.info("Uploaded accounts.db to S3 on shutdown")

@app.route('/tweets/<handle>', methods=['GET'])
async def get_latest_tweets(handle):
    limit = int(request.args.get('limit', 5))
    try:
        user = await api.user_by_login(handle)
        user_id = user.id
        tweets = []
        async for tweet in api.user_tweets(user_id, limit=limit):
            tweets.append(tweet)
        return jsonify({
            "handle": handle,
            "tweets": tweets,
        })
    except Exception as e:
        logger.error(f"Error fetching tweets for handle {handle}: {e}")
        abort(500, description=str(e))

# AWS Lambda handler
handler = Mangum(app)
