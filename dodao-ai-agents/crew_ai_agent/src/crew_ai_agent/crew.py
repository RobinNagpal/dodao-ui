from crewai import Agent, Crew, Process, Task
from crewai.project import CrewBase, agent, crew, task, before_kickoff, after_kickoff
from crewai_tools import SerperDevTool
from crewai_tools import SeleniumScrapingTool
from crew_ai_agent.tools.scraping_tool import ScrapeWithSeleniumTool

search_tool = SerperDevTool(
    search_url="https://google.serper.dev/search",
    n_results=2,
)
print(search_tool.run(search_query="Isaac Hayes Linkedin"))
scrape_tool = ScrapeWithSeleniumTool()
# output_file = scraper.run({"urls": ["https://example.com", "https://another.com"]})
# print(f"Scraped data saved to: {output_file}")
# Uncomment the following line to use an example of a custom tool

# Check our tools documentations for more information on how to use them

@CrewBase
class CrewAiAgent():
	"""CrewAiAgent crew"""

	agents_config = 'config/agents.yaml'
	tasks_config = 'config/tasks.yaml'

	@before_kickoff # Optional hook to be executed before the crew starts
	def pull_data_example(self, inputs):
		return inputs

	@after_kickoff # Optional hook to be executed after the crew has finished
	def log_results(self, output):
		# Example of logging results, dynamically changing the output
		print(f"Results: {output}")
		return output

	@agent
	def scraper(self) -> Agent:
		return Agent(
			config=self.agents_config['scraper'],
			tools=[scrape_tool],
			verbose=True,
		)

	@task
	def scrape_task(self) -> Task:
		task_config = self.tasks_config['scrape_task']	
		print(task_config)
		return Task(
			config=task_config,
			tools=[scrape_tool,search_tool],
			output_file="teams.txt",
			# Context=["scrape_task"]
		)


	@agent
	def searcher(self) -> Agent:
		return Agent(
			config=self.agents_config['searcher'],
			tools=[search_tool],
			verbose=True,
		)

	@task
	def search_task(self) -> Task:
		task_config = self.tasks_config['search_task']	
		print(task_config)
		return Task(
			config=task_config,
			tools=[search_tool],
			Context=["scrape_task"]
		)


	@crew
	def crew(self) -> Crew:
		"""Creates the CrewAiAgent crew"""
		return Crew(
			agents=self.agents, # Automatically created by the @agent decorator
			tasks=self.tasks, # Automatically created by the @task decorator
			process=Process.sequential,
			verbose=True,
			# process=Process.hierarchical, # In case you wanna use that instead https://docs.crewai.com/how-to/Hierarchical/
		)
