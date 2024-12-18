from langchain_core.tools import tool
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import ScrapingAntLoader
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver

from typing_extensions import TypedDict
from typing import Annotated, List
from dotenv import load_dotenv
import os
import json
import requests

load_dotenv()

SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
SCRAPIN_API_KEY = os.getenv("SCRAPIN_API_KEY")
search = GoogleSerperAPIWrapper()

class State(TypedDict):
    messages: Annotated[list, add_messages]
    phase: str
    industry_credentials: str

@tool("scrape_web")
def scrape_web(url: str) -> str:
    """Scrape the content of a URL using ScrapingAntLoader."""
    try:
        print("Scraping URL:", url)
        loader = ScrapingAntLoader([url], api_key=SCRAPINGANT_API_KEY)
        documents = loader.load()
        page_content = documents[0].page_content
        print(page_content)
        return page_content
    except Exception as e:
        return f"Failed to scrape URL: {e}"


@tool("search_linkedln_url")
def search_linkedln_url(query: str) -> str:
    """
    Use Serper API to find LinkedIn profile URLs based on a query.
    Returns the first LinkedIn profile URL found in the organic search results.
    """
    try:
        print("Searching for:", query)
        results = search.results(query)
        for result in results.get("organic", []):
            link = result.get("link", "")
            if "linkedin.com" in link:
                return link
        return "No LinkedIn URL found."
    except Exception as e:
        return f"Search failed: {e}"


@tool("extract_team_and_queries")
def extract_team_and_queries(content: str) -> str:
    """
    Given the full scraped content of a startup's crowdfunding page,
    identify the core team members and return a JSON array of search queries.
    Each element: {"name": "<Name>", "position": "<Position>", "query": "<LinkedIn search query>"}
    """
    print("Extracting team and queries tool")
    prompt = f"""
    You have the following crowdfunding page content:

    {content}

    1. Identify all the core team members mentioned (name and position).
    2. Create a JSON array of objects, each with "name", "position", and "query".
    The "query" should be a natural language query that can be used to find their LinkedIn profile urls.
    For example: "Find the LinkedIn profile url of <Name> working as <Position> at <Startup Name>".
   
    **Important**: Return ONLY the JSON array, without any code fences or additional text. Do not include ```json or ``` in your response. Just return the raw JSON array.
    """

    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()


@tool("extract_credentials")
def extract_credentials(content: str) -> str:
    """
    Given the full scraped content of a startup's crowdfunding page,
    Identifying industry experience needed
    """
    print("Extracting credentials tool")
    prompt = f"""
    You have the following crowdfunding page content:

    {content}

    what credentials should an investor look for in the core team members of a startup in this industry? 
    prepare a list of 10 most important credentials.
    """

    response = llm.invoke([HumanMessage(content=prompt)])
    return response.content.strip()


@tool("scrape_linkedin_profile")
def scrape_linkedin_profile(linkedin_urls: List[str]) -> str:
    """
    Use the Scrapin.io API to retrieve data from multiple LinkedIn profile URLs.
    Accepts a list of LinkedIn URLs and returns a JSON array of profile details.
    Each element in the array corresponds to a profile data JSON.
    """
    url = "https://api.scrapin.io/enrichment/profile"
    profiles_data = []
    for linkedin_url in linkedin_urls:
        params = {
            "apikey": SCRAPIN_API_KEY,
            "linkedInUrl": linkedin_url
        }
        response = requests.get(url, params=params)
        if response.status_code == 200:
            try:
                profile = response.json().get("person", {})
                profiles_data.append(profile)
            except json.JSONDecodeError:
                profiles_data.append({"linkedin_url": linkedin_url, "error": "Invalid JSON response"})
        else:
            profiles_data.append({"linkedin_url": linkedin_url,
                                  "error": f"Failed to fetch LinkedIn data: {response.status_code} {response.text}"})
    return json.dumps(profiles_data)


tools = [scrape_web, extract_credentials, extract_team_and_queries, scrape_linkedin_profile]

graph_builder = StateGraph(State)

llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)


def chatbot(state: State):
    messages = state["messages"]
    if "phase" not in state:
        print("in if loop")
        state["phase"] = "START"
        state["industry_credentials"] = ""

    if len(messages) < 1:
        return {"messages": [llm_with_tools.invoke(messages)]}

    last_msg = messages[-1]

    if isinstance(last_msg, ToolMessage) and state["phase"] == "START":
        print("finding credentials 1")
        if "Failed to scrape URL:" not in last_msg.content:
            user_instruction = (
                "You have the full content of a startup's crowdfunding page. "
                "Please identify industry experience needed. "
                "What credentials should an investor look for in the core team members of a startup in this industry? "
            )
            new_messages = messages + [HumanMessage(content=user_instruction)]
            state["phase"] = "CREDENTIALS_DONE"
            print("finding credentials 2")
            return {"messages": [llm_with_tools.invoke(new_messages)], "phase": state["phase"]}
        else:
            print("Error scraping URL")
            return {"messages": [llm_with_tools.invoke(messages)]}

    if isinstance(last_msg, ToolMessage) and state["phase"] == "CREDENTIALS_DONE":
        print("finding core members 1")
        content = last_msg.content.strip()
        try:
            credentials = content
            state["industry_credentials"] = credentials
            print(f"Extracted Industry Credentials: {credentials}")

            user_instruction = (
                "You have the full content of a startup's crowdfunding page. "
                "Please identify the core team members mentioned on the page. "
                "We need to create search queries to find their LinkedIn profile URLs."
            )
            new_messages = messages + [HumanMessage(content=user_instruction)]
            state["phase"] = "EXTRACTING_TEAM_AND_QUERIES"
            print("Transitioning to EXTRACTING_TEAM_AND_QUERIES phase")
            return {
                "messages": [llm_with_tools.invoke(new_messages)],
                "phase": state["phase"],
                "industry_credentials": state["industry_credentials"],
            }
        except Exception as e:
            print("Error extracting credentials:", e)
            return {"messages": [AIMessage(content="Error extracting industry credentials.")], "phase": "DONE"}

    if isinstance(last_msg, ToolMessage) and state["phase"] == "EXTRACTING_TEAM_AND_QUERIES":
        print("finding linkedln url 1")
        content = last_msg.content.strip()
        try:
            queries = json.loads(content)
            if isinstance(queries, list) and all(isinstance(q, dict) for q in queries):
                linkedin_results = []
                for q in queries:
                    name = q.get("name", "")
                    position = q.get("position", "")
                    query = q.get("query", "")
                    if query:
                        tool_response = search_linkedln_url.invoke(query)
                        if "linkedin.com/in/" in tool_response:
                            linkedin_results.append(tool_response)

                summary_message = (
                    "Now that we are providing you with the LinkedIn URLs, use the `scrape_linkedin_profile` tool "
                    "to retrieve the profile data for all team members in a single call. From the fetched profile data, "
                    "verify if each person actually works at this startup. If they do, keep their data; if not, discard it. "
                    "Here are the LinkedIn profile URLs found:\n"
                )

                for url in linkedin_results:
                    summary_message += f"- {url}\n"

                print(summary_message)
                new_messages = messages + [HumanMessage(content=summary_message)]
                state["phase"] = "LINKEDIN_PROFILES_RESULTS"
                print("finding linkedln url 2")
                return {"messages": [llm_with_tools.invoke(new_messages)], "phase": state["phase"],
                        "industry_credentials": state["industry_credentials"], }
        except Exception as e:
            print("Error parsing JSON:", e)
            return {"messages": [AIMessage(content="Error parsing the JSON.")]}

    if isinstance(last_msg, ToolMessage) and state["phase"] == "LINKEDIN_PROFILES_RESULTS":
        print("evaluting team info 1")
        content = last_msg.content.strip()
        try:
            profiles = json.loads(content)

            if profiles:
                verification_instruction = (
                    "Comparing team's experience against experience needed in this industry & generating a report.\n"
                    "Evaluate the core team members collectively and determine the credentials essential for success in this industry that the team overall excels in. "
                    "Additionally, identify the credentials where the team demonstrates limited experience or lacks expertise. "
                    "Use only the credentials explicitly provided for the team—avoid generalizations or assumptions. "
                    "Present the analysis in the form of a structured report without offering any recommendations or repetition."
                )
                industry_credentials = state.get("industry_credentials", "")
                profiles_json = json.dumps(profiles, indent=2)
                full_instruction = f"{verification_instruction}\n\nIndustry Credentials Needed:\n{industry_credentials}\n\nProfile Data:\n{profiles_json}"

                new_messages = messages + [HumanMessage(content=full_instruction)]
                state["phase"] = "FINAL_REPORT"
                print("evaluting team info 2")
                return {"messages": [llm_with_tools.invoke(new_messages)], "phase": state["phase"]}
            else:
                return {
                    "messages": [AIMessage(content="No valid LinkedIn profiles to evaluate.")],
                    "phase": state["phase"],
                    "industry_credentials": state["industry_credentials"],
                }
        except Exception as e:
            print("Error processing scraped profiles:", e)
            return {"messages": [AIMessage(content="Error processing scraped LinkedIn profiles.")], "phase": "DONE"}

    return {"messages": [llm_with_tools.invoke(messages)]}


graph_builder.add_node("chatbot", chatbot)
tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)
graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)

graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

memory = MemorySaver()
config = {"configurable": {"thread_id": "1"}}

app = graph_builder.compile(checkpointer=memory)

user_input = "Scrape this URL: https://wefunder.com/fluyo"

events = app.stream(
    {"messages": [("user", user_input)]}, config, stream_mode="values"
)
for event in events:
    event["messages"][-1].pretty_print()

# for visualization of graph
# output_file = "graph_visualization.png"

# try:
#     # Generate the graph as a PNG file
#     graph_image = app.get_graph().draw_mermaid_png()
    
#     # Save the PNG file to disk
#     with open(output_file, "wb") as f:
#         f.write(graph_image)
    
#     print(f"Graph visualization saved as '{output_file}'. Open this file to view the graph.")
# except Exception as e:
#     print(f"Failed to generate or save the graph: {e}")