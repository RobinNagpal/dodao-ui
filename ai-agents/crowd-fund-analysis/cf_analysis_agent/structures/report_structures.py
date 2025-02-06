from typing import Optional, Literal, List

from pydantic import BaseModel, Field


# Pydantic
class StructuredLLMResponse(BaseModel):
    """Return llm response in a structured format"""
    outputString: str = Field(description="The output string expected as the response to the prompt.")
    status: Literal['success', 'failure'] = Field(
        description="If successful in processing the prompt and producing the output."
                    "Also fail if no proper input was provided.")
    failureReason: Optional[str] = Field(description="The reason for the failure if the status is failed.")
    confidence: Optional[float] = Field(description="The confidence of the response in the range of 1-10, 10 being very confident and 1 being not confident at all.")


class ChecklistItem(BaseModel):
    """Checklist item with a score and comment."""
    checklistItem: str = Field(description="The item to be checked.")
    explanation: str = Field(description="A brief explanation of how the item was evaluated.")
    score: Literal[0, 1] = Field(description="The score given for this item 0 or 1.")

class StructuredReportResponse(BaseModel):
    """Return llm response in a structured format"""
    outputString: str = Field(description="The output string expected as the response to the prompt.")
    oneLineSummary: str = Field(description="A one-liner summary of the output.")
    status: Literal['success', 'failure'] = Field(
        description="If successful in processing the prompt and producing the output."
                    "Also fail if no proper input was provided.")
    failureReason: Optional[str] = Field(description="The reason for the failure if the status is failed.")
    confidence: Optional[float] = Field(description="The confidence of the response in the range of 1-10, 10 being very confident and 1 being not confident at all.")
    performanceChecklist: List[ChecklistItem] = Field(description="A list of items to be checked with their scores and comments.")

class TeamMemberStructure(BaseModel):
    """Information about the team members"""
    id: str = Field(description="Unique ID for each team member, formatted as firstname_lastname")
    name: str = Field(description="The name of the team member")
    title: str = Field(description="The position of the team member in the startup")
    info: str = Field(description="Details or additional information about the team member as mentioned on the startup page")

class StartupAndTeamInfoStructure(BaseModel):
    """Information about the startup, industry, and team"""
    startup_name: str = Field(description="The name of the project or startup being discussed")
    startup_details: str = Field(description="A single sentence explaining what the startup does")
    industry: str = Field(description="A brief overview of the industry, including how it has grown in the last 3-5 years, its expected growth in the next 3-5 years, challenges, and unique benefits for startups in this space")
    team_members: list[TeamMemberStructure] = Field(description="A list of team members with their details")

class EvaluationSubpoint(BaseModel):
    """Represents an individual evaluation criterion with a score and comment."""
    comment: str = Field(description="A brief comment explaining the assessment.")
    score: int = Field(description="The score given for this subpoint, typically 0 or 1.")


class EvaluationCategory(BaseModel):
    """Represents an evaluation category with a summary and detailed scoring."""
    subpointsSummary: str = Field(description="Summary of what this evaluation category assesses.")
    subpointsScoring: List[EvaluationSubpoint] = Field(description="List of individual evaluations with comments and scores.")


class EvaluationStructure(BaseModel):
    """Holds evaluation data across multiple categories."""
    teamStrength: EvaluationCategory
    traction: EvaluationCategory
    marketOpportunity: EvaluationCategory
    valuation: EvaluationCategory
    executionSpeed: EvaluationCategory
    financialHealth: EvaluationCategory


class Highlights(BaseModel):
    """Represents key startup highlights including achievements and risks."""
    achievements: List[str] = Field(description="List of key achievements.")
    risks: List[str] = Field(description="List of identified risks.")


class StartupEvaluationStructure(BaseModel):
    """Overall structure for evaluating a startup."""
    highlights: Highlights
    evaluation: EvaluationStructure
