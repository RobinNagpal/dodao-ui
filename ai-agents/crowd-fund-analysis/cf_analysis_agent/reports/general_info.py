import traceback

from cf_analysis_agent.agent_state import AgentState
from cf_analysis_agent.utils.llm_utils import structured_llm_response
from cf_analysis_agent.utils.report_utils import create_report_file_and_upload_to_s3, update_report_status_failed, \
    update_report_status_in_progress

REPORT_NAME = "general_info"

def generate_project_info_report_node(state: AgentState):
    """
    Uses the LLM to produce a comprehensive, investor-facing report
    of the project's goals, achievements, product environment, etc.
    We exclude any risks, challenges, or assumptions.
    """
    combined_text = state.get("processed_project_info").get("combined_scrapped_content")

    prompt = (
        f"""
        Below are the details of the project. We need to show all the important information to the crowd-funding investors.
        The report should tell what does the startup do and capture the details about each of the headings below. You can skip some headings if they dont apply.

        1. Product/Service 
        2. Team Competence and Commitment
        3. Current traction or number of customers, or users
        4. Go-to-Market Strategy
        5. Market Opportunity and Total Addressable Market Size and explain how this size was calculated - Use your information, and not the provided data for this point.
        6. Revenue, Financial Health and Projections
        7. Business Model
        8. Marketing and Sales Strategy
        9. Most important highlights and milestones achieved so far
        10. Risks and Challenges
        
        STARTUP DETAILS:
        
        {combined_text}
  
        Return only the textual report of these details.
        """
    )
    return structured_llm_response(state.get("config"), "generate_project_info_report", prompt)


def create_general_info_report(state: AgentState) -> None:
    print("Generating general info report")
    project_id = state.get("project_info").get("project_id")
    try:
        update_report_status_in_progress(project_id, REPORT_NAME)
        report_content = generate_project_info_report_node(state)
        create_report_file_and_upload_to_s3(project_id, REPORT_NAME, report_content)
    except Exception as e:
        # Capture full stack trace
        print(traceback.format_exc())
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            REPORT_NAME,
            error_message=error_message
        )
