from flask import Flask, jsonify, request
import asyncio
from twscrape import API, gather
import os
import json
import logging
import sqlite3

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)
api = None

    
with open('zappa_settings.json') as json_data:
    env_vars = json.load(json_data)['production']['environment_variables']
    os.environ.update(env_vars)
    

# Determine the environment and set paths accordingly
if os.environ.get("ENVIRONMENT") == "production":
    print("Production environment")
    # Production environment (AWS Lambda)
    import boto3

    # AWS S3 configurations
    s3_bucket = os.environ.get("S3_BUCKET_NAME")
    s3_accounts_db_key = os.environ.get("S3_ACCOUNTS_DB_KEY", "accounts.db")
    local_accounts_db_path = "/tmp/accounts.db"

    # Initialize S3 client
    s3_client = boto3.client('s3')
    def log_db_contents(db_path):
        try:
            conn = sqlite3.connect(db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM accounts")
            rows = cursor.fetchall()
            print(f"Contents of accounts.db: {rows}")
            conn.close()
        except Exception as e:
            print(f"Error reading accounts.db: {e}")
        
    # Function to download accounts.db from S3
    def download_accounts_db():
        try:
            s3_client.download_file(s3_bucket, s3_accounts_db_key, local_accounts_db_path)
            print("Downloaded accounts.db from S3")
            log_db_contents(local_accounts_db_path)
        except Exception as e:
            print(f"Could not download accounts.db from S3: {e}")
            # If the file doesn't exist, proceed without it; it will be created when adding accounts

    # Function to upload accounts.db to S3
    def upload_accounts_db():
        try:
            s3_client.upload_file(local_accounts_db_path, s3_bucket, s3_accounts_db_key)
            print("Uploaded accounts.db to S3")
        except Exception as e:
            print(f"Could not upload accounts.db to S3: {e}")
else:
    # Development or local environment
    local_accounts_db_path = "accounts.db"

app = Flask(__name__)

async def load_accounts():
    account_index = 1
    
    print(f"Loading Twitter accounts from environment variables for account index {account_index} onwards...")
    while True:
        username = os.environ.get(f"TWITTER_USERNAME_{account_index}")
        print("Username found in the environment variables", username)
        if not username:
            print(f"TWITTER_USERNAME_{account_index} not found in environment variables.")
            break

        print(f"Checking for account in accounts pool {username}...")
        account = await api.pool.get_account(username)
        
        if account is None or account.active == 0:
            print(f"Account {username} does not exist or not logged in, creating/logging in...")
            password = os.environ.get(f"TWITTER_PASSWORD_{account_index}")
            email = os.environ.get(f"TWITTER_EMAIL_{account_index}")
            email_password = os.environ.get(f"TWITTER_EMAIL_PASSWORD_{account_index}")
            cookies = os.environ.get(f"TWITTER_COOKIES_{account_index}")
            user_agent = None  # Assuming no user_agent is provided in your environment
            proxy = None  # Assuming no proxy is provided in your environment
            await api.pool.add_account(username, password, email, email_password, user_agent, proxy, cookies)
            account = await api.pool.get_account(username)
            print(f"Added account {username}")
        else:
            print(f"Account {username} is already active and was last used on {account.last_used}")

        account_index += 1

async def scrape_tweets(handle: str, limit: int):
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
    
    await load_accounts()
    if os.environ.get("ENVIRONMENT") == "production":
        # Upload accounts.db back to S3
        upload_accounts_db()
        
    # get user by login
    user = await api.user_by_login(handle)  # User
    
    tweets = await gather(api.user_tweets(user.id, limit=limit))
    transformed_tweets = [
        {
            "id": tweet.id,
            "date": tweet.date.isoformat() if tweet.date else None,
            "content": tweet.rawContent,
            "username": tweet.user.username,
        }
        for tweet in tweets
    ]
    return transformed_tweets

@app.route('/tweets/<handle>', methods=['GET'])
def scrape(handle: str):
    limit = request.args.get('limit', default=5, type=int)
    result = asyncio.run(scrape_tweets(handle, limit))
    return jsonify(result)

@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Welcome to the Tweet Scraper API!"})

if __name__ == '__main__':
    app.run(debug=True)
