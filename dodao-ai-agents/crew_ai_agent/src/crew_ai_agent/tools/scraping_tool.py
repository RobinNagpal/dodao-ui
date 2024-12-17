import os
from langchain_community.document_loaders import ScrapingAntLoader
from pydantic import BaseModel, Field
from typing import Type, List
from crewai.tools import BaseTool


class ScrapeWithScrapingAntInput(BaseModel):
    """Input schema for the ScrapingAnt Web Scraper tool."""
    urls: List[str] = Field(..., description="List of URLs to scrape.")
    output_file: str = Field(..., description="Path to save the output text file.")


class ScrapeWithScrapingAntTool(BaseTool):
    """ScrapingAnt Web Scraper Tool."""
    name: str = "ScrapingAnt Web Scraper"
    description: str = "Scrapes content from webpages using ScrapingAnt, handling dynamic JavaScript content."
    args_schema: Type[BaseModel] = ScrapeWithScrapingAntInput

    def _run(self, urls: List[str], output_file: str) -> str:
        try:
            # Fetch API key from environment variables
            api_key = os.getenv("SCRAPINGANT_API_KEY")
            if not api_key:
                return "Error: SCRAPINGANT_API_KEY is not set in environment variables."

            # Initialize the ScrapingAntLoader
            scrapingant_loader = ScrapingAntLoader(
                urls=urls,
                api_key=api_key,
                continue_on_failure=True
            )

            # Load the documents (webpage content)
            documents = scrapingant_loader.load()

            # Combine the content from all documents
            combined_content = "\n\n".join([doc.page_content for doc in documents])

            # Write the content to a text file
            with open(output_file, "w", encoding="utf-8") as file:
                file.write("Scraped Content\n")
                file.write("=" * 20 + "\n")
                file.write(combined_content)

            return combined_content
        except Exception as e:
            return f"An error occurred: {str(e)}"
