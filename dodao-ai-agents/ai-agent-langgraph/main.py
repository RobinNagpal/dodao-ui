import os
from typing import List, Dict
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage
from typing import Annotated
from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver

from teaminfo import TeamInfoTool
from langchain_community.tools.tavily_search import TavilySearchResults

# Load environment variables from .env
from dotenv import load_dotenv
load_dotenv()

class State(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]

graph_builder = StateGraph(State)

# Initialize LLM (ChatGPT)
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)

# Create an instance of TeamInfoTool
teaminfo_tool_instance = TeamInfoTool()

def chatbot(state: State):
    # The chatbot node: if user asks, it can call the teaminfo_tool
    system_prompt = """You are a startup finance agent. 
    Your task is to analyze a startup based on the provided URL, identify its founding members, and evaluate their qualifications. 
    Use the teaminfo_tool to gather and analyze information from the URL. Do not make assumptions beyond the data available."""

    messages = [
        {"role": "system", "content": system_prompt},
        *state["messages"]
    ]
    return {"messages": [llm.invoke(state[messages])]}

graph_builder.add_node("teaminfo", teaminfo_tool_instance)
graph_builder.add_node("chatbot", chatbot)
graph_builder.add_edge("teaminfo", "chatbot")
graph_builder.set_entry_point("chatbot")

memory = MemorySaver()
graph = graph_builder.compile(checkpointer=memory)

# output_path = "graph.png"  

# try:
#     graph_image = graph.get_graph().draw_mermaid_png()
#     with open(output_path, "wb") as f:
#         f.write(graph_image)
#     print(f"Graph saved at {output_path}. Open the file to view it.")
# except Exception as e:
#     print(f"Error generating graph: {e}")

state = {"messages": [{"role": "user", "content": "Analyze the startup at https://wefunder.com/fluyo"}]}

output = graph.run(state)

print("Output from the graph:", output)
