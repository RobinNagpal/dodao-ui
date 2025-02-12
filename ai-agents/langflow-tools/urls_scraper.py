import re
from langchain_community.document_loaders import ScrapingAntLoader
from langflow.custom import Component
from langflow.helpers.data import data_to_text
from langflow.io import MessageTextInput, SecretStrInput, Output
from langflow.schema.message import Message

class URLComponent(Component):
    display_name = "URL"
    description = "Load and retrieve data from specified URLs."
    icon = "layout-template"
    name = "URL"

    inputs = [
        MessageTextInput(
            name="urls",
            display_name="URLs",
            tool_mode=True,
            placeholder="Enter comma-separated URLs...",
        ),
        SecretStrInput(
            name="api_key",
            display_name="Scraping Ant Key",
            info="The ScrapingAnt API Key to use for web scraping.",
            advanced=False,
            value="SCRAPINGANT_API_KEY",
            required=True,
        ),
    ]

    outputs = [
        Output(display_name="Combined Message", name="text", method="fetch_combined_content"),
    ]

    def ensure_url(self, string: str) -> str:
        """Ensures the given string is a valid URL by adding 'http://' if missing."""
        string = string.strip()
        if not string.startswith(("http://", "https://")):
            string = "http://" + string
        
        url_regex = re.compile(
            r"^(https?:\/\/)?"  # Optional protocol
            r"(www\.)?"  # Optional www
            r"([a-zA-Z0-9.-]+)"  # Domain
            r"(\.[a-zA-Z]{2,})?"  # TLD
            r"(:\d+)?"  # Optional port
            r"(\/[^\s]*)?$",  # Optional path
            re.IGNORECASE,
        )
        if not url_regex.match(string):
            raise ValueError(f"Invalid URL: {string}")
        
        return string

    def fetch_combined_content(self) -> Message:
        """Fetch and combine content from multiple URLs using ScrapingAnt."""
        url_list = [self.ensure_url(url) for url in self.urls.split(",") if url.strip()]
        api_key = self.api_key  # Retrieve API key
        
        combined_text = ""
        for url in url_list:
            loader = ScrapingAntLoader([url], api_key=api_key)
            documents = loader.load()
            if documents:
                page_content = documents[0].page_content
                combined_text += f"\n\n{page_content}"
                print(f"Successfully scraped URL: {url}. Length of content: {len(page_content)}")
        
        self.status = combined_text.strip()
        return Message(text=combined_text.strip())
