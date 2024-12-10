from crewai.tools import BaseTool
from pydantic import BaseModel, Field
from typing import Type, List
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service as ChromeService
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time


class ScrapeWithSeleniumInput(BaseModel):
    """Input schema for the Selenium Web Scraper tool."""
    urls: List[str] = Field(..., description="List of URLs to scrape.")


class ScrapeWithSeleniumTool(BaseTool):
    """Selenium Web Scraper Tool."""
    name: str = "Selenium Web Scraper"
    description: str = "Scrapes content from webpages, including handling CAPTCHAs and dynamic JavaScript content."
    args_schema: Type[BaseModel] = ScrapeWithSeleniumInput

    def _run(self, urls: List[str]) -> str:
        # Configure Chrome options for headless mode
        options = Options()
        options.add_argument("--disable-blink-features=AutomationControlled")  # Bypass bot detection
        options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.5735.90 Safari/537.36")
        options.add_argument("--headless")
        options.add_argument("--disable-gpu")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")

        # Initialize WebDriver
        driver = webdriver.Chrome(service=ChromeService(ChromeDriverManager().install()), options=options)

        # Accumulate all scraped content into a single string
        combined_content = ""

        for url in urls:
            try:
                driver.get(url)

                # Allow time for JavaScript challenge to process
                time.sleep(15)  # Increase time if the challenge persists
                WebDriverWait(driver, 20).until(
                    EC.presence_of_all_elements_located((By.TAG_NAME, "body"))
                )

                # Fetch the page source and append to combined content
                page_content = driver.page_source
                combined_content += f"URL: {url}\nContent:\n{page_content}\n\n"
            except Exception as e:
                combined_content += f"URL: {url}\nError: {str(e)}\n\n"

        # Quit the WebDriver
        driver.quit()

        # Return the combined HTML content as the output
        return combined_content
