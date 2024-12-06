import json
from typing import List, Dict, Any
from langchain.chat_models import ChatOpenAI
from langchain.schema import SystemMessage, HumanMessage

def scrape_wefunder_page(url: str) -> str:
    """
    Scrape the entire Wefunder project page and return the text content.
    """
    from langchain.document_loaders import ScrapingAntLoader
    loader = ScrapingAntLoader(url=url)
    docs = loader.load()
    if docs:
        return docs[0].page_content
    return "No content found."

def identify_team_members(page_content: str, llm: ChatOpenAI) -> List[Dict[str, str]]:
    """
    Use LLM to identify team members from the Wefunder page content.
    Returns a list of dicts: [{"name": "", "role": "", "description": ""}, ...]
    """
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
        return team_data
    except:
        return []

def find_linkedin_profiles(team_members: List[Dict[str, str]], llm: ChatOpenAI) -> List[Dict[str, str]]:
    """
    For each team member, attempt to find their LinkedIn profile using the integrated tool (tavily search).
    This function assumes llm_with_tools is being used in main.py, so here we just show logic.
    """
    # This function’s logic depends on how the tool is invoked in the main file.
    # We'll leave it as a placeholder.
    linkedin_results = []
    for member in team_members:
        name = member["name"]
        role = member.get("role", "")
        query = f"Find LinkedIn profile for {name}, who is a {role} at this startup."
        # The LLM with tools is expected to be invoked outside this function. 
        # Here you would call the graph or LLM with the query to use the tavily tool.
        # For demonstration, we leave the logic abstract:
        # result = llm_with_tools.invoke([HumanMessage(content=query)])
        # Parse result to find linkedin_url:
        member["linkedin_url"] = ""  # Placeholder
        linkedin_results.append(member)
    return linkedin_results

def scrape_linkedin_profile(link_url: str) -> str:
    """
    Scrape the LinkedIn page for a team member and return the raw text.
    """
    if not link_url:
        return ""
    from langchain.document_loaders import ScrapingAntLoader
    loader = ScrapingAntLoader(url=link_url)
    docs = loader.load()
    if docs:
        return docs[0].page_content
    return ""

def extract_member_qualifications(linkedin_content: str, llm: ChatOpenAI) -> Dict[str, Any]:
    """
    Given the LinkedIn page content, ask LLM to extract:
    - experience (roles, companies, dates)
    - academic_background (degrees, institutions, graduation years)
    - certifications
    - other_qualifications
    Return as a dict with keys: experience, academic_background, certifications, other_qualifications
    """
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
        return data
    except:
        return {
            "experience": [],
            "academic_background": [],
            "certifications": [],
            "other_qualifications": []
        }

def extract_general_info_facts(page_content: str, llm: ChatOpenAI) -> Dict[str, Any]:
    """
    Given the entire project's details from the crowdfunding platform, 
    extract general info/facts that would be useful to an investor.
    Exclude risks, challenges, or assumptions. Only rely on provided info.
    Focus on goals, achievements, product environment, and other factual info.
    """
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
    """
    Identify what credentials an investor should look for in the core team members of a startup in this industry.
    Return a list of 10 most important credentials.
    """
    system_prompt = """You are an expert in this industry. Based on the startup described, 
    identify the 10 most important credentials or qualities an investor should look for in the core team members 
    of a startup in this industry. Do not add extra commentary, just return a JSON list of strings."""
    response = llm([SystemMessage(content=system_prompt)])
    try:
        creds = json.loads(response.content)
        if isinstance(creds, list) and len(creds) == 10:
            return creds
        else:
            # If not valid format, return empty or try parsing differently
            return []
    except:
        return []

def compare_team_experience_to_industry_needs(industry_credentials: List[str], team_with_qualifications: List[Dict[str, Any]], llm: ChatOpenAI) -> str:
    """
    Compare the team's experience against the needed industry credentials and generate a structured report.
    
    Inputs:
    - industry_credentials: A list of credentials essential for success in this industry.
    - team_with_qualifications: A list of team members, each with their qualifications (experience, academic_background, certifications, other_qualifications).
    
    Task:
    - Evaluate the core team collectively against the provided industry credentials.
    - Identify which credentials the team excels in (based solely on provided data).
    - Identify which credentials the team has limited experience or lacks expertise in.
    - Avoid generalizations, assumptions, recommendations, or repetition.
    - Present the analysis as a structured textual report with clear headings or sections.
    - The report should contain no extra commentary, just the evaluation results.
    
    Returns:
    - A string containing the structured report.
    """

    # Convert the data to strings for the LLM
    team_data_str = json.dumps(team_with_qualifications, indent=2)
    creds_str = json.dumps(industry_credentials, indent=2)

    # System prompt explaining the inputs and desired output
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
    # The response is expected to be a structured text report 
    return response.content
