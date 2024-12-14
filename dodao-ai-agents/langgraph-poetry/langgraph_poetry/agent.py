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

@tool("search_tool")
def search_tool(query: str) -> str:
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

@tool("scrape_linkedin_profile")
def scrape_linkedin_profile(linkedin_url: str) -> str:
    """
    Use the Scrapin.io API to retrieve data from a LinkedIn profile URL.
    Returns JSON data with profile details.
    """
    url = "https://api.scrapin.io/enrichment/profile"
    params = {
        "apikey": SCRAPIN_API_KEY,
        "linkedInUrl": linkedin_url
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        return response.text
    else:
        return f"Failed to fetch LinkedIn data: {response.status_code} {response.text}"

tools = [scrape_web, search_tool, extract_team_and_queries, scrape_linkedin_profile]

class State(TypedDict):
    messages: Annotated[list, add_messages]
    phase: str

graph_builder = StateGraph(State)

llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)

def chatbot(state: State):
    messages = state["messages"]
    if "phase" not in state:
        print("in if loop")
        state["phase"] = "START"

    if len(messages) < 1:
        return {"messages": [llm_with_tools.invoke(messages)]}
    
    last_msg = messages[-1]

    if isinstance(last_msg, ToolMessage) and state["phase"] == "START":
        print("finding core members 1")
        if "Failed to scrape URL:" not in last_msg.content:
            user_instruction = (
                "You have the full content of a startup's crowdfunding page. "
                "Please identify the core team members mentioned on the page. "
                "We need to make seach queries for getting their linkedin profiles urls."
            )
            new_messages = messages + [HumanMessage(content=user_instruction)]
            state["phase"] = "EXTRACTING_TEAM_AND_QUERIES"
            print("finding core members 2")
            return {"messages": [llm_with_tools.invoke(new_messages)], "phase": state["phase"]}
        else:
            return {"messages": [llm_with_tools.invoke(messages)]}

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
                        tool_response = search_tool(query)  
                        linkedin_results.append({"name": name, "position": position, "linkedin_url": tool_response})

                summary_message = "Now that we are providing you the LinkedIn URLs, for each team member's linkedin_url, use the `scrape_linkedin_profile` tool to retrieve their profile data. From the fetched profile data, verify if they actually work at this startup. If they do, keep them; if not, discard them. After filtering, use the extracted profiles to summarize their experience, academic background, certifications, and any other relevant information. Present the data objectively without interpreting or categorizing credentials. Here are the LinkedIn profile URLs found:\n"
                for member in linkedin_results:
                    summary_message += f"{member['name']} ({member['position']}): {member['linkedin_url']}\n"

                print(summary_message)
                new_messages = messages + [HumanMessage(content=summary_message)]
                state["phase"] = "LINKEDIN_PROFILES_RESULTS"
                print("finding linkedln url 2")
                return {"messages": [llm_with_tools.invoke(new_messages)], "phase": state["phase"]}
        except Exception as e:
            print("Error parsing JSON:", e)
            return {"messages": [AIMessage(content="Error parsing the JSON.")]}

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

user_input = "Scrape this URL: https://wefunder.com/lookyloo"

events = app.stream(
    {"messages": [("user", user_input)]}, config, stream_mode="values"
)
for event in events:
    event["messages"][-1].pretty_print()