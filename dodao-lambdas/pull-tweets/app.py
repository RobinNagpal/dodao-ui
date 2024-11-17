import os
import logging
import asyncio
from fastapi import FastAPI, HTTPException
from twscrape import API
from dotenv import load_dotenv
from contextlib import asynccontextmanager
from datetime import datetime, timedelta, timezone
from mangum import Mangum


# Load environment variables from .env file in development
if os.environ.get("ENVIRONMENT") != "production":
    load_dotenv()

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("uvicorn.info")  # Using Uvicorn's error logger for integration
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setLevel(logging.INFO)

# Updated formatter to display actual log levels
formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(name)s - %(message)s")
handler.setFormatter(formatter)
logger.addHandler(handler)
logger.propagate = False  # Set to False to avoid double logging if Uvicorn is already configured


app = FastAPI(title="Twitter Fetcher")

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
    logger.info(f"Loading Twitter accounts from environment variables for account index {account_index} onwards...")
    while True:
        username = os.environ.get(f"TWITTER_USERNAME_{account_index}")
        logger.info(f"Checking for account {username}...")
        if not username:
            logger.error(f"TWITTER_USERNAME_{account_index} not found in environment variables.")
            break

        account = await api.pool.get_account(username)
        logger.info(f"Account {username} found: {account}")
        if account is None:
            logger.info(f"Account {username} does not exist, creating...")
            password = os.environ.get(f"TWITTER_PASSWORD_{account_index}")
            email = os.environ.get(f"TWITTER_EMAIL_{account_index}")
            email_password = os.environ.get(f"TWITTER_EMAIL_PASSWORD_{account_index}")
            cookies = os.environ.get(f"TWITTER_COOKIES_{account_index}")
            user_agent = None  # Assuming no user_agent is provided in your environment
            proxy = None  # Assuming no proxy is provided in your environment
            await api.pool.add_account(username, password, email, email_password, user_agent, proxy, cookies)
            account = await api.pool.get_account(username)
            logger.info(f"Added account {username}")

        # Assuming that 'login' will update the 'last_used' and 'active' status upon successful login
        if not account.active or not account.last_used:
            logger.info(f"Attempting to log in account {username}...")
            success = await api.pool.login(account)
            if success:
                logger.info(f"Logged in account {username} successfully.")
            else:
                logger.error(f"Failed to log in account {username}.")
        else:
            logger.info(f"Account {username} is already active and was last used on {account.last_used}")

        account_index += 1

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting up")
    # Load the accounds
    global api

    if os.environ.get("ENVIRONMENT") == "production":
        # Download accounts.db from S3
        download_accounts_db()
        logger.info("Loaded accounts.db from S3")
    else:
        # Running locally, ensure accounts.db exists or will be created in current directory
        logger.info("Loaded accounts.db locally")
        pass

    # Initialize the API with the accounts database path
    api_db_path = local_accounts_db_path
    api = API(api_db_path)
    logger.info("Initialized API")

    await load_twitter_accounts()
    logger.info("Loaded Twitter accounts")
    yield
    # Update the accounts
    if os.environ.get("ENVIRONMENT") == "production":
        # Upload accounts.db back to S3
        upload_accounts_db()
    else:
        # Running locally, no need to upload accounts.db
        pass


@app.get("/tweets/{handle}")
async def get_latest_tweets(handle: str, limit: int = 5):
    try:
        user = await api.user_by_login(handle)
        user_id = user.id
        tweets = []
        async for tweet in api.user_tweets(user_id, limit=limit):
            tweets.append(tweet)
        return {
            "handle": handle,
            "tweets": tweets,
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


app.router.lifespan_context = lifespan



handler = Mangum(app)
