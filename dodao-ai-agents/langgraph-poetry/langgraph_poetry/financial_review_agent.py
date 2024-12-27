from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import ScrapingAntLoader
from langchain_core.messages import HumanMessage, AIMessage
from langgraph.checkpoint.memory import MemorySaver
from typing_extensions import TypedDict
from typing import Annotated, List, Dict
from dotenv import load_dotenv
import os
import json

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")

llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)

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
    url_to_scrape: str
    additional_links: List[str]  # Additional links other than SEC filings
    scraped_content: Dict[str, str]  # Store scraped content for each link
    form_c_data: FormCData
    additional_data: AdditionalData
    consolidated_table: str

graph_builder = StateGraph(State)
memory = MemorySaver()
config = {"configurable": {"thread_id": "3"}}

def scrape_and_extract_sec_node(state: State):
    """
    Scrapes the SEC filing page and extracts Form C financial data.
    """
    url_to_scrape = state["url_to_scrape"]
    try:
        print(f"Scraping SEC URL: {url_to_scrape}")
        loader = ScrapingAntLoader([url_to_scrape], api_key=SCRAPINGANT_API_KEY)
        documents = loader.load()
        page_content = documents[0].page_content
        state["scraped_content"] = {url_to_scrape: page_content}
    except Exception as e:
        state["scraped_content"] = {}
        return {"messages": [AIMessage(content=f"Failed to scrape SEC URL: {e}")]}

    # LLM prompt for extracting Form C data
    prompt = (
        "Extract the following financial information for both the most recent fiscal year "
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
        "Also, extract the 'date of the offering statement' mentioned at the end of the page.\n\n"
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
        f"Content:\n{page_content}"
    )

    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        response_content = response.content.strip()
        if response_content.startswith("```json"):
            response_content = response_content[7:-3].strip()

        form_c_data = json.loads(response_content)
        state["form_c_data"] = form_c_data
        print("Extracted Form C Data:", form_c_data)

        # Generate table
        table = "| Metric              | Most Recent Fiscal Year | Prior Fiscal Year |\n"
        table += "|---------------------|--------------------------|-------------------|\n"
        for metric, values in form_c_data["financials"].items():
            table += f"| {metric} | {values.get('most_recent', 'N/A')} | {values.get('prior', 'N/A')} |\n"

        with open("sec_filing_table.md", "w", encoding="utf-8") as f:
            f.write(table)

        return {
            "messages": [AIMessage(content="SEC Form C data extracted successfully. Table saved as `sec_filing_table.md`.")],
            "form_c_data": state["form_c_data"]
        }
    except json.JSONDecodeError as e:
        print(f"JSON Decode Error: {e}")
        print(f"LLM Response: {response.content}")
        return {"messages": [AIMessage(content="Error parsing SEC data.")]}


def scrape_additional_links_node(state: State):
    """
    Scrapes all additional links related to the startup.
    """
    additional_links = state["additional_links"]
    scraped_content = state["scraped_content"]

    for link in additional_links:
        try:
            print(f"Scraping Additional URL: {link}")
            loader = ScrapingAntLoader([link], api_key=SCRAPINGANT_API_KEY)
            documents = loader.load()
            scraped_content[link] = documents[0].page_content
        except Exception as e:
            scraped_content[link] = f"Failed to scrape: {e}"
            print(f"Error scraping {link}: {e}")

    state["scraped_content"] = scraped_content
    print("Scraped content from all links:", scraped_content)

    return {
        "messages": [AIMessage(content="Additional links scraped successfully.")],
        "scraped_content": state["scraped_content"]
    }


def extract_additional_data_node(state: State):
    """
    Extracts financials and other relevant metrics from the scraped additional links.
    """
    scraped_content = state["scraped_content"]
    all_metrics = {}
    relevant_metrics = {}

    for link, content in scraped_content.items():
        if "Failed to scrape" in content:
            continue

        prompt = (
            "From the content provided, extract the following details:\n"
            "- Financial metrics (e.g., revenue, expenses, net income, etc.)\n"
            "- Any other relevant information for investors\n\n"
            "Return a JSON object with the structure:\n"
            "{\n"
            "  'financials': {\n"
            "    'Metric Name': {'most_recent': str, 'prior': str},\n"
            "    ...\n"
            "  },\n"
            "  'relevant_metrics': {\n"
            "    'Key Info': str,\n"
            "    ...\n"
            "  }\n"
            "}\n\n"
            f"Content:\n{content}"
        )

        response = llm.invoke([HumanMessage(content=prompt)])
        try:
            response_content = response.content.strip()
            if response_content.startswith("```json"):
                response_content = response_content[7:-3].strip()
            extracted_data = json.loads(response_content)

            all_metrics.update(extracted_data.get("financials", {}))
            relevant_metrics.update(extracted_data.get("relevant_metrics", {}))

        except json.JSONDecodeError as e:
            print(f"JSON Decode Error: {e} for link: {link}")

    state["additional_data"] = {
        "financials": all_metrics,
        "relevant_metrics": relevant_metrics
    }

    # Generate table
    table = "| Metric              | Most Recent Fiscal Year | Prior Fiscal Year |\n"
    table += "|---------------------|--------------------------|-------------------|\n"
    for metric, values in all_metrics.items():
        table += f"| {metric} | {values.get('most_recent', 'N/A')} | {values.get('prior', 'N/A')} |\n"

    for key, value in relevant_metrics.items():
        table += f"\n- {key}: {value}"

    with open("additional_data_table.md", "w", encoding="utf-8") as f:
        f.write(table)

    return {
        "messages": [AIMessage(content="Additional financial data extracted successfully. Table saved as `additional_data_table.md`.")],
        "additional_data": state["additional_data"]
    }


def create_consolidated_table_node(state: State):
    """
    Combines SEC filing data with additional data into a comprehensive table.
    """
    form_c_data = state["form_c_data"]
    additional_data = state["additional_data"]

    consolidated_financials = form_c_data["financials"]
    for metric, values in additional_data["financials"].items():
        if metric not in consolidated_financials:
            consolidated_financials[metric] = values

    table = "| Metric              | Most Recent Fiscal Year | Prior Fiscal Year |\n"
    table += "|---------------------|--------------------------|-------------------|\n"
    for metric, values in consolidated_financials.items():
        table += f"| {metric} | {values.get('most_recent', 'N/A')} | {values.get('prior', 'N/A')} |\n"

    state["consolidated_table"] = table

    with open("consolidated_table.md", "w", encoding="utf-8") as f:
        f.write(table)

    return {
        "messages": [AIMessage(content="Consolidated table created successfully. Table saved as `consolidated_table.md`.")],
        "consolidated_table": state["consolidated_table"]
    }
def prepare_investor_report_node(state: State):
    """
    Dynamically generates a comprehensive report, highlighting the key financial information 
    of the startup based on all the scraped content, consolidated data, and insights  that a
    potential investor must be aware of before deciding to invest in this startup .
    """
    consolidated_financials = state["form_c_data"]["financials"]
    scraped_content = state["scraped_content"]
    additional_data = state["additional_data"]
    consolidated_table = state.get("consolidated_table", "")

    # Prepare the prompt for GPT
    prompt = (
        "You are a financial analyst tasked with creating a detailed and professional investor report for a startup. "
        "Below is the consolidated financial data and additional relevant metrics scraped from various sources:\n\n"
        "## Consolidated Financial Table\n"
        f"{consolidated_table}\n\n"
        "## Scraped Content\n"
        f"{scraped_content}\n\n"
        "## Additional Relevant Metrics\n"
    )

    if additional_data["relevant_metrics"]:
        for key, value in additional_data["relevant_metrics"].items():
            prompt += f"- **{key}:** {value}\n"
    else:
        prompt += "- No additional relevant metrics were found.\n"

    prompt += "\nPrepare a comprehensive report that highlights the key financial information of the startup that a potential investor must be aware of before deciding to invest in this startup based on:\n"
    prompt += (
        "- An **Executive Summary** summarizing the startup's financial health and key takeaways.\n"
        "- A detailed **Key Financial Metrics and Figures** section based on the consolidated table.\n"
        "- Any **Missing Data** or gaps in the information.\n"
        "- **Insights and Considerations** drawn from the financials.\n"
        "- Any **Risks and Challenges** the startup faces.\n"
        "- **Projections and Goals** if available.\n"
        "- A **Conclusion and Recommendations** for potential investors.\n"
    )

    # Pass the consolidated data and request GPT to write the report
    response = llm.invoke([HumanMessage(content=prompt)])
    try:
        report_content = response.content.strip()
        
        # Save the report
        with open("investor_report.md", "w", encoding="utf-8") as f:
            f.write(report_content)

        state["investor_report"] = report_content
        print("Investor Report Generated:\n", report_content)

        return {
            "messages": [AIMessage(content="Investor report dynamically generated and saved as `investor_report.md`.")],
            "investor_report": state["investor_report"]
        }
    except Exception as e:
        print(f"Error generating the report: {e}")
        return {
            "messages": [AIMessage(content="Failed to generate the investor report dynamically.")],
            "investor_report": ""
        }


# Add nodes to the graph
graph_builder.add_node("scrape_and_extract_sec", scrape_and_extract_sec_node)
graph_builder.add_node("scrape_additional_links", scrape_additional_links_node)
graph_builder.add_node("extract_additional_data", extract_additional_data_node)
graph_builder.add_node("create_consolidated_table", create_consolidated_table_node)
graph_builder.add_node("prepare_investor_report", prepare_investor_report_node)

# Define edges (control flow)
graph_builder.add_edge(START, "scrape_and_extract_sec")
graph_builder.add_edge("scrape_and_extract_sec", "scrape_additional_links")
graph_builder.add_edge("scrape_additional_links", "extract_additional_data")
graph_builder.add_edge("extract_additional_data", "create_consolidated_table")
graph_builder.add_edge("create_consolidated_table", "prepare_investor_report")

app = graph_builder.compile(checkpointer=memory)

# Example run
events = app.stream(
    {
        "messages": [
            (
                "user",
                "https://www.sec.gov/Archives/edgar/data/1953831/000167025424000198/xslC_X01/primary_doc.xml"
            )
        ],
        "url_to_scrape": "https://www.sec.gov/Archives/edgar/data/1953831/000167025424000198/xslC_X01/primary_doc.xml",
        "additional_links": [
            "https://wefunder.com/overplay/details",
            "https://wefunder.com/overplay/",
            "https://overplay.com/",
        ],
        "scraped_content": {},
    },
    config,
    stream_mode="values"
)
for event in events:
    event["messages"][-1].pretty_print()
