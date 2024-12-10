## Requirements
1. **Python**: Version `3.10` or higher.
2. **Poetry**: Dependency manager for Python projects.
   - [Install Poetry](https://python-poetry.org/docs/#installation)
3. **ScrapingAnt API Key**:
   - A valid ScrapingAnt API key must be added to a `.env` file.
4. **OpenAI API Key**:
   - A valid Open API key must be added to a `.env` file.

---

## Installation Guide

### Step 1: Set Up Environment Variables
Create a `.env` file in the `dodao-ai-agents\langgraph-poetry\langgraph_poetry` directory with the following content:
```
OPENAI_API_KEY=your_api_key_here
SCRAPINGHANT_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with your actual API key.

---

## How to Run the Code

1. **Install all the dependency libraries**:
    Navigate to the dodao-ai-agents\langgraph-poetry folder and execute the scrapper.py file:
   ```bash
   poetry install
   ```

2. **Run the Script**:
   Navigate to the `dodao-ai-agents\langgraph-poetry\langgraph_poetry` folder and execute the `scrapper.py` file:
   ```bash
   poetry run python scrapper.py
   ```

---

## Dependencies

The following libraries are required and managed via Poetry:

- `langgraph`: For graph-based state management.
- `langchain-core`: Core utilities for LangChain.
- `langchain-community`: Community-provided tools like `ScrapingAntLoader`.
- `langchain-openai`: OpenAI LLM integration.
- `python-dotenv`: For environment variable management.
- `scrapingant-client`: ScrapingAnt API client.

---



