from flask import Flask, jsonify, request
import asyncio
from libs.twscrape import API, gather
import os
import sqlite3
import boto3

app = Flask(__name__)

class EnvironmentManager:
    """Handles environment-specific configurations and S3 operations."""

    def __init__(self):
        self.local_accounts_db_path = (
            "/tmp/accounts.db" if self.is_production() else "accounts.db"
        )
        if self.is_production():
            self.s3_bucket = os.environ.get("S3_BUCKET_NAME")
            self.s3_accounts_db_key = os.environ.get("S3_ACCOUNTS_DB_KEY", "accounts.db")
            self.s3_client = boto3.client("s3")

    @staticmethod
    def is_production():
        return os.environ.get("ENVIRONMENT") == "production"

    def download_accounts_db(self):
        """Downloads the accounts.db file from S3 to the local file system."""
        if not self.is_production():
            return
        try:
            self.s3_client.download_file(
                self.s3_bucket, self.s3_accounts_db_key, self.local_accounts_db_path
            )
            print("Downloaded accounts.db from S3")
            self.log_db_contents()
        except Exception as e:
            print(f"Error downloading accounts.db from S3: {e}")

    def upload_accounts_db(self):
        """Uploads the accounts.db file from the local file system to S3."""
        if not self.is_production():
            return
        try:
            self.s3_client.upload_file(
                self.local_accounts_db_path, self.s3_bucket, self.s3_accounts_db_key
            )
            print("Uploaded accounts.db to S3")
        except Exception as e:
            print(f"Error uploading accounts.db to S3: {e}")

    def log_db_contents(self):
        """Logs the contents of the accounts.db file for debugging."""
        try:
            conn = sqlite3.connect(self.local_accounts_db_path)
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM accounts")
            rows = cursor.fetchall()
            print(f"Contents of accounts.db: {rows}")
            conn.close()
        except Exception as e:
            print(f"Error reading accounts.db: {e}")


env_manager = EnvironmentManager()


async def load_accounts(api:API):
    """Loads Twitter accounts into the API pool from environment variables."""
    account_index = 1
    print("Loading Twitter accounts from environment variables...")
    while True:
        username = os.environ.get(f"TWITTER_USERNAME_{account_index}")
        if not username:
            print(f"No more accounts found at index {account_index}.")
            break

        account = await api.pool.get_account(username)
        if account is None or account.active == 0:
            print(f"Adding or logging in account: {username}")
            password = os.environ.get(f"TWITTER_PASSWORD_{account_index}")
            email = os.environ.get(f"TWITTER_EMAIL_{account_index}")
            email_password = os.environ.get(f"TWITTER_EMAIL_PASSWORD_{account_index}")
            cookies = os.environ.get(f"TWITTER_COOKIES_{account_index}")
            await api.pool.add_account(username, password, email, email_password, None, None, cookies)
        else:
            print(f"Account {username} is already active.")
        account_index += 1


async def scrape_tweets(handle, limit):
    """Scrapes tweets for a given Twitter handle."""
    env_manager.download_accounts_db()
    api = API(env_manager.local_accounts_db_path)

    await load_accounts(api)
    env_manager.upload_accounts_db()

    user = await api.user_by_login(handle)
    tweets = await gather(api.user_tweets(user.id, limit=limit))

    return tweets


@app.route("/tweets/<handle>", methods=["GET"])
def scrape(handle):
    """API endpoint to scrape tweets for a given handle."""
    limit = request.args.get("limit", default=20, type=int)
    try:
        result = asyncio.run(scrape_tweets(handle, limit))
        return jsonify(result)
    except Exception as e:
        print(f"Error scraping tweets for {handle}: {e}")
        return jsonify({"error": "Failed to scrape tweets"}), 500


@app.route("/", methods=["GET"])
def home():
    """API home endpoint."""
    return jsonify({"message": "Welcome to the Tweet Scraper API!"})


if __name__ == "__main__":
    app.run(debug=True)
