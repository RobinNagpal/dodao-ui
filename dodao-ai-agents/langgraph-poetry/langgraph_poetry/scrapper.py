from langchain_core.tools import tool
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import ScrapingAntLoader
from langchain_community.utilities import GoogleSerperAPIWrapper
from langchain_core.messages import HumanMessage, AIMessage, ToolMessage
from langgraph.prebuilt import ToolNode, tools_condition

from typing_extensions import TypedDict
from typing import Annotated, List
from dotenv import load_dotenv
import os
import json

# Load environment variables from .env
load_dotenv()

# Retrieve API keys from environment variables
SCRAPINGANT_API_KEY = os.getenv("SCRAPINGANT_API_KEY")
SERPER_API_KEY = os.getenv("SERPER_API_KEY")
search = GoogleSerperAPIWrapper()

# Define the tool to scrape a URL
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
        # Parse the results for the first LinkedIn URL
        # We'll assume the first 'organic' result that has 'linkedin.com' in the link is what we want.
        for result in results.get("organic", []):
            link = result.get("link", "")
            if "linkedin.com" in link:
                print("LinkedIn URL found:", link)
                return link
                break
        return "No LinkedIn URL found."
    except Exception as e:
        return f"Search failed: {e}"

tools = [scrape_web, search_tool]

# Define the state for the graph
class State(TypedDict):
    messages: Annotated[list, add_messages]

# Build the LangGraph
graph_builder = StateGraph(State)

# Initialize LLM (ChatGPT)
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)

def chatbot(state: State):
    messages = state["messages"]
    if len(messages) < 1:
        # If no messages, just respond
        return {"messages": [llm_with_tools.invoke(messages)]}
    
    last_msg = messages[-1]

    # Check if the last message was a tool response (likely scraped content)
    if isinstance(last_msg, ToolMessage):
        # If we got content from scraping successfully
        if "Failed to scrape URL:" not in last_msg.content:
            # Instruct LLM to identify team members
            user_instruction = (
                "You have the full content of a startup's crowdfunding page. "
                "Please identify the core team members mentioned on the page. "
                "Return the team members' names and their positions at this startup."
            )
            new_messages = messages + [HumanMessage(content=user_instruction)]
            return {"messages": [llm_with_tools.invoke(new_messages)]}
        else:
            # If scraping failed, just proceed normally
            return {"messages": [llm_with_tools.invoke(messages)]}

    # If the LLM has just returned team member info (names and positions),
    # we can ask the LLM to provide search queries for their LinkedIn profiles.
    # We'll detect this by checking if the last message is from the AI and is not a tool response.
    if isinstance(last_msg, AIMessage) and "Please identify the core team members" in "".join(m.content for m in messages if isinstance(m, HumanMessage)):
        # The LLM should have returned team members. We can assume the last_msg now contains something like a list.
        # We'll ask the LLM to create a search query for each team member to find their LinkedIn profile.
        user_instruction = (
            "Now that we have the team members' names and positions, create a JSON array of search queries. "
            "Each element in the array should be an object with keys 'name', 'position', and 'query', "
            "where 'query' is a search query to find their LinkedIn profile URL. "
            "For example: "
            "[{\"name\": \"Name1\", \"position\": \"CEO\", \"query\": \"give me LinkedIn profile url of Name1 CEO of <startup name>\"}, ... ]"
        )
        new_messages = messages + [HumanMessage(content=user_instruction)]
        return {"messages": [llm_with_tools.invoke(new_messages)]}

    # If the LLM has returned a JSON array with queries
    # We detect JSON by trying to parse the last AIMessage content.
    if isinstance(last_msg, AIMessage):
        content = last_msg.content.strip()
        # Attempt to parse JSON
        try:
            queries = json.loads(content)
            if isinstance(queries, list) and all(isinstance(q, dict) for q in queries):
                # We have a list of queries; call the search tool for each query and return results.
                # We'll construct a new user message with the found LinkedIn URLs.
                linkedin_results = []
                for q in queries:
                    name = q.get("name", "")
                    position = q.get("position", "")
                    query = q.get("query", "")
                    if query:
                        # Call the search tool
                        tool_response = search_tool(query)  # Direct call, or use: llm_with_tools.invoke([...])
                        linkedin_results.append({"name": name, "position": position, "linkedin_url": tool_response})

                # Summarize results for user
                summary_message = "Here are the LinkedIn profile URLs found:\n"
                for member in linkedin_results:
                    summary_message += f"{member['name']} ({member['position']}): {member['linkedin_url']}\n"

                # new_messages = messages + [HumanMessage(content=summary_message)]
                # return {"messages": [llm_with_tools.invoke(new_messages)]}
                return {"messages": [AIMessage(content=summary_message)]}
        except:
            pass

    # Default: just invoke the model with the current messages
    return {"messages": [llm_with_tools.invoke(messages)]}

# Add nodes to the graph
graph_builder.add_node("chatbot", chatbot)
tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)
graph_builder.add_conditional_edges(
    "chatbot",
    tools_condition,
)
# Any time a tool is called, we return to the chatbot to decide the next step
graph_builder.add_edge("tools", "chatbot")
graph_builder.add_edge(START, "chatbot")

# Compile the graph
app = graph_builder.compile()

user_input = "Scrape this URL: https://wefunder.com/fluyo"

events = app.stream(
    {"messages": [("user", user_input)]}, stream_mode="values"
)
for event in events:
    event["messages"][-1].pretty_print()