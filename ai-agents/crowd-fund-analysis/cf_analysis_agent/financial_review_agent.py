from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict
from typing import Annotated, List
from dotenv import load_dotenv
import os
import json
import time
from cf_analysis_agent.utils.llm_utils import get_llm
from cf_analysis_agent.utils.project_utils import scrape_project_urls, scrape_sec_url

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")

class FormCData(TypedDict):
    offering_statement_date: str
    recent_fiscal_year: int
    previous_fiscal_year: int
    financials: dict

class AdditionalData(TypedDict):
    financials: dict
    relevant_metrics: dict

class State(TypedDict):
    messages: Annotated[list, add_messages]
    secUrl: str
    project_urls: List[str]  # Additional links other than SEC filings
    scraped_content: List[str]  # Store scraped content for each link
    form_c_data: FormCData
    additional_data: AdditionalData
    consolidated_table: str
    finalFinancialReport: str

graph_builder = StateGraph(State)
memory = MemorySaver()
config = {"configurable": {"thread_id": "3"}}



def scrape_and_extract_sec_node(state: State, config, max_retries=10, retry_delay=5):
    """
    Scrapes the SEC filing page and extracts Form C financial data with retry logic.
    
    Args:
        state: The state object containing data and configurations.
        max_retries: Maximum number of retry attempts (default: 5).
        retry_delay: Time (in seconds) to wait between retries (default: 5 seconds).
    """
    attempts = 0

    while attempts < max_retries:
        try:
            
            # Successfully scraped content
            state["scraped_content"] = scrape_sec_url(state)
            break  # Exit the loop if successful

        except Exception as e:
            attempts += 1
            print(f"Error scraping SEC URL: {e}. Retrying in {retry_delay} seconds...")
            time.sleep(retry_delay)

            # Clear scraped content state on failure
            state["scraped_content"] = []

    # If scraping failed after all retries, return an error
    if not state["scraped_content"]:
        return {"messages": [AIMessage(content=f"Failed to scrape SEC URL after {max_retries} attempts.")]}

    # LLM prompt for extracting Form C data
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
        f"Content:\n{state['scraped_content'][0]}"
    )

    try:
        llm = get_llm(config)
        response = llm.invoke([HumanMessage(content=prompt)])
        response_content = response.content.strip()
        if response_content.startswith("```json"):
            response_content = response_content[7:-3].strip()

        form_c_data = json.loads(response_content)
        state["form_c_data"] = form_c_data
        #print("Extracted Form C Data:", form_c_data)

        # Generate table
        table = "| Metric              | Most Recent Fiscal Year | Prior Fiscal Year |\n"
        table += "|---------------------|--------------------------|-------------------|\n"
        for metric, values in form_c_data["financials"].items():
            table += f"| {metric} | {values.get('most_recent', 'N/A')} | {values.get('prior', 'N/A')} |\n"

        return {
            "messages": [AIMessage(content="SEC Form C data extracted successfully.")],
            "form_c_data": state["form_c_data"]
        }
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        #print(f"LLM Response: {response.content}")
        return {"messages": [AIMessage(content="Error parsing SEC data.")]}


def scrape_additional_links_node(state: State):
    """
    Scrapes all additional links related to the startup.
    """
    scraped_content = state["scraped_content"]
    scraped_content_list = scrape_project_urls(state)
    state["scraped_content"]= scraped_content+scraped_content_list


    return {
        "messages": [AIMessage(content="Project URLs scraped successfully.")],
        "scraped_content": state["scraped_content"]
    }


def extract_additional_data_node(state: State, config):
    """
    Extracts financials and other relevant metrics from the scraped additional links.
    """
    scraped_content = state["scraped_content"]
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

    for content in scraped_content[1:]:
        if "Failed to scrape" in content:
            continue

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
            f"Content:\n{content}"
        )
        llm = get_llm(config)
        response = llm.invoke([HumanMessage(content=prompt)])
        try:
            #print(response)
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

        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e} for link")

    state["additional_data"] = {
        "financials": all_metrics,
        "relevant_metrics": relevant_metrics
    }

    # Generate table
    table = "| Metric              | Value                   |\n"
    table += "|---------------------|--------------------------|\n"
    for metric, value in all_metrics.items():
        table += f"| {metric} | {value} |\n"

    table += "\n### Relevant Metrics\n"
    table += "| Metric              | Value                   |\n"
    table += "|---------------------|--------------------------|\n"
    for key, value in relevant_metrics.items():
        table += f"| {key} | {value} |\n"

    return {
        "messages": [AIMessage(content="Additional financial data extracted successfully.")],
        "additional_data": state["additional_data"]
    }


def create_consolidated_table_node(state: State):
    """
    Combines SEC filing data and additional data into comprehensive tables.
    Maintains years for Form C financial data while simplifying additional data 
    to only include current values for financials and relevant metrics.
    """
    form_c_data = state["form_c_data"]
    additional_data = state["additional_data"]

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

    state["consolidated_table"] = consolidated_content

    return {
        "messages": [AIMessage(content="Consolidated table created successfully.")],
        "consolidated_table": state["consolidated_table"]
    }



def prepare_investor_report_with_analyses_node(state: State, config):
    """
    Prepares a comprehensive investor report with:
    - Sector identification.
    - Generic and sector-specific feedback on financial and relevant metrics.
    - Consolidation of sector-specific financial outlook.
    - Final report combining all insights and analysis.
    """
    consolidated_table = state["consolidated_table"]
    form_c_data = state["form_c_data"]
    additional_data = state["additional_data"]

    # 1. Identify Sector and Generate Sector-Specific Financial Outlook
    sector_prompt = (
        "Based on the startup's financial and relevant metrics, as well as the scraped content below, identify the primary industry or sector it operates in.\n\n"
        f"Scraped Content:\n{state['scraped_content']}\n\n"
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
    # Save the Final Report
    state["finalFinancialReport"] = report
    # with open("final_investor_report.md", "w", encoding="utf-8") as f:
    #     f.write(report)

    # Update State
    #print("Final Investor Report Generated:\n", report)

    return {
        "messages": [AIMessage(content="Final comprehensive report generated and saved as `final_investor_report.md`.")],
        "finalFinancialReport": state["finalFinancialReport"]
    }



# Add nodes to the graph
graph_builder.add_node("scrape_project_urls", scrape_project_urls)
graph_builder.add_node("scrape_and_extract_sec", scrape_and_extract_sec_node)
graph_builder.add_node("scrape_additional_links", scrape_additional_links_node)
graph_builder.add_node("extract_additional_data", extract_additional_data_node)
graph_builder.add_node("create_consolidated_table", create_consolidated_table_node)
graph_builder.add_node("prepare_investor_report_with_analyses_node", prepare_investor_report_with_analyses_node)

# Define edges (control flow)
graph_builder.add_edge(START, "scrape_project_urls")
graph_builder.add_edge("scrape_project_urls", "scrape_and_extract_sec")
graph_builder.add_edge("scrape_and_extract_sec", "scrape_additional_links")
graph_builder.add_edge("scrape_additional_links", "extract_additional_data")
graph_builder.add_edge("extract_additional_data", "create_consolidated_table")
graph_builder.add_edge("create_consolidated_table", "prepare_investor_report_with_analyses_node")

app = graph_builder.compile(checkpointer=memory)

# # Example run
# events = app.stream(
#     {
#         "messages": [
#             (
#                 "user",
#                 "https://www.sec.gov/Archives/edgar/data/1691595/000167025424000661/xslC_X01/primary_doc.xml"
#             )
#         ],
#         "url_to_scrape": "https://www.sec.gov/Archives/edgar/data/1691595/000167025424000661/xslC_X01/primary_doc.xml",
#         "additional_links": [
#             "https://wefunder.com/neighborhoodsun",
#             "https://neighborhoodsun.solar/",
#         ],
#         "scraped_content": {},
#     },
#     config,
#     stream_mode="values"
# )
# for event in events:
#     event["messages"][-1].pretty_print()
