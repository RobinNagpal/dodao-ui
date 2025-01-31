from langchain_core.messages import HumanMessage
from cf_analysis_agent.agent_state import AgentState, Config
from cf_analysis_agent.utils.llm_utils import get_llm
from cf_analysis_agent.utils.report_utils import upload_report_to_s3, update_status_file

REPORT_NAME = "green_flags"

def find_industry_details(config: Config, combined_text: str):
    """
    Examines the combinedScrapedContent and extracts a summary of the startup's industry,
    storing it in state['extractedIndustryDetails'].
    """

    prompt = (
    "From the text below, extract any relevant details or discussion regarding the startup’s industry. "
    "Focus on the following aspects:\n"
    "1) An overview of the industry.\n"
    "2) Which countries or markets this industry is relevant to (if mentioned).\n"
    "3) Growth trends of this industry in the last 2 years.\n"
    "4) Projected or anticipated growth for the next 3 years.\n"
    "5) Potential or common challenges faced by other startups in this industry.\n"
    "6) Unique benefits or opportunities within this industry.\n"
    "7) Any additional important points or insights about the industry mentioned in the text.\n\n"
    f"{combined_text}\n\n"
    "Return only the textual summary of these industry details, as concise as possible but covering each requested item."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()

def find_startup_green_flags(config: Config, combined_text: str):
    """
    Uses the LLM to extract green flags from the combinedScrapedContent.
    We exclude any team-related or purely financial details as per requirements.
    """
    prompt = (
        "Using the information below, highlight the green flags of the startup. "
        "Only include information that instills confidence in investors, focusing on aspects like product innovation, "
        "market opportunity, scalability, partnerships, and strategic positioning. "
        "Avoid forcing any information that does not clearly align with investor confidence, and exclude details "
        "related to the startup's team or purely financial metrics.\n\n"
        f"Scraped Content:\n{combined_text}\n\n"
        "Return a clear text describing the startup's green flags."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()

def find_industry_green_flags(config: Config, industry_details: str):
    """
    Finds the 10 most commonly recognized green flags in the startup's industry.
    We rely on the 'industry' field in projectInfo or from scraped content.
    """
    prompt = (
        "Given the following industry description, outline the 10 most commonly recognized green flags for startups in this industry. "
        "Provide a clear list of these critical indicators of success.\n\n"
        f"Industry Info:\n{industry_details}\n\n"
        "Return a comprehensive list of the most critical indicators of success for startups in this industry.. You may add short explanations for each."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()

def evaluate_green_applicable_to_startup(config: Config, startup_gf: str, industry_gf: str):
    """
    Compares the startup's green flags to the 10 industry green flags, highlighting
    strengths, partial alignments, etc.
    """
    prompt = (
        "Below are two pieces of information:\n\n"
        "1) The startup's identified green flags:\n"
        f"{startup_gf}\n\n"
        "2) The 10 most critical industry-standard green flags:\n"
        f"{industry_gf}\n\n"
        "Evaluate the startup's green flags by comparing them against the 10 most critical industry-standard green flags. "
        "Provide a detailed analysis of how the startup aligns with each measure, highlighting "
        "strengths or partial alignments."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()

def finalize_green_flags_report(config: Config, startup_gf: str, industry_gf: str, gf_evaluation: str):
    """
    Produces the final textual report integrating the startup's green flags,
    the industry’s standard flags, and the evaluation results.
    """
    prompt = (
        "You have three pieces of content:\n\n"
        "1) The startup's green flags:\n"
        f"{startup_gf}\n\n"
        "2) The top 10 industry-standard green flags:\n"
        f"{industry_gf}\n\n"
        "3) The evaluation of how the startup aligns with these industry standards:\n"
        f"{gf_evaluation}\n\n"
        "Now create a final, detailed report focusing ONLY on the startup's green flags, integrating the identified industry-standard green flags and the evaluation of the startup’s performance against them. "
        "The report should only cover green flags. "
        "If a particular parameter does not indicate a green flag, remove it from the report. Avoid any repetition of information unless necessary. "
        "Return only the textual report."
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()

def create_green_flags_report(state: AgentState) -> None:
    """
    Orchestrates the entire green flags analysis process.
    """
    project_id = state.get("project_info").get("project_id")
    print("Generating green flags report")
    try:
        combined_text = state.get("processed_project_info").get("combined_scrapped_content")
        industry_details = find_industry_details(state.get("config"), combined_text)
        startup_gfs = find_startup_green_flags(state.get("config"), combined_text)
        industry_gfs = find_industry_green_flags(state.get("config"), industry_details)
        gf_evaluation = evaluate_green_applicable_to_startup(state.get("config"), startup_gfs, industry_gfs)
        final_green_flags_report = finalize_green_flags_report(state.get("config"), startup_gfs, industry_gfs, gf_evaluation)
        upload_report_to_s3(project_id, REPORT_NAME, final_green_flags_report)
    except Exception as e:
        # Capture full stack trace
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_status_file(
            project_id,
            REPORT_NAME,
            "failed",
            error_message=error_message
        )
