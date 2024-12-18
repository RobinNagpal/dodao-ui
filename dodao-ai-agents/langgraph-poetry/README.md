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
   Navigate to the `dodao-ai-agents\langgraph-poetry\langgraph_poetry` folder and execute the `agent.py` file:
   ```bash
   poetry run python agent.py
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



# Generic workflow
- We populate the initial information based on the project scrapped info.
- Now we represent various fields in the state. Based on which fields are missing, the tools can be invoked.
- We can have a separate field corresponding to each tool. For example for team member, we can have team_member_linkedin_info.
- If `team_member_linkedin_info` is empty then for each member in the inital info, we can invoke the tool to get the linkedin profile url.
- Once we have the linkedin profile url, we can invoke the tool to get the linkedin profile info and populate `processed_team_member_linkedin_info`.


# Current Team Analysis workflow
1) Start -> We have the list of urls (one for now)
2) Store this in projectUrls field in state. for now it will be an array of length one. 
3) ProjectInfoScrapper ->  We want to scrape the content from URLs and populate it in the state. 
   - one liner about the company
   - team members
   - industry
4) LinkedinUrlSearcher - searches linkedin profile urls for each team member and adds it to the memory. query - ${name} ${title} ${company} Linkedin Profile 
5) LinkedinProfileScrapper - scrape information for each user and populate it in the state
6) AnalyzeLinkedinProfile - analyze the linkedin profile for each member and create a string table
   - Name
   - Title
   - Academic credentials
   - Quality of academic credentials
   - Work Experience
   - Depth of work experience
   - Relevant Skills
7) Report - export report in a markdown file.


# State

State
   - projectUrls: List[str]
   - projectInfo: Dict[str, Any]
     - oneLiner: str
     - industry: str
     - teamMembers: List[str]
       - id: str # generate some id to math the team members
       - name: str
       - title: str
       - info: str
   - teamMemberLinkedinUrls: Dict[str, str]
     - id: str 
     - name: str
     - url: str
   - rawLinkedinProfiles: Dict[str, Any]
     - id: str
     - name: str
     - profile: json # linkedin scrapped content   
   - analyzedTeamProfiles: Dict[str, Any]
     - id: str
     - name: str
     - title: str
     - info: str
     - academicCredentials: str
     - qualityOfAcademicCredentials: str
     - workExperience: str
     - depthOfWorkExperience: str
     - relevantSkills: str
