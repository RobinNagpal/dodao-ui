## Requirements

1. **Python**: Version `3.10` or higher.
2. **Poetry**: Dependency manager for Python projects.
   - [Install Poetry](https://python-poetry.org/docs/#installation)
3. **ScrapingAnt API Key**:
   - A valid ScrapingAnt API key must be added to a `.env` file.
4. **OpenAI API Key**:
   - A valid OpenAI API key must be added to a `.env` file.
5. **Serper API Key**:
   - A valid Serper API key must be added to a `.env` file.
6. **Scrapin API Key**:
   - A valid Scrapin API key must be added to a `.env` file.

---

## Installation Guide

### Step 1: Set Up Environment Variables
Create a `.env` file in the `dodao-ai-agents\langgraph-poetry\langgraph_poetry` directory with the following content:
```
OPENAI_API_KEY=your_api_key_here
SCRAPINGANT_API_KEY=your_api_key_here
SERPER_API_KEY=your_api_key_here
SCRAPIN_API_KEY=your_api_key_here
```
Replace `your_api_key_here` with your actual API key.

---

## How to Run the Code

1. **Install all the dependency libraries**:
    Navigate to the `dodao-ai-agents\langgraph-poetry` folder and execute:
   ```bash
   poetry install
   ```

2. **Run the Script**:
   Navigate to the `dodao-ai-agents\langgraph-poetry\langgraph_poetry` folder and execute the `scrapper.py` file:
   ```bash
   poetry run python scrapper.py
   ```

---

## Dependencies

The following libraries are required and managed via Poetry:

- `langgraph`: For graph-based state management.
- `langchain-core`: Core utilities for LangChain.
- `langchain-community`: Community-provided tools like `ScrapingAntLoader`.
- `langchain-openai`: OpenAI LLM integration.
- `python-dotenv`: For environment variable management.
- `scrapingant-client`: ScrapingAnt API client.
- `typing-extensions`: Provides `TypedDict` and `Annotated` typing features.
- `requests`: For making API calls.

---

## Code Overview

### Components

#### 1. **Tools**
- **`scrape_web`**: Scrapes content from a webpage using the ScrapingAnt API.
- **`search_linkedln_url`**: Finds LinkedIn profile URLs using the Serper API.
- **`extract_team_and_queries`**: Identifies core team members from scraped content and creates search queries to find their LinkedIn profiles.
- **`extract_credentials`**: Extracts the credentials needed for success in a given industry based on the startup’s domain.
- **`scrape_linkedin_profile`**: Fetches LinkedIn profile details using the Scrapin API.

#### 2. **Agent and Workflow**
The core logic is implemented as a state-based workflow using `langgraph`. Each phase of the workflow performs a specific task:

1. **Scraping Content**: The `scrape_web` tool fetches the content of the provided URL.
2. **Extracting Industry Credentials**: The scraped content is analyzed to determine the credentials needed in the startup’s industry.
3. **Identifying Team Members**: The `extract_team_and_queries` tool identifies key team members and generates queries for LinkedIn profile searches.
4. **Finding LinkedIn Profiles**: The `search_linkedln_url` tool locates LinkedIn profiles for the team members.
5. **Fetching Profile Data**: The `scrape_linkedin_profile` tool retrieves detailed profile information from LinkedIn.
6. **Evaluating Credentials**: The profiles are analyzed to compare the team’s expertise against the required credentials for success in the industry.

#### 3. **State Management**
The workflow is orchestrated using `StateGraph` from `langgraph`, ensuring smooth transitions between phases. Memory is preserved using `MemorySaver`, allowing the agent to maintain context across steps.

---

## Workflow
1. The user provides a URL for a startup's crowdfunding page.
2. The content of the page is scraped.
3. Industry credentials for success are extracted.
4. Core team members are identified, and LinkedIn profile queries are generated.
5. LinkedIn profile URLs are fetched and scraped for details.
6. The team’s credentials are evaluated against industry standards.
7. A structured report is generated and shared with the user.

