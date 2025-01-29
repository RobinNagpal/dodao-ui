from langchain_core.tools import tool
from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph, START
from langgraph.graph.message import add_messages
from langchain_openai import ChatOpenAI
from langchain_community.document_loaders import ScrapingAntLoader
from langchain_core.messages import HumanMessage
from langgraph.prebuilt import ToolNode, tools_condition

from typing_extensions import TypedDict
from typing import Annotated, List
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Define the tool to scrape a URL
@tool("scrape_web")
def tool(url: str) -> str:
    """Scrape the content of a URL using ScrapingAntLoader."""
    try:
        print("Scraping URL:", url)
        loader = ScrapingAntLoader([url], api_key="adfc00b0a0a241d1986007248c0c8444")  
        documents = loader.load()  
        page_content = documents[0].page_content
        print(page_content)
        return page_content
    except Exception as e:
        return f"Failed to scrape URL: {e}"
    
tools = [tool]

# Define the state for the graph
class State(TypedDict):
    messages: Annotated[list, add_messages]

# Build the LangGraph
graph_builder = StateGraph(State)

# Initialize LLM (ChatGPT)
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)
llm_with_tools = llm.bind_tools(tools)

# Define the chatbot node
def chatbot(state: State):
    print("State:", state)
    return {"messages": [llm_with_tools.invoke(state["messages"])]}

# Add nodes to the graph
graph_builder.add_node("chatbot", chatbot)
tool_node = ToolNode(tools=[tool])
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

# events = app.stream(
#     {"messages": [("user", user_input)]}, stream_mode="values"
# )
# for event in events:
#     event["messages"][-1].pretty_print()


