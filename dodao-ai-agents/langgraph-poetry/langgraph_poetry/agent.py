from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import ScrapingAntLoader
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict
from typing import Annotated, List, Dict, Any
from dotenv import load_dotenv
import os
import json
import requests

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
SCRAPIN_API_KEY = os.getenv("SCRAPIN_API_KEY")

search = GoogleSerperAPIWrapper()

class TeamMember(TypedDict):
    id: str
    name: str
    title: str
    info: str

class TeamMemberLinkedinUrl(TypedDict):
    id: str
    name: str
    url: str

class RawLinkedinProfile(TypedDict):
    id: str
    name: str
    profile: Dict[str, Any]

class AnalyzedTeamProfile(TypedDict):
    id: str
    name: str
    title: str
    info: str
    academicCredentials: str
    qualityOfAcademicCredentials: str
    workExperience: str
    depthOfWorkExperience: str
    relevantSkills: str

class ProjectInfo(TypedDict):
    startupName: str
    oneLiner: str
    industry: str
    teamMembers: List[TeamMember]

class State(TypedDict):
    messages: Annotated[list, add_messages]
    projectUrls: List[str]        
    scraped_content: str
    projectInfo: ProjectInfo
    teamMemberLinkedinUrls: List[TeamMemberLinkedinUrl]
    rawLinkedinProfiles: List[RawLinkedinProfile]
    analyzedTeamProfiles: List[AnalyzedTeamProfile]

llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)

graph_builder = StateGraph(State)
memory = MemorySaver()
config = {"configurable": {"thread_id": "1"}}

def start_node(state: State):
    """
    Takes the user's URL input and sets up the state for scraping.
    """
    print("Starting the process...")
    user_msg = state["messages"][-1]
    url_to_scrape = user_msg.content.strip()
    state["projectUrls"] = [url_to_scrape]
    return {
        "messages": [HumanMessage(content=f"Scrape the following URL: {url_to_scrape}")],
        "projectUrls": state["projectUrls"] 
    }

def scrape_node(state: State):
    """
    Scrapes the provided URL using ScrapingAntLoader and stores the scraped content in state.
    """
    # Retrieve the URL from state
    url_to_scrape = state["projectUrls"][0]
    try:
        print("Scraping URL:", url_to_scrape)
        loader = ScrapingAntLoader([url_to_scrape], api_key=SCRAPINGANT_API_KEY)
        documents = loader.load()
        page_content = documents[0].page_content
        state["scraped_content"] = page_content
    except Exception as e:
        return {"messages": [AIMessage(content=f"Failed to scrape URL: {e}")]}

    # Next step: Extract project info
    prompt = (
        "From the scraped content, extract the following project info as JSON:\n\n"
        " - startupName: str\n"
        " - oneLiner: str\n"
        " - industry: str\n"
        " - teamMembers: list of objects {id: str, name: str, title: str, info: str}\n\n"
        "Return ONLY a raw JSON object. Do not include any code fences or additional text. No ```json, no ```.\n"
        f"Scraped Content:\n{state['scraped_content']}"
    )
    return {
        "messages": [HumanMessage(content=prompt)],
        "projectUrls": state["projectUrls"],
        "scraped_content": state["scraped_content"]
    }

def extract_project_info_node(state: State):
    """
    Parses the JSON returned by the LLM for project info and stores it in state.
    """
    print("Extracting project info...")
    last_msg = state["messages"][-1]
    prompt_text = last_msg.content
    response = llm.invoke([HumanMessage(content=prompt_text)])
    try:
        project_info = json.loads(response.content)
        state["projectInfo"] = project_info
        print(state["projectInfo"])
        prompt = "Project info extracted successfully."
        return {
            "messages": [HumanMessage(content=prompt)],
            "projectUrls": state["projectUrls"],
            "scraped_content": state["scraped_content"],
            "projectInfo": state["projectInfo"]
        }
    except Exception:
        return {"messages": [AIMessage(content="Error parsing project info.")]}

def find_linkedin_urls_node(state: State):
    """
    Constructs queries from the projectInfo and teamMembers, uses GoogleSerperAPIWrapper to find LinkedIn URLs.
    If a valid LinkedIn profile is not found, stores an empty string or None for 'url'.
    """
    linkedin_urls = []
    startupName = state["projectInfo"]["startupName"]

    # Helper function to search LinkedIn URL
    def search_linkedln_url(query: str) -> str:
        try:
            print("Searching for:", query)
            results = search.results(query)
            for result in results.get("organic", []):
                link = result.get("link", "")
                # Check if the link is a valid LinkedIn profile URL
                if "linkedin.com/in/" in link:
                    return link
            # If no valid LinkedIn URL is found, return an empty string
            return ""
        except Exception as e:
            # If there's an error, return empty string as well
            return ""

    # For each team member, search for LinkedIn URL
    for member in state["projectInfo"]["teamMembers"]:
        query = f"Find the LinkedIn profile url of {member['name']} working as {member['title']} at {startupName}"
        result = search_linkedln_url(query)
        linkedin_urls.append({
            "id": member["id"],
            "name": member["name"],
            "url": result  # Either a valid URL or ""
        })

    state["teamMemberLinkedinUrls"] = linkedin_urls
    print(state["teamMemberLinkedinUrls"])

    return {
        "messages": [HumanMessage(content="linkedln urls finded. now we have to scrape linkedin profiles")],
        "projectUrls": state["projectUrls"],
        "scraped_content": state["scraped_content"],
        "projectInfo": state["projectInfo"],
        "teamMemberLinkedinUrls": state["teamMemberLinkedinUrls"]
    }

def scrape_linkedin_profiles_node(state: State):
    """
    Uses the Scrapin.io API to retrieve LinkedIn profile data based on the URLs
    available in state['teamMemberLinkedinUrls'].

    If a team member has no LinkedIn URL (empty string), their profile will be empty.
    """

    # Inline function to scrape a single LinkedIn profile
    def scrape_linkedin_profile(url: str) -> Dict[str, Any]:
        if not url:
            # No URL provided, return empty profile
            return {}

        request_url = "https://api.scrapin.io/enrichment/profile"
        params = {
            "apikey": SCRAPIN_API_KEY,
            "linkedInUrl": url
        }
        response = requests.get(request_url, params=params)
        if response.status_code == 200:
            try:
                profile = response.json().get("person", {})
                return profile
            except json.JSONDecodeError:
                return {"linkedin_url": url, "error": "Invalid JSON response"}
        else:
            return {"linkedin_url": url,
                    "error": f"Failed to fetch LinkedIn data: {response.status_code} {response.text}"}

    # Build rawProfiles by scraping each team member's LinkedIn (if available)
    rawProfiles = []
    for member in state["teamMemberLinkedinUrls"]:
        profile_data = scrape_linkedin_profile(member["url"])
        rawProfiles.append({
            "id": member["id"],
            "name": member["name"],
            "profile": profile_data
        })

    state["rawLinkedinProfiles"] = rawProfiles
    print(state["rawLinkedinProfiles"])

    return {
        "messages": [HumanMessage(content="Linkedin profiles scraped. Now we have to evaluate each team member.")],
        "projectUrls": state["projectUrls"],
        "scraped_content": state["scraped_content"],
        "projectInfo": state["projectInfo"],
        "teamMemberLinkedinUrls": state["teamMemberLinkedinUrls"],
        "rawLinkedinProfiles": state["rawLinkedinProfiles"]
    }

def evaluate_node(state: State):
    """
    For each team member in rawLinkedinProfiles, invoke the LLM individually.
    Collect results into analyzedTeamProfiles.
    Finally, produce a table as final output.
    """

    print("Evaluating each team member individually...")

    analyzed_profiles = []
    for member_data in state["rawLinkedinProfiles"]:
        member_id = member_data["id"]
        member_name = member_data["name"]
        member_profile = member_data["profile"]

        prompt = (
            "You have information about a startup, its industry, and the LinkedIn profile data (if available) for one of its core team members.\n\n"
            "The goal is to evaluate how well each team member's credentials align with their role/title and the startup's industry.\n"
            "If no LinkedIn data is available for this member, use only the provided startup info and team member info.\n\n"
            "Startup details:\n"
            f"{json.dumps(state['projectInfo'], indent=2)}\n\n"
            "Scraped Content:\n"
            f"{state['scraped_content']}\n\n"
            "Team Member's LinkedIn Profile Data (may be empty):\n"
            f"{json.dumps(member_profile, indent=2)}\n\n"
            "Tasks:\n"
            "1. Identify the credentials and qualifications an investor would look for in core team members of a startup in this industry.\n"
            "2. For this specific team member, return the following fields as a JSON object:\n"
            "   - id (from projectInfo)\n"
            "   - name (from projectInfo)\n"
            "   - title (from projectInfo)\n"
            "   - info (from projectInfo)\n"
            "   - academicCredentials: list of educational institutes and degrees earned (if any found)\n"
            "   - qualityOfAcademicCredentials: provide a brief assessment of the institutes' prestige/ranking if known\n"
            "   - workExperience: summarize previous roles and experiences relevant to the startup’s industry and this member's title\n"
            "   - depthOfWorkExperience: evaluate how comprehensive or advanced this experience is in relation to the startup's credentials and qualification\n"
            "   - relevantSkills: list specific skills directly useful for the startup and its industry\n\n"
            "Important Notes:\n"
            "- If the LinkedIn profile or scraped content does not provide certain details, leave the corresponding fields empty.\n"
            "- Do not invent or guess details. Only use the provided data from the startup info, scraped content, and LinkedIn profile.\n"
            "- Return ONLY a raw JSON object with these fields and no extra text. Do not include code fences or additional formatting.\n"
        )

        response = llm.invoke([HumanMessage(content=prompt)])

        try:
            analyzed_profile = json.loads(response.content)
            required_fields = [
                "id", "name", "title", "info", "academicCredentials",
                "qualityOfAcademicCredentials", "workExperience",
                "depthOfWorkExperience", "relevantSkills"
            ]
            for field in required_fields:
                if field not in analyzed_profile:
                    analyzed_profile[field] = ""

            analyzed_profiles.append(analyzed_profile)
        except json.JSONDecodeError:
            # If parsing fails, create a fallback entry or skip
            analyzed_profiles.append({
                "id": member_id,
                "name": member_name,
                "title": "",
                "info": "",
                "academicCredentials": "",
                "qualityOfAcademicCredentials": "",
                "workExperience": "",
                "depthOfWorkExperience": "",
                "relevantSkills": ""
            })

    # Store in state
    state["analyzedTeamProfiles"] = analyzed_profiles
    print(state["analyzedTeamProfiles"])

    table_prompt = (
        "You have the following JSON array of analyzed team profiles:\n"
        f"{json.dumps(analyzed_profiles, indent=2)}\n\n"
        "Please convert this JSON data into a well-formatted table. "
        "The columns should be the keys (id, name, title, info, academicCredentials, "
        "qualityOfAcademicCredentials, workExperience, depthOfWorkExperience, relevantSkills) "
        "and each row should correspond to one team member.\n"
        "Do not add extra commentary or text, return ONLY the table."
    )

    table_response = llm.invoke([HumanMessage(content=table_prompt)])
    final_table = table_response.content

    with open("final_table.md", "w", encoding="utf-8") as f:
        f.write(final_table)

    return {
        "messages": [AIMessage(content="Final evaluation of the team completed.\n\n" + table_response.content + "\n\nTable saved as final_table.md")],
        "analyzedTeamProfiles": state["analyzedTeamProfiles"]
    }

# Add nodes to the graph
graph_builder.add_node("start", start_node)
graph_builder.add_node("scrape_page", scrape_node)
graph_builder.add_node("extract_project_info", extract_project_info_node)
graph_builder.add_node("find_linkedin_urls", find_linkedin_urls_node)
graph_builder.add_node("scrape_linkedin_profiles", scrape_linkedin_profiles_node)
graph_builder.add_node("evaluate", evaluate_node)

# Add edges (control flow)
graph_builder.add_edge(START, "start")
graph_builder.add_edge("start", "scrape_page")
graph_builder.add_edge("scrape_page", "extract_project_info")
graph_builder.add_edge("extract_project_info", "find_linkedin_urls")
graph_builder.add_edge("find_linkedin_urls", "scrape_linkedin_profiles")
graph_builder.add_edge("scrape_linkedin_profiles", "evaluate")

app = graph_builder.compile(checkpointer=memory)

# Example run:
events = app.stream({"messages": [("user", "https://wefunder.com/arrofinance")]}, config, stream_mode="values")
for event in events:
    event["messages"][-1].pretty_print()
