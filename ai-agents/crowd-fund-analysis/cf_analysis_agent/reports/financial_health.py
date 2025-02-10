import traceback

from cf_analysis_agent.agent_state import AgentState, get_combined_content, ReportType
from cf_analysis_agent.structures.report_structures import StructuredReportResponse
from cf_analysis_agent.utils.llm_utils import structured_report_response
from cf_analysis_agent.utils.prompt_utils import create_prompt_for_checklist
from cf_analysis_agent.utils.report_utils import update_report_status_failed, \
    update_report_status_in_progress, update_report_with_structured_output


def generate_financial_health_report(state: AgentState) -> StructuredReportResponse:
    """
    Analyzes the company's financial health based on SEC Form C filings and industry comparisons:
      - Historical spending analysis
      - Burn rate and runway calculations
      - Fund utilization efficiency
      - Industry benchmark comparisons
      - New funds allocation clarity
    """
    combined_content = get_combined_content(state)

    prompt = f"""
    You are a financial analyst specializing in startup financial health assessment. Analyze the company's financial 
    position based on their SEC Form C filings and industry benchmarks:

    **Financial Health Report Requirements**:

    1. **Financial Health Overview**:
       - Current cash position and liquidity analysis
       - Burn rate calculation (monthly/yearly)
       - Runway projection based on current financials
       - Debt-to-equity ratio analysis (if applicable)

    2. **Spending Analysis**:
       - Historical spending breakdown (past 3 years)
       - Current expense allocation (R&D, marketing, operations, etc.)
       - Comparison with industry averages for their sector
       - Notable spending patterns/red flags

    3. **Fund Utilization Efficiency**:
       - Capital efficiency analysis ($ spent per unit of traction)
       - Output generated vs funds consumed (product development, user growth, revenue)
       - Comparison of spend-to-results ratio with industry peers
       - Assessment of ROI on previous funding rounds

    4. **New Funds Allocation**:
       - Clear identification of proposed use of funds from filing
       - Analysis of allocation percentages to different categories
       - Assessment of whether planned spending addresses key challenges
       - Comparison with typical fund allocation patterns in their industry

    5. **Industry Comparison**:
       - Key financial metrics comparison (burn rate, CAC, LTV, etc.)
       - Sector-specific financial health benchmarks
       - Analysis of financial position relative to growth stage

    **Required Analysis**:
    - Identify any significant deviations from industry norms
    - Highlight both strengths and weaknesses in financial management
    - Assess sustainability of current financial trajectory
    - Evaluate clarity and specificity of new fund allocation plans
    - Provide recommendations for improving financial health

    **Format Requirements**:
    - Use markdown formatting with clear section headers
    - Include both quantitative analysis and qualitative insights
    - Present industry comparison data in table format
    - Highlight critical findings in bold
    - Maintain professional tone with actionable insights

    Return complete financial health analysis only.
        
    {create_prompt_for_checklist('Financial Health')}

    Here is the information you have about the startup:
    {combined_content}
    """

    return structured_report_response(
        state.get("config"),
        "detailed_financial_health_report",
        prompt
    )


def create_financial_health_report(state: AgentState) -> None:
    print("Generating financial health report")
    project_id = state.get("project_info").get("project_id")
    try:
        update_report_status_in_progress(project_id, ReportType.FINANCIAL_HEALTH)
        report_output = generate_financial_health_report(state)
        update_report_with_structured_output(project_id, ReportType.FINANCIAL_HEALTH, report_output)
    except Exception as e:
        print(traceback.format_exc())
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            ReportType.FINANCIAL_HEALTH,
            error_message=error_message
        )
