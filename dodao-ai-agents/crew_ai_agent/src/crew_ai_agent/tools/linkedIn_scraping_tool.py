import os
import requests
import re
from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type, List, Dict, Any


class LinkedInScraperInput(BaseModel):
    """Input schema for LinkedIn Scraper Tool."""
    profile_urls: List[str] = Field(..., description="List of LinkedIn profile URLs to scrape.")


class LinkedInScraperTool(BaseTool):
    """LinkedIn Scraper Tool using Scrapin.io API."""
    name: str = "LinkedIn Scraper"
    description: str = "Extracts text from LinkedIn profiles using the Scrapin.io API."
    args_schema: Type[BaseModel] = LinkedInScraperInput

    def _run(self, profile_urls: List[str]) -> List[Dict[str, Any]]:
        # Get Scrapin.io API key from environment variables
        api_key = os.getenv("SCRAPIN_API_KEY")
        if not api_key:
            return [{"error": "SCRAPIN_API_KEY environment variable is not set."}]
        
        # Scrapin.io API Endpoint
        base_url = "https://api.scrapin.io/enrichment/profile"
        results = []

        for url in profile_urls:
            try:
                # API Request
                response = requests.get(
                    base_url,
                    params={"apikey": api_key, "linkedInUrl": url}
                )

                if response.status_code == 200:
                    data = response.json()
                    results.append({
                        "url": url,
                        "response":data
                    })
                else:
                    results.append({"url": url, "status": f"HTTP {response.status_code}: {response.text}"})
            except Exception as e:
                results.append({"url": url, "status": f"Error: {str(e)}"})

        return results
