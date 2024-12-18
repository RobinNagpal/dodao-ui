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

    # Update the state
    state["teamMemberLinkedinUrls"] = linkedin_urls

    # Prepare a list of only valid URLs for the next step
    valid_linkedin_urls = [m["url"] for m in linkedin_urls if m["url"]]

    return {
        "messages": [HumanMessage(content=f"Scrape LinkedIn profiles for these URLs: {json.dumps(valid_linkedin_urls)}")],
        "teamMemberLinkedinUrls": state["teamMemberLinkedinUrls"]
    }

def scrape_linkedin_profiles_node(state: State):
    """
    Uses the Scrapin.io API to retrieve LinkedIn profile data from the provided URLs.
    The last message should contain a JSON array of URLs to scrape.
    """

    last_msg = state["messages"][-1]
    try:
        linkedin_urls = json.loads(last_msg.content)

        # Inline function to scrape LinkedIn profiles
        def scrape_linkedin_profile(linkedin_urls: List[str]) -> List[Dict[str, Any]]:
            url = "https://api.scrapin.io/enrichment/profile"
            profiles_data = []
            for linkedin_url in linkedin_urls:
                params = {
                    "apikey": SCRAPIN_API_KEY,
                    "linkedInUrl": linkedin_url
                }
                response = requests.get(url, params=params)
                if response.status_code == 200:
                    try:
                        profile = response.json().get("person", {})
                        profiles_data.append(profile)
                    except json.JSONDecodeError:
                        profiles_data.append({"linkedin_url": linkedin_url, "error": "Invalid JSON response"})
                else:
                    profiles_data.append({"linkedin_url": linkedin_url,
                                          "error": f"Failed to fetch LinkedIn data: {response.status_code} {response.text}"})
            return profiles_data

        profiles_data = scrape_linkedin_profile(linkedin_urls)

        # Match profiles to teamMemberLinkedinUrls
        rawProfiles = []
        for i, prof in enumerate(profiles_data):
            member_id = state["teamMemberLinkedinUrls"][i]["id"]
            member_name = state["teamMemberLinkedinUrls"][i]["name"]
            rawProfiles.append({
                "id": member_id,
                "name": member_name,
                "profile": prof
            })

        state["rawLinkedinProfiles"] = rawProfiles

        # Next: Evaluate team members
        evaluation_prompt = (
            "You have the startup details and the raw LinkedIn profiles of team members.\n"
            f"Startup details:\n{json.dumps(state['projectInfo'], indent=2)}\n\n"
            f"Scraped Content:\n{state['scraped_content']}\n\n"
            f"Raw LinkedIn Profiles:\n{json.dumps(rawProfiles, indent=2)}\n\n"
            "Evaluate each team member and produce a JSON array `analyzedTeamProfiles`.\n"
            "For each member, return:\n"
            "- id, name, title, info (from projectInfo)\n"
            "- academicCredentials\n"
            "- qualityOfAcademicCredentials\n"
            "- workExperience\n"
            "- depthOfWorkExperience\n"
            "- relevantSkills\n\n"
            "Use only the given LinkedIn profile data and scraped content, do not assume.\n"
            "Return ONLY JSON, no extra text."
        )
        return {
            "messages": [HumanMessage(content=evaluation_prompt)],
        }
    except Exception:
        return {"messages": [AIMessage(content="Error processing LinkedIn profiles.")]}

def evaluate_node(state: State):
    """
    Parses the final analyzedTeamProfiles from LLM and stores it.
    """
    last_msg = state["messages"][-1]
    try:
        analyzed_profiles = json.loads(last_msg.content)
        state["analyzedTeamProfiles"] = analyzed_profiles
        return {"messages": [AIMessage(content="Final evaluation of the team completed.")]}
    except Exception:
        return {"messages": [AIMessage(content="Error parsing analyzed team profiles.")]}

# Add nodes to the graph
graph_builder.add_node("start", start_node)
graph_builder.add_node("scrape_page", scrape_node)
graph_builder.add_node("extract_project_info", extract_project_info_node)
graph_builder.add_node("find_linkedin_urls", find_linkedin_urls_node)
# graph_builder.add_node("scrape_linkedin_profiles", scrape_linkedin_profiles_node)
# graph_builder.add_node("evaluate", evaluate_node)

# Add edges (control flow)
graph_builder.add_edge(START, "start")
graph_builder.add_edge("start", "scrape_page")
graph_builder.add_edge("scrape_page", "extract_project_info")
graph_builder.add_edge("extract_project_info", "find_linkedin_urls")
# graph_builder.add_edge("find_linkedin_urls", "scrape_linkedin_profiles")
# graph_builder.add_edge("scrape_linkedin_profiles", "evaluate")

app = graph_builder.compile(checkpointer=memory)

# Example run:
events = app.stream({"messages": [("user", "https://wefunder.com/fluyo")]}, config, stream_mode="values")
for event in events:
    event["messages"][-1].pretty_print()
