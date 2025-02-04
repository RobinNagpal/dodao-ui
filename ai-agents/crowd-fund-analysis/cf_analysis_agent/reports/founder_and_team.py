import json
import traceback
from typing import List, Dict, Any

from dotenv import load_dotenv
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_core.messages import HumanMessage
from linkedin_scraper import Person, actions
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from typing_extensions import TypedDict

from cf_analysis_agent.agent_state import AgentState, Config, ReportType
from cf_analysis_agent.structures.report_structures import StartupAndTeamInfoStructure
from cf_analysis_agent.utils.env_variables import LINKEDIN_EMAIL, LINKEDIN_PASSWORD
from cf_analysis_agent.utils.llm_utils import get_llm
from cf_analysis_agent.utils.report_utils import create_report_file_and_upload_to_s3, update_report_status_failed, \
    update_report_status_in_progress

load_dotenv()

search = GoogleSerperAPIWrapper()

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




def find_startup_info(config: Config, page_content: str) -> StartupAndTeamInfoStructure:
    prompt = (
        "From the scraped content, extract the following project info as JSON:\n\n"
        " - startup_name: str (The name of the project or startup being discussed)\n"
        " - startup_details: str (A single sentence explaining what the startup does)\n"
        " - industry: str (A brief overview of the industry, including how it has grown in the last 3-5 years, its expected growth in the next 3-5 years, challenges, and unique benefits for startups in this space)\n"
        " - team_members: list of objects {id: str (Unique ID for each team member, formatted as firstname_lastname), name: str (The name of the team member), title: str (The position of the team member in the startup), info: str (Details or additional information about the team member as mentioned on the startup page)}\n\n"
        "Return ONLY a raw JSON object. Do not include any code fences or additional text."

        f"Startup Info:\n{page_content}"
    )
    print("Fetching Team Info")
    structured_llm = get_llm(config).with_structured_output(StartupAndTeamInfoStructure)
    response = structured_llm.invoke([HumanMessage(content=prompt)])
    return response


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
        print(traceback.format_exc())
        return ""


def find_linkedin_urls(startup_info: StartupAndTeamInfoStructure):
    """
    Constructs queries from the projectInfo and teamMembers, uses GoogleSerperAPIWrapper to find LinkedIn URLs.
    If a valid LinkedIn profile is not found, stores an empty string or None for 'url'.
    """
    linkedin_urls: List[TeamMemberLinkedinUrl] = []
    startup_name = startup_info.get('startup_name')
    team_members = startup_info.get('team_members')

    for member in team_members:
        query = f"Find the LinkedIn profile url of {member['name']} working as {member['title']} at {startup_name}"
        result = search_linkedln_url(query)
        linkedin_urls.append({
            "id": member["id"],
            "name": member["name"],
            "url": result
        })

    return linkedin_urls


def scrape_linkedin_profiles(linkedin_urls: list):
    """
    Uses linkedin_scraper to retrieve LinkedIn profile data based on the URLs

    If a team member has no LinkedIn URL (empty string), their profile will be empty.
    """

    # Setup Selenium WebDriver
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")  # Disable GPU for better compatibility
    chrome_options.add_argument("--window-size=1920,1080")  # Optional: Set window size
    chrome_options.add_argument("--disable-dev-shm-usage")  # Overcome limited resources in containerized environments
    chrome_options.add_argument("--no-sandbox")  # Bypass OS security model (use with caution)

    driver = webdriver.Chrome(options=chrome_options)
    actions.login(driver, LINKEDIN_EMAIL, LINKEDIN_PASSWORD)

    def scrape_linkedin_profile(url: str) -> Dict[str, Any]:
        if not url:
            return {}
        try:
            # Scrape the LinkedIn profile using linkedin_scraper
            # Login to LinkedIn
            person = Person(url, driver=driver, scrape=False)
            person.scrape(close_on_complete=False)

            # Collect profile details
            return {
                "name": person.name,
                "experiences": person.experiences,
                "educations": person.educations,
            }
        except Exception as e:
            print(traceback.format_exc())
            return {}

    # Iterate through the LinkedIn URLs and scrape profiles
    raw_profiles: List[RawLinkedinProfile] = []
    for member in linkedin_urls:
        profile_data = scrape_linkedin_profile(member["url"])
        raw_profiles.append({
            "id": member["id"],
            "name": member["name"],
            "profile": profile_data
        })
    # Close the driver
    driver.quit()

    return raw_profiles


def evaluate_profiles(config: Config, raw_profiles: list, startup_info: StartupAndTeamInfoStructure):
    analyzed_profiles = []
    team_members = startup_info.get('team_members')
    for member_data in raw_profiles:
        member_id = member_data["id"]
        member_name = member_data["name"]
        member_profile = member_data["profile"]

        team_member_info = {}
        for tm in team_members:
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
            "experiences": member_profile.get("experiences", ""),
            "educations": member_profile.get("educations", ""),

        }

        startup_name = startup_info.get('startup_name')
        one_liner = startup_info.get('startup_details')
        industry = startup_info.get('industry')

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
            f"{filtered_profile}\n\n"
            "I want you to give subjective but accurate information on\n"
            "For this specific team member, return the following fields as a JSON object:\n"
            "   - id (from projectInfo)\n"
            "   - name (from projectInfo)\n"
            "   - title (from projectInfo)\n"
            "   - info (from projectInfo)\n"
            "   - academicCredentials: this should represent the list of educational institutes and degrees earned. If none found, then say, 'Failed to fetch'\n"
            "   - qualityOfAcademicCredentials: give information about the ranking of institutes where the the degree is earned. Is it one of the top institutes? Give information for each of the education credentials if the academic info is not present than right 'Failed to fetch'\n"
            "   - workExperience: summarize previous roles and experiences relevant to the startup’s industry and this member's title if not found write 'Failed to Fetch'\n"
            "   - depthOfWorkExperience: mention and quote some of the exceptional things the member has done.if you don't have info about work experience write 'Failed to fetch' .If you don't find anything exceptional, say Nothing exceptional\n"
            "   - relevantWorkExperience: if you don't have anything on work experience just say 'Failed to fetch' from the past work experience, mention what are the things the member has done related to the work he is doing at current startup or related to the industry. We want to see if the person has relevant work experience or not. Be very specific when you extract this information and give exact references. If you don't find much information, say Not much information found\n\n"
            "Important Notes:\n"
            "- Do not invent or guess details. Only use the provided data from the startup info and LinkedIn profile.\n"
            "- Return ONLY a raw JSON object with these fields and no extra text. Do not include code fences or additional formatting.\n"
        )
        llm = get_llm(config)
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
            print(traceback.format_exc())
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

    table_prompt = """Based on the below JSON array of analyzed team profiles, convert this JSON data into a well-formatted markdown content
        with a table for each team member. The rows of the table should be fields (id, name, title, info, academicCredentials,
        qualityOfAcademicCredentials, workExperience, depthOfWorkExperience, relevantWorkExperience) and Field Name and Value should 
        be in separate columns.
        
        Create a separate table for each team member. 
        
        
         .""" + json.dumps(analyzed_profiles, indent=2)
    table_response = get_llm(config).invoke([HumanMessage(content=table_prompt)])
    return table_response.content


def create_founder_and_team_report(state: AgentState) -> None:
    """
    Orchestrates the entire team info analysis process.
    """
    project_id = state.get("project_info").get("project_id")
    print("Generating team info")
    try:
        combined_text = state.get("processed_project_info").get("combined_scrapped_content")
        update_report_status_in_progress(project_id, ReportType.FOUNDER_AND_TEAM)
        startup_info: StartupAndTeamInfoStructure = find_startup_info(state.get("config"), combined_text)
        linkedin_urls = find_linkedin_urls(startup_info)
        raw_profiles = scrape_linkedin_profiles(linkedin_urls)
        team_info_report = evaluate_profiles(state.get("config"), raw_profiles, startup_info)
        create_report_file_and_upload_to_s3(project_id, ReportType.FOUNDER_AND_TEAM, team_info_report)
    except Exception as e:
        # Capture full stack trace
        print(traceback.format_exc())
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            ReportType.FOUNDER_AND_TEAM,
            error_message=error_message
        )
