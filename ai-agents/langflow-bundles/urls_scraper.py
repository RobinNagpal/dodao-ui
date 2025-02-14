import re
import time
import requests
from langchain_community.document_loaders import AsyncHtmlLoader, WebBaseLoader
from langflow.custom import Component
from langflow.helpers.data import data_to_text
from langflow.io import DropdownInput, MessageTextInput, Output
from langflow.schema import Data
from langflow.schema.message import Message

# AWS Lambda Function URL for SEC.gov scraping
API_URL = "https://w7gdde4hyh6m44wsepdrrov55u0hhciw.lambda-url.us-east-1.on.aws/"

class URLComponent(Component):
    display_name = "URL"
    description = "Load and retrieve data from specified URLs. Uses AWS Lambda for SEC.gov URLs."
    icon = "layout-template"
    name = "URL"

    inputs = [
        MessageTextInput(
            name="urls",
            display_name="URLs",
            is_list=False,  # Changed to False since URLs are comma-separated
            tool_mode=True,
            placeholder="Enter comma-separated URLs...",
        ),
        DropdownInput(
            name="format",
            display_name="Output Format",
            info="Use 'Text' to extract the text from the HTML or 'Raw HTML' for the raw HTML content.",
            options=["Text", "Raw HTML"],
            value="Text",
        ),
    ]

    outputs = [
        Output(display_name="Data", name="data", method="fetch_content"),
        Output(display_name="Message", name="text", method="fetch_content_text"),
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

    def fetch_via_lambda(self, url, max_retries=3):
        """Fetch SEC.gov content using AWS Lambda, with retry logic."""
        retries = 0
        while retries < max_retries:
            try:
                response = requests.post(API_URL, json={"url": url}, timeout=30)
                response.raise_for_status()
                data = response.json()

                if "content" in data and data["content"].strip():
                    print(f"✅ Successfully retrieved SEC.gov content from: {url}. Length: {len(data['content'])}")
                    return data["content"]
                else:
                    print(f"⚠️ No content extracted from SEC.gov URL {url}. Retrying ({retries + 1}/{max_retries})...")
            except requests.RequestException as e:
                print(f"❌ Error fetching SEC.gov URL {url}: {e}. Retrying ({retries + 1}/{max_retries})...")

            retries += 1
            time.sleep(2)

        print(f"❌ Final failure: Could not retrieve SEC.gov content from {url} after {max_retries} attempts.")
        return ""

    def fetch_content(self) -> list[Data]:
        """Fetch and process multiple URLs using the correct method."""
        # Split URLs by comma and ensure they are valid
        url_list = [self.ensure_url(url.strip()) for url in self.urls.split(",") if url.strip()]
        
        text_data = []
        
        # Separate SEC.gov URLs and normal URLs
        sec_urls = [url for url in url_list if "https://www.sec.gov/" in url]
        normal_urls = [url for url in url_list if url not in sec_urls]

        # Fetch SEC.gov URLs via AWS Lambda
        for url in sec_urls:
            content = self.fetch_via_lambda(url)
            text_data.append(Data(text=content, url=url))

        # Fetch other URLs using LangChain loaders
        if normal_urls:
            if self.format == "Raw HTML":
                loader = AsyncHtmlLoader(web_path=normal_urls, encoding="utf-8")
            else:
                loader = WebBaseLoader(web_paths=normal_urls, encoding="utf-8")
            docs = loader.load()

            for doc in docs:
                text_data.append(Data(text=doc.page_content, **doc.metadata))

        self.status = text_data
        return text_data

    def fetch_content_text(self) -> Message:
        """Fetch content and return as a single text message."""
        data = self.fetch_content()
        result_string = data_to_text("{text}", data)
        self.status = result_string
        return Message(text=result_string)
