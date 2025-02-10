import traceback

from cf_analysis_agent.agent_state import AgentState, get_combined_content, ReportType
from cf_analysis_agent.structures.report_structures import StructuredReportResponse
from cf_analysis_agent.utils.llm_utils import structured_report_response
from cf_analysis_agent.utils.prompt_utils import create_prompt_for_checklist
from cf_analysis_agent.utils.report_utils import create_report_file_and_upload_to_s3, update_report_status_failed, \
    update_report_status_in_progress, update_report_with_structured_output


def generate_market_opportunity_report(state: AgentState) -> StructuredReportResponse:
    """
    Uses the LLM to critically evaluate market opportunity including TAM, SAM, SOM analysis
    """
    combined_content = get_combined_content(state)

    prompt = f"""
    You are an expert market analyst evaluating a startup's market opportunity. Analyze this information:
    

    **Task**:
    1. Conduct a critical analysis of the market opportunity focusing SPECIFICALLY on the startup's target sector. Dont user
    the provided numbers. Use you own knowledge and research to provide a realistic assessment of the market opportunity.:
       a) Total Addressable Market (TAM): 
          - Calculate realistic and not optimistic TAM using bottom-up approach
          - Detail assumptions: Geographic limits, customer demographics, pricing constraints
          - Compare with startup's claimed TAM (if any)
          
       b) Serviceable Available Market (SAM):
          - Identify realistically obtainable market share considering competition
          - Factor in regulatory constraints and market entry barriers
          - Compare with startup's SAM claims
          
       c) Serviceable Obtainable Market (SOM):
          - Estimate achievable market share in 3-5 years
          - Consider startup's resources, competition, and go-to-market strategy
          - Compare with startup's projections

    2. For each metric (TAM/SAM/SOM):
       - Explain your calculation methodology
       - Highlight sector-specific risks and opportunities
       - State whether the startup's claims are realistic (Support with evidence)
       - Provide realistic and not optimistic estimates with detailed rationale

    3. Critical evaluation requirements:
       - Challenge assumptions in the provided content
       - Identify gaps between claims and market reality
       - Flag any optimistic biases in the startup's numbers
       - Consider substitute products and market saturation risks

    4. Final assessment:
       - Overall realism of market opportunity claims
       - Key risks and validation needs
       - Recommended realistic and not optimistic adjustments

    Present your analysis with clear section headings and logical flow. Maintain rigorous skepticism while being fair.
    
    {create_prompt_for_checklist('Market Opportunity Analysis')}
        
    {combined_content}
    """

    return structured_report_response(
        state.get("config"),
        "detailed_market_opportunity_report",
        prompt
    )

def create_market_opportunity_report(state: AgentState) -> None:
    print("Generating market opportunity report")
    project_id = state.get("project_info").get("project_id")
    try:
        update_report_status_in_progress(project_id, ReportType.MARKET_OPPORTUNITY)
        report_output = generate_market_opportunity_report(state)
        update_report_with_structured_output(project_id, ReportType.MARKET_OPPORTUNITY, report_output)
    except Exception as e:
        print(traceback.format_exc())
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            ReportType.MARKET_OPPORTUNITY,
            error_message=error_message
        )
