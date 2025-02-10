import os

from dotenv import load_dotenv

load_dotenv()

BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
OPEN_AI_DEFAULT_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o-mini')
REGION=os.getenv("AWS_DEFAULT_REGION")
SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
LINKEDIN_EMAIL = os.getenv("LINKEDIN_EMAIL")
LINKEDIN_PASSWORD = os.getenv("LINKEDIN_PASSWORD")
ADMIN_CODES = set(code.strip() for code in os.getenv("ADMIN_CODES", "").split(","))
PROXYCURL_API_KEY = os.getenv("PROXYCURL_API_KEY")
