from typing import Optional, Literal

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
