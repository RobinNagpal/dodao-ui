import os
from typing import List, Dict
from typing_extensions import TypedDict
from langchain_core.messages import BaseMessage
from typing import Annotated
from langgraph.graph import StateGraph
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode, tools_condition

from langchain.chat_models import ChatOpenAI
from langchain.schema import HumanMessage

# Import our utility functions
from teaminfo import (
    scrape_wefunder_page,
    identify_team_members,
    find_linkedin_profiles,
    scrape_linkedin_profile,
    extract_member_qualifications,
    extract_general_info_facts,
    identify_industry_credentials
)

# If you have tools like TavilySearchResults:
from langchain_community.tools.tavily_search import TavilySearchResults

class State(TypedDict):
    messages: Annotated[List[BaseMessage], add_messages]

graph_builder = StateGraph(State)

# Initialize LLM (ChatGPT)
llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0)

# We can define and bind tools here if needed.
tavily_tool = TavilySearchResults(max_results=2)
tools = [tavily_tool]
llm_with_tools = llm.bind_tools(tools)

def chatbot(state: State):
    return {"messages": [llm_with_tools.invoke(state["messages"])]}

graph_builder.add_node("chatbot", chatbot)
tool_node = ToolNode(tools=tools)
graph_builder.add_node("tools", tool_node)
graph_builder.add_conditional_edges("chatbot", tools_condition)
graph_builder.add_edge("tools", "chatbot")
graph_builder.set_entry_point("chatbot")

graph = graph_builder.compile()

if __name__ == "__main__":
    # Example URL
    wefunder_url = "https://wefunder.com/geoship/"
    
    # 1) Scrape Wefunder page
    content = scrape_wefunder_page(wefunder_url)
    
    # 2) Identify team members
    team = identify_team_members(content, llm)
    
    # 3) Find LinkedIn Profiles (This may require a run through the graph or direct calls)
    # Since Tavily is a tool, you might integrate this step through `graph.run(...)` 
    # or call the LLM in a way that triggers tool usage.
    # For simplicity, here we show a placeholder:
    # team_with_li = find_linkedin_profiles(team, llm_with_tools) # if we adapt find_linkedin_profiles to accept llm_with_tools
    # In actual implementation, you'd adjust find_linkedin_profiles to properly invoke the tool node/graph.
    
    # For now, assume we have LinkedIn URLs (hardcoded or found):
    team_with_li = team  # In real code, you'd update this with actual LinkedIn URLs
    
    # 4) Scrape LinkedIn profiles and extract qualifications
    for member in team_with_li:
        li_url = member.get("linkedin_url", "")
        if li_url:
            li_content = scrape_linkedin_profile(li_url)
            member_data = extract_member_qualifications(li_content, llm)
            member["qualifications"] = member_data
    
    # team_with_li now contains each team member with their qualifications
    
    # Now we want general info/facts about the project
    general_info = extract_general_info_facts(content, llm)
    
    # Identifying industry credentials needed
    industry_creds = identify_industry_credentials(llm)
    
    print("General Info/Facts about the Project:", general_info)
    print("Industry Credentials Needed:", industry_creds)
    print("Team with Qualifications:", team_with_li)
