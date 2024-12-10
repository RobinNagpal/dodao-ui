```markdown
## Installation

Ensure you have Python >=3.10 and <=3.13 installed on your system. This project uses [Poetry](https://python-poetry.org/) for dependency management and package handling, offering a seamless setup and execution experience.

### Step 1: Install Poetry
If you haven’t already installed Poetry, you can do so by running the following command:

```bash
curl -sSL https://install.python-poetry.org | python3 -
```

This will install Poetry on your system. For more information or troubleshooting, check out the [Poetry installation guide](https://python-poetry.org/docs/#installation).

### Step 2: Move to right folder
If you haven’t already cloned the repository, use the following command to clone it:

```bash
cd dodao-ui/dodao-ai-agents/crew_ai_agent
```

### Step 3: Set up the `.env` file
The project requires certain environment variables to be set. Change `.env.example` to `.env` file in the project root directory and add the following values to the file:

```env
MODEL=model you wan to use
OPENAI_API_KEY=your_openai_api_key_here
SERPER_API_KEY=your_serper_api_key_here
```


### Step 4: Install Dependencies
Once Poetry is installed and you’re inside the project directory (where the `pyproject.toml` file is located), run the following command to install the dependencies:

```bash
poetry install
```

This will automatically create a virtual environment and install all the dependencies specified in the `pyproject.toml` file.

### Step 5: Activate the Virtual Environment
To activate the virtual environment created by Poetry, use the following command:

```bash
poetry shell
```

This will start a new shell with the virtual environment activated, ensuring that the correct dependencies are used for the project.

### Step 6: Run the Application
With the virtual environment activated, you can run the application using:

```bash
poetry run crew_ai_agent
```

This command will execute the `crew_ai_agent` (or any other script defined in your `pyproject.toml`) inside the virtual environment.

### (Optional) Lock Dependencies
If you want to lock the dependencies to specific versions (to ensure consistency across environments), you can run:

```bash
poetry lock
```

Then, to install the locked versions, simply run:

```bash
poetry install
```


### Customizing

- Modify `src/crew_ai_agent/config/agents.yaml` to define your agents
- Modify `src/crew_ai_agent/config/tasks.yaml` to define your tasks
- Modify `src/crew_ai_agent/crew.py` to add your own logic, tools and specific args
- Modify `src/crew_ai_agent/main.py` to add custom inputs for your agents and tasks
