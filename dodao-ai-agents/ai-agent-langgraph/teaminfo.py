import json
from typing import List, Dict, Any
from langchain.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage
from langchain_community.document_loaders import ScrapingAntLoader

from pydantic import BaseModel, Field
from langchain.tools import BaseTool
from typing import Optional, Type
from langchain.callbacks.manager import (
    AsyncCallbackManagerForToolRun,
    CallbackManagerForToolRun,
)

from dotenv import load_dotenv
load_dotenv()

from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_openai import ChatOpenAI

def scrape_wefunder_page(url: str) -> str:
    loader = ScrapingAntLoader(url=url)
    docs = loader.load()
    if docs:
        print(docs[0].page_content)
        return docs[0].page_content
    return "No content found."

def identify_team_members(page_content: str, llm: ChatOpenAI) -> List[Dict[str, str]]:
    system_prompt = """You are a researcher. I will provide you with the textual content of a startup's crowdfunding page. 
Your task: 
Identify the core team members of the project. For each team member, extract:
- Full Name
- Role/Title
- Short Description (if available)

Output as a JSON list of objects with keys: name, role, description. Do not add extra commentary."""
    response = llm([SystemMessage(content=system_prompt), HumanMessage(content=page_content)])
    try:
        team_data = json.loads(response.content)
        print(team_data)
        return team_data
    except:
        return []

def find_linkedin_profiles(team_members: List[Dict[str, str]], llm_with_tools: ChatOpenAI) -> List[Dict[str, str]]:
    """
    For each team member, we prompt the LLM to find their LinkedIn profile.
    The LLM can call the TavilySearchResults tool if needed.
    We'll parse the LLM response to find a LinkedIn URL.

    We assume the Tavily tool returns search results containing possible LinkedIn profiles.
    The prompt should guide the LLM to use the tool and then pick the most appropriate LinkedIn URL.
    """
    linkedin_results = []
    for member in team_members:
        name = member["name"]
        role = member.get("role", "")
        query = f"""You have the following team member:
Name: {name}
Role: {role}

Use the TavilySearchResults tool to find their LinkedIn profile. Return only one LinkedIn profile URL that best matches this person."""
        
        # Invoke the LLM with tools
        response = llm_with_tools.invoke([HumanMessage(content=query)])
        # Try to extract a linkedin URL from the response
        # For simplicity, we assume the LLM returns a line with "LinkedIn: <url>"
        # You may need to adjust parsing depending on the LLM & tool responses.
        linkedin_url = ""
        for line in response.content.splitlines():
            if "linkedin.com/in/" in line.lower():
                # Extract URL
                linkedin_url = line.strip()
                break
        
        member["linkedin_url"] = linkedin_url
        linkedin_results.append(member)
    print(linkedin_results)
    return linkedin_results

def scrape_linkedin_profile(link_url: str) -> str:
    if not link_url:
        return ""
    loader = ScrapingAntLoader(url=link_url)
    docs = loader.load()
    if docs:
        print(docs[0].page_content)
        return docs[0].page_content
    return ""

def extract_member_qualifications(linkedin_content: str, llm: ChatOpenAI) -> Dict[str, Any]:
    system_prompt = """You are an unbiased data extractor. I will provide the textual content of a LinkedIn profile.
Extract the following data about this person:
- Experience: List past and current roles with title, company, and dates if available.
- Academic Background: Degrees, institutions, graduation years.
- Certifications: Any listed certifications with details.
- Other notable professional qualifications.

Present the extracted information as JSON with the keys:
experience, academic_background, certifications, other_qualifications.
Do not add additional commentary or interpret the data."""
    response = llm([SystemMessage(content=system_prompt), HumanMessage(content=linkedin_content)])
    try:
        data = json.loads(response.content)
        print(data)
        return data
    except:
        return {
            "experience": [],
            "academic_background": [],
            "certifications": [],
            "other_qualifications": []
        }

def extract_general_info_facts(page_content: str, llm: ChatOpenAI) -> Dict[str, Any]:
    system_prompt = """You are an unbiased extractor of key information. I will provide you with the full details 
of a startup as described on its crowdfunding page. Your task is to summarize the key facts and important 
information about the project's goals, achievements, product environment, and other relevant factual details 
that could help an investor understand the startup. 
Do not include any risks, challenges, or assumptions. Only use the provided facts.
Return your findings as a JSON object with keys like 'goals', 'achievements', 'product_environment', and any 
other relevant fields you deem necessary. Do not add extra commentary."""
    response = llm([SystemMessage(content=system_prompt), HumanMessage(content=page_content)])
    try:
        data = json.loads(response.content)
        return data
    except:
        return {}

def identify_industry_credentials(llm: ChatOpenAI) -> List[str]:
    system_prompt = """You are an expert in this industry. Based on the startup described, 
identify the 10 most important credentials or qualities an investor should look for in the core team members 
of a startup in this industry. Do not add extra commentary, just return a JSON list of strings."""
    response = llm([SystemMessage(content=system_prompt)])
    try:
        creds = json.loads(response.content)
        if isinstance(creds, list) and len(creds) == 10:
            print(creds)
            return creds
        else:
            return []
    except:
        return []

def compare_team_experience_to_industry_needs(industry_credentials: List[str], team_with_qualifications: List[Dict[str, Any]], llm: ChatOpenAI) -> str:
    team_data_str = json.dumps(team_with_qualifications, indent=2)
    creds_str = json.dumps(industry_credentials, indent=2)

    system_prompt = """You are an expert evaluator. You will be given two inputs:
1. A list of industry credentials essential for success in a given industry.
2. A dataset of core team members' qualifications, including their experience, academic background, certifications, and other relevant details.

Your task:
- Evaluate the core team members collectively and determine which of the listed industry credentials they excel in, based strictly on the provided qualifications.
- Identify the credentials for which the team demonstrates limited experience or lacks expertise.
- Use only the explicitly provided information—no assumptions or generalizations.
- Present the analysis as a clearly structured textual report, organized into sections for met and unmet credentials.
- The report should not contain recommendations, advice, or unnecessary repetition.
- The output should be a straightforward, factual report without speculation."""

    user_message = f"Industry Credentials:\n{creds_str}\n\nTeam Qualifications:\n{team_data_str}\n"
    response = llm([SystemMessage(content=system_prompt), HumanMessage(content=user_message)])
    print(response.content)
    return response.content

class TeamInfoInput(BaseModel):
    url: str = Field(description="The Wefunder project URL for analysis")

class TeamInfoTool(BaseTool):
    name: str = "teaminfo_tool"
    description: str = "Analyze the startup from a Wefunder URL and produce a final structured report."
    args_schema: Type[BaseModel] = TeamInfoInput

    def _run(
        self, url: str, run_manager: Optional[CallbackManagerForToolRun] = None
    ) -> str:
        """Synchronous tool implementation."""
        return analyze_wefunder_project(url)
    
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
tavily_tool = TavilySearchResults(max_results=2)
llm_with_tools = llm.bind_tools([tavily_tool])

def analyze_wefunder_project(url: str) -> str:
    """
    The main logic for analyzing the Wefunder project.
    Encapsulate the steps you originally had in your `TeamInfoTool.__call__` method.
    """
    
    content = scrape_wefunder_page(url)
    team = identify_team_members(content, llm)
    team_with_li = find_linkedin_profiles(team, llm_with_tools)

    for member in team_with_li:
        li_url = member.get("linkedin_url", "")
        if li_url:
            li_content = scrape_linkedin_profile(li_url)
            member_data = extract_member_qualifications(li_content, llm)
            member["qualifications"] = member_data

    industry_creds = identify_industry_credentials(llm)
    final_report = compare_team_experience_to_industry_needs(industry_creds, team_with_li, llm)
    print(final_report)
    return final_report