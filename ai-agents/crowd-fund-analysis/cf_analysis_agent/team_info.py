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
import time
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
    relevantWorkExperience: str

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
    teamInfo: str


OPENAI_MODEL = os.getenv("OPENAI_MODEL")

if OPENAI_MODEL:
    llm = ChatOpenAI(model_name=OPENAI_MODEL, temperature=0)
else:
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
    Includes retry logic with a maximum of 10 retries and a 5-second delay between attempts.
    """
    url_to_scrape = state["projectUrls"][0]
    max_retries = 10
    retries = 0
    delay = 5  # Delay in seconds between retries

    while retries < max_retries:
        try:
            print(f"Attempt {retries + 1}: Scraping URL: {url_to_scrape}")
            loader = ScrapingAntLoader([url_to_scrape], api_key=SCRAPINGANT_API_KEY)
            documents = loader.load()
            page_content = documents[0].page_content

            # Store the scraped content in the state
            state["scraped_content"] = page_content

            print("Scraping successful.")
            break  # Exit the loop if scraping is successful
        except Exception as e:
            print(f"Error on attempt {retries + 1}: {e}")
            retries += 1
            if retries == max_retries:
                print("Maximum retries reached. Failing gracefully.")
                return {"messages": [AIMessage(content=f"Failed to scrape URL after {max_retries} attempts: {e}")]}
            print(f"Retrying in {delay} seconds...")
            time.sleep(delay)  # Wait for 5 seconds before retrying

    # Prepare the prompt for extracting data
    prompt = (
        "From the scraped content, extract the following project info as JSON:\n\n"
        " - startupName: str (The name of the project or startup being discussed)\n"
        " - oneLiner: str (A single sentence explaining what the startup does)\n"
        " - industry: str (A brief overview of the industry, including how it has grown in the last 3-5 years, its expected growth in the next 3-5 years, challenges, and unique benefits for startups in this space)\n"
        " - teamMembers: list of objects {id: str (Unique ID for each team member, formatted as firstname_lastname), name: str (The name of the team member), title: str (The position of the team member in the startup), info: str (Details or additional information about the team member as mentioned on the startup page)}\n\n"
        "Return ONLY a raw JSON object. Do not include any code fences or additional text. No ```json, no ```.\n"
        f"Scraped Content:\n{state['scraped_content']}"
    )

    # Return the extracted prompt and the scraped data
    return {
        "messages": [HumanMessage(content=prompt)],
        "projectUrls": state["projectUrls"],
        "scraped_content": state["scraped_content"],
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

    def search_linkedln_url(query: str) -> str:
        try:
            print("Searching for:", query)
            results = search.results(query)
            for result in results.get("organic", []):
                link = result.get("link", "")
                if "linkedin.com/in/" in link:
                    return link
            return ""
        except Exception as e:
            return ""

    for member in state["projectInfo"]["teamMembers"]:
        query = f"Find the LinkedIn profile url of {member['name']} working as {member['title']} at {startupName}"
        result = search_linkedln_url(query)
        linkedin_urls.append({
            "id": member["id"],
            "name": member["name"],
            "url": result  
        })

    state["teamMemberLinkedinUrls"] = linkedin_urls
    #print(state["teamMemberLinkedinUrls"])

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

    def scrape_linkedin_profile(url: str) -> Dict[str, Any]:
        if not url:
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

    rawProfiles = []
    for member in state["teamMemberLinkedinUrls"]:
        profile_data = scrape_linkedin_profile(member["url"])
        rawProfiles.append({
            "id": member["id"],
            "name": member["name"],
            "profile": profile_data
        })
    
    state["rawLinkedinProfiles"] = rawProfiles
    #print(state["rawLinkedinProfiles"])

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

    #print("Evaluating each team member individually...")

    analyzed_profiles = []
    for member_data in state["rawLinkedinProfiles"]:
        member_id = member_data["id"]
        member_name = member_data["name"]
        member_profile = member_data["profile"]

        team_member_info = {}
        for tm in state["projectInfo"]["teamMembers"]:
            if tm["id"] == member_id:
                team_member_info = tm
                break

        id_ = team_member_info.get("id", "")
        name_ = team_member_info.get("name", "")
        title_ = team_member_info.get("title", "")
        info_ = team_member_info.get("info", "")

        filtered_profile = {
            "firstName": member_profile.get("firstName", ""),
            "lastName": member_profile.get("lastName", ""),
            "headline": member_profile.get("headline", ""),
            "location": member_profile.get("location", ""),
            "summary": member_profile.get("summary", ""),
            "positions": member_profile.get("positions", {}),
            "schools": member_profile.get("schools", {}),
            "skills": member_profile.get("skills", []),
            "certifications": member_profile.get("certifications", {})
        }

        startup_name = state["projectInfo"]["startupName"]
        one_liner = state["projectInfo"]["oneLiner"]
        industry = state["projectInfo"]["industry"]

        prompt = (
            "You are a startup investor, and your goal is to identify the team member and put it clearly into two buckets.\n"
            "1. Very Talented and Exceptional: This team member is exceptional and has credentials and qualifications that an investor would look for in core team members of a startup in this industry.\n"
            "2. Average or good enough: This team member is good enough but does not stand out as exceptional.\n\n"
            "I want you to give subjective feedback, but the feedback you write should give clear information about if the particular team member is exceptional or just good enough.\n"
            "Don't make up any information. Be as specific as possible.\n"
            "Here is the information of the startup for which you will be evaluating this team member:\n"
            "Startup details:\n"
            f"Name: {startup_name}\n"
            f"About Startup - {one_liner}\n"
            f"About Startup Industry - {industry}\n\n"
            f"Team Member (from projectInfo):\n"
            f"id: {id_}\nname: {name_}\ntitle: {title_}\ninfo: {info_}\n\n"
            "Team Member's LinkedIn Profile Data (may be empty):\n"
            f"{json.dumps(filtered_profile, indent=2)}\n\n"
            "I want you to give subjective but accurate information on\n"
            "For this specific team member, return the following fields as a JSON object:\n"
            "   - id (from projectInfo)\n"
            "   - name (from projectInfo)\n"
            "   - title (from projectInfo)\n"
            "   - info (from projectInfo)\n"
            "   - academicCredentials: this should represent the list of educational institutes and degrees earned. If none found, then say, Not mentioned in profile\n"
            "   - qualityOfAcademicCredentials: give information about the ranking of institutes where the the degree is earned. Is it one of the top institutes? Give information for each of the education credentials\n"
            "   - workExperience: summarize previous roles and experiences relevant to the startup’s industry and this member's title\n"
            "   - depthOfWorkExperience: mention and quote some of the exceptional things the member has done. If you don't find anything exceptional, say Nothing exceptional\n"
            "   - relevantWorkExperience: from the past work experience, mention what are the things the member has done related to the work he is doing at current startup or related to the industry. We want to see if the person has relevant work experience or not. Be very specific when you extract this information and give exact references. If you don't find much information, say Not much information found\n\n"
            "Important Notes:\n"
            "- Do not invent or guess details. Only use the provided data from the startup info and LinkedIn profile.\n"
            "- Return ONLY a raw JSON object with these fields and no extra text. Do not include code fences or additional formatting.\n"
        )

        response = llm.invoke([HumanMessage(content=prompt)])

        try:
            analyzed_profile = json.loads(response.content)
            required_fields = [
                "id", "name", "title", "info", "academicCredentials",
                "qualityOfAcademicCredentials", "workExperience",
                "depthOfWorkExperience", "relevantWorkExperience"
            ]
            for field in required_fields:
                if field not in analyzed_profile:
                    analyzed_profile[field] = ""

            analyzed_profiles.append(analyzed_profile)
        except json.JSONDecodeError:
            analyzed_profiles.append({
                "id": member_id,
                "name": member_name,
                "title": "",
                "info": "",
                "academicCredentials": "",
                "qualityOfAcademicCredentials": "",
                "workExperience": "",
                "depthOfWorkExperience": "",
                "relevantWorkExperience": ""
            })

    state["analyzedTeamProfiles"] = analyzed_profiles
    #print(state["analyzedTeamProfiles"])

    table_prompt = (
        "You have the following JSON array of analyzed team profiles:\n"
        f"{json.dumps(analyzed_profiles, indent=2)}\n\n"
        "Please convert this JSON data into a well-formatted table. "
        "The columns should be the keys (id, name, title, info, academicCredentials, "
        "qualityOfAcademicCredentials, workExperience, depthOfWorkExperience, relevantWorkExperience) "
        "and each row should correspond to one team member.\n"
        "Do not add extra commentary or text, return ONLY the table."
    )

    table_response = llm.invoke([HumanMessage(content=table_prompt)])
    final_table = table_response.content
    state["teamInfo"] = final_table
    # print(state["teamInfo"])
    # with open("final_table.md", "w", encoding="utf-8") as f:
    #     f.write(final_table)

    return {
        "messages": [AIMessage(content="Final evaluation of the team completed.\n\n" + table_response.content + "\n\nTable saved as final_table.md")],
        "analyzedTeamProfiles": state["analyzedTeamProfiles"],
        "teamInfo": state["teamInfo"]
    }

graph_builder.add_node("start", start_node)
graph_builder.add_node("scrape_page", scrape_node)
graph_builder.add_node("extract_project_info", extract_project_info_node)
graph_builder.add_node("find_linkedin_urls", find_linkedin_urls_node)
graph_builder.add_node("scrape_linkedin_profiles", scrape_linkedin_profiles_node)
graph_builder.add_node("evaluate", evaluate_node)

graph_builder.add_edge(START, "start")
graph_builder.add_edge("start", "scrape_page")
graph_builder.add_edge("scrape_page", "extract_project_info")
graph_builder.add_edge("extract_project_info", "find_linkedin_urls")
graph_builder.add_edge("find_linkedin_urls", "scrape_linkedin_profiles")
graph_builder.add_edge("scrape_linkedin_profiles", "evaluate")

app = graph_builder.compile(checkpointer=memory)

# events = app.stream({"messages": [("user", "https://wefunder.com/neighborhoodsun")]}, config, stream_mode="values")
# for event in events:
#     event["messages"][-1].pretty_print()
