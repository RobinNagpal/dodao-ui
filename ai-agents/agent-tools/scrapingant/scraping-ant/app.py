import json
import os
from scrapingant_client import ScrapingAntClient
from chalice import Chalice

# Chalice app object (even if we don't use API Gateway)
app = Chalice(app_name="scraping-ant")

@app.lambda_function()
def lambda_handler(event, context):
    """AWS Lambda handler for scraping using ScrapingAntClient."""
    try:
        # Parse the request body
        body = json.loads(event.get("body", "{}"))

        if "url" not in body:
            return {
                "statusCode": 400,
                "body": json.dumps({"error": "Missing 'url' parameter"})
            }

        url = body["url"]
        api_key = os.environ.get("SCRAPINGANT_API_KEY")

        if not api_key:
            return {
                "statusCode": 500,
                "body": json.dumps({"error": "Missing ScrapingAnt API Key"})
            }

        # ScrapingAnt request
        client = ScrapingAntClient(token=api_key)
        result = client.general_request(url)

        return {
            "statusCode": 200,
            "body": json.dumps({"content": result.content}),
            "headers": {"Content-Type": "application/json"}
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)})
        }
