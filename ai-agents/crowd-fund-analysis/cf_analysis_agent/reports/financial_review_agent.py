import json

from langchain_core.messages import HumanMessage
from typing_extensions import TypedDict

from cf_analysis_agent.agent_state import AgentState, Config
from cf_analysis_agent.utils.llm_utils import get_llm
from cf_analysis_agent.utils.report_utils import create_report_file_and_upload_to_s3, update_report_status_failed, \
    update_report_status_in_progress

REPORT_NAME = "financial_review"

class FormCData(TypedDict):
    offering_statement_date: str
    recent_fiscal_year: int
    previous_fiscal_year: int
    financials: dict

class AdditionalData(TypedDict):
    financials: dict
    relevant_metrics: dict

def extract_data_from_sec_node(sec_content: str,config:Config):
    """
    Scrapes the SEC filing page and extracts Form C financial data with retry logic.
    
    Args:
        state: The state object containing data and configurations.
        max_retries: Maximum number of retry attempts (default: 5).
        retry_delay: Time (in seconds) to wait between retries (default: 5 seconds).
    """
    prompt = (
        "Extract the following financial information for both the most recent fiscal year "
        "Also extract the years for the most recent fiscal year and prior fiscal year so the user can identify both\n"
        "and the prior fiscal year from the content:\n\n"
        "- Current Number of Employees\n"
        "- Total Assets\n"
        "- Cash and Cash Equivalents\n"
        "- Accounts Receivable\n"
        "- Short-term Debt\n"
        "- Long-term Debt\n"
        "- Revenue/Sales\n"
        "- Cost of Goods Sold\n"
        "- Taxes Paid\n"
        "- Net Income\n\n"
        "Also, extract the 'date of the offering statement and most recent fiscal year' mentioned at the end of the page.\n\n"
        "Return a JSON object structured as:\n"
        "{\n"
        "  'offering_statement_date': str,\n"
        "  'recent_fiscal_year': int,\n"
        "  'previous_fiscal_year': int,\n"
        "  'financials': {\n"
        "    'Metric Name': {'most_recent': str, 'prior': str},\n"
        "    ...\n"
        "  }\n"
        "}\n\n"
        f"Content:\n{sec_content}"
    )

    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])
    response_content = response.content.strip()
    if response_content.startswith("```json"):
        response_content = response_content[7:-3].strip()

    form_c_data = json.loads(response_content)
    return form_c_data

def extract_additional_data_node(combined_text:str, config:Config):
    """
    Extracts financials and other relevant metrics from the scraped additional links.
    """
    all_metrics = {}
    relevant_metrics = {}

    # List of metrics to exclude
    excluded_metrics = {
        "Total Assets",
        "Cash & Cash Equivalents",
        "Accounts Receivable",
        "Short-Term Debt",
        "Long-Term Debt",
        "Revenue & Sales",
        "Costs of Goods Sold",
        "Taxes Paid",
        "Net Income",
    }


    prompt = (
        "From the content provided, extract the following details:\n"
        "- Financial metrics\n"
        "- Any other relevant information for investors\n\n"
        "Return a JSON object with the structure:\n"
        "{\n"
        "  'financials': {\n"
        "    'Metric Name': str,\n"
        "    ...\n"
        "  },\n"
        "  'relevant_metrics': {\n"
        "    'Key Info': str,\n"
        "    ...\n"
        "  }\n"
        "}\n\n"
        f"Content:\n{combined_text}"
    )
    llm = get_llm(config)
    response = llm.invoke([HumanMessage(content=prompt)])   
    response_content = response.content.strip()
    if response_content.startswith("```json"):
        response_content = response_content[7:-3].strip()
    extracted_data = json.loads(response_content)

    # Filter out excluded metrics
    financials = {
        k: v for k, v in extracted_data.get("financials", {}).items()
        if k not in excluded_metrics
    }
    all_metrics.update(financials)
    relevant_metrics.update(extracted_data.get("relevant_metrics", {}))

    additional_data={
        "financials": all_metrics,
        "relevant_metrics": relevant_metrics
    }
    return additional_data

def create_consolidated_table_node(form_c_data: FormCData, additional_data: AdditionalData):
    """
    Combines SEC filing data and additional data into comprehensive tables.
    Maintains years for Form C financial data while simplifying additional data 
    to only include current values for financials and relevant metrics.
    """

    # Build the table for Form C financial data
    form_c_table = "| Metric              | Most Recent Fiscal Year | Prior Fiscal Year |\n"
    form_c_table += "|---------------------|--------------------------|-------------------|\n"
    for metric, values in form_c_data["financials"].items():
        form_c_table += f"| {metric} | {values.get('most_recent', 'N/A')} | {values.get('prior', 'N/A')} |\n"

    # Build the table for additional data (financials and relevant metrics combined)
    additional_table = "| Metric              | Value                   |\n"
    additional_table += "|---------------------|--------------------------|\n"
    for metric, value in additional_data["financials"].items():
        additional_table += f"| {metric} | {value} |\n"
    for key, value in additional_data["relevant_metrics"].items():
        additional_table += f"| {key} | {value} |\n"

    # Consolidate the tables into a single markdown content
    consolidated_content = (
        "### Form C Financial Data\n"
        + form_c_table
        + "\n### Additional Data (Financials and Relevant Metrics)\n"
        + additional_table
    )

    return consolidated_content



def prepare_investor_report_with_analyses_node(combined_text:str,form_c_data:FormCData,additional_data:AdditionalData,consolidated_table:str, config: Config):
    """
    Prepares a comprehensive investor report with:
    - Sector identification.
    - Generic and sector-specific feedback on financial and relevant metrics.
    - Consolidation of sector-specific financial outlook.
    - Final report combining all insights and analysis.
    """
    # 1. Identify Sector and Generate Sector-Specific Financial Outlook
    sector_prompt = (
        "Based on the startup's financial and relevant metrics, as well as the scraped content below, identify the primary industry or sector it operates in.\n\n"
        f"Scraped Content:\n{combined_text}\n\n"
        "Return only the sector name."
    )
    llm = get_llm(config)
    sector_response = llm.invoke([HumanMessage(content=sector_prompt)])
    sector = sector_response.content.strip() if sector_response else "Unknown Sector"

    sector_outlook_prompt = (
        f"Provide a professional analysis of what a typical financial outlook looks like for startups in the '{sector}' industry. "
        "For this sector, what does a normal financial outlook look like for a startup? For example, how much spending is needed, when can the startup turn profitable, and what are the major expenses overall."
    )
    sector_outlook_response = llm.invoke([HumanMessage(content=sector_outlook_prompt)])
    sector_outlook = sector_outlook_response.content.strip() if sector_outlook_response else "No sector outlook available."

    # 2. Generate Generic Feedback
    generic_feedback_prompt = (
        "Analyze the financial and relevant metrics in the table below and provide feedback for each metric. "
        "Feedback should assess the metric's alignment with general industry norms and highlight potential risks or opportunities.\n\n"
        f"{consolidated_table}\n\n"
        "Return feedback for each metric as a JSON object with keys as metric names and values as feedback. "
        "Do not include any text or formatting outside the JSON object."
    )
    generic_feedback_response = llm.invoke([HumanMessage(content=generic_feedback_prompt)])
    response_content = generic_feedback_response.content.strip()
    if response_content.startswith("```json"):
        response_content = response_content[7:-3].strip()
    try:
        generic_feedback = json.loads(response_content)
    except json.JSONDecodeError:
        #print("Failed to parse Generic Feedback JSON:", response_content)
        generic_feedback = {}

    # 3. Generate Sector-Specific Feedback
    sector_specific_feedback_prompt = (
        f"The startup operates in the '{sector}' industry. Analyze the financial and relevant metrics in the table below and provide sector-specific insights. "
        "Insights should assess whether the metric is typical, above average, or below average for this sector and explain why.\n\n"
        f"{consolidated_table}\n\n"
        "Return sector-specific insights for each metric as a JSON object with keys as metric names and values as insights. "
        "Do not include any text or formatting outside the JSON object."
    )
    sector_specific_feedback_response = llm.invoke([HumanMessage(content=sector_specific_feedback_prompt)])
    response_content = sector_specific_feedback_response.content.strip()
    if response_content.startswith("```json"):
        response_content = response_content[7:-3].strip()
    try:
        sector_specific_feedback = json.loads(response_content)
    except json.JSONDecodeError:
        #print("Failed to parse Sector-Specific Feedback JSON:", response_content)
        sector_specific_feedback = {}

    # 4. Process and Enhance Tables
    # Form C Financial Data Table
    form_c_table = "| Metric              | Most Recent Fiscal Year | Prior Fiscal Year | Generic Feedback                  | Sector-Specific Insight         |\n"
    form_c_table += "|---------------------|--------------------------|-------------------|------------------------------------|----------------------------------|\n"
    for metric, values in form_c_data["financials"].items():
        feedback = generic_feedback.get(metric, f"No feedback provided for {metric}.")
        sector_insight = sector_specific_feedback.get(metric, f"No sector-specific insight available for {metric}.")
        most_recent = values.get("most_recent", "N/A")
        prior = values.get("prior", "N/A")
        form_c_table += f"| {metric} | {most_recent} | {prior} | {feedback} | {sector_insight} |\n"

    # Additional Data Table (financials and relevant metrics combined)
    additional_table = "| Metric              | Value                   | Generic Feedback                  | Sector-Specific Insight         |\n"
    additional_table += "|---------------------|--------------------------|------------------------------------|----------------------------------|\n"
    for metric, value in additional_data["financials"].items():
        feedback = generic_feedback.get(metric, "No feedback provided.")
        sector_insight = sector_specific_feedback.get(metric, "No sector-specific insight available.")
        additional_table += f"| {metric} | {value} | {feedback} | {sector_insight} |\n"
    for key, value in additional_data["relevant_metrics"].items():
        feedback = generic_feedback.get(key, "No feedback provided.")
        sector_insight = sector_specific_feedback.get(key, "No sector-specific insight available.")
        additional_table += f"| {key} | {value} | {feedback} | {sector_insight} |\n"


    # 5. Combine All Information into Final Report
    report = f"""
# Financial Review

## Sector Identification
**Sector:** {sector}

## Sector-Specific Financial Outlook
{sector_outlook}

## Form C Financial Data with Feedback
{form_c_table}

## Additional Data (Financials and Relevant Metrics) with Feedback
{additional_table}
"""
    return report

def create_financial_review_report(state: AgentState) -> None:
    """
    Orchestrates the entire green flags analysis process.
    """
    project_id = state.get("project_info").get("project_id")
    print("Generating financial review report")
    try:
        update_report_status_in_progress(project_id, REPORT_NAME)
        combined_text = state.get("processed_project_info").get("combined_scrapped_content")
        sec_content = state.get("processed_project_info").get("sec_scraped_content")
        form_c_data = extract_data_from_sec_node(sec_content,state.get("config"))
        additional_data = extract_additional_data_node(combined_text,state.get("config"))
        consolidated_table = create_consolidated_table_node(form_c_data,additional_data)
        final_report = prepare_investor_report_with_analyses_node(combined_text,form_c_data,additional_data,consolidated_table,state.get("config"))
        create_report_file_and_upload_to_s3(project_id, REPORT_NAME, final_report)
        
    except Exception as e:
        # Capture full stack trace
        error_message = str(e)
        print(f"An error occurred:\n{error_message}")
        update_report_status_failed(
            project_id,
            REPORT_NAME,
            error_message=error_message
        )
