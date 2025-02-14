# 4 Major Areas of work

## Authentication using code
- Add option to login using a predefined code
- Only authenticated users can see the regenerate and edit options

### How to do

### UI
- create a page `/authenticate` that will have a single field to enter code
- create a function `authenticate` in the `util` folder that will do a POST request to the python backend with the code in the body and if success then store the returned hash key in the local storage in `AUTHENTICATION_KEY`
- create utility `isAdmin` which will just check for existence of `AUTHENTICATION_KEY` in the local storage
- render the edit and regenerate options using the `isAdmin` utility

### Python Backend
- have a field in `.env` like `ADMIN_CODES = Robin-434343, Dawood-233243`
- create an endpoint `/authenticate` that will validate the code being sent in the request body againt the `ADMIN_CODES` env variable and return a hashed key if successfully validated otherwise return error

## UI/UX for project details page
### Improve UX
- Write down suggesions on how can we create the project page using https://tailwindui.com. 
- The information that will be present on project detail page will include
  - Some basic information which is input by the admin while creating the report
  - The spider/graph graph
  - The final report
  - Some admin buttons like regenerate, edit etc

### Server Side
- Make the page render server side. The features which use any hooks or clicks should be extracted out into a separate
components, and can be included in the page


### Other changes
- Dont show Additional Urls accordian if there is no content for it
- SEC markdown content is not getting rendered correctly (proper table conversion)
- Remove the reports table, instead have `Show Details` after each category (comments) which directs to the report detail page
- Show 3-5 rewarding/highlighting points and risks/potential issues about the startup alongside the spider graph

## Final report finalize with structured output
- Use the new prompt with values from `agent-status.json` instead of the individual reports except `team_info`
- Create a structure (structured output) and use it to deal with the `spider-graph.json` output
- Have below format to save the scores and comments in the `spider-graph.json`:
  ```json
  {
    "productInnovation": {
      "commentsSummary": "",
      "evaluation": [{
        "comment": "",
        "score": 0
      }]
    }
  }
  ```
  
## Re-create all the reports
- Revise and optimize the individual report prompts and recreate all the reports
  

# Langflow agent

## Crowd Funding agent

An agent that evaluates a startup in terms of valuation, team credibility, financial health, etc. Agent is given links of the crowd funding platform URL, startup's website URL and SEC filing link. Based on the given data and AI's own intelligence, agent evaluates the startup based on the set parameters and generates detailed reports for each parameter.

Agent also generates a performance checklist of 5 points for each parameter, which contains a one liner summary point which states whether the paramter has positive or negative remarks related to the startup and binary scoring for the 5 points.

Using the reports and performance checklist, we made a UI which displays a spider/radar chart summarizing the parameter performance and below the chart, we show the 5 points for each of the parameters and whether they got passed or not. And then each parameter has a See Full Report button which directs to the detailed analysis regarding that parameter.

### Structure
- Playground takes in the report type and string of comma separated URLs
- A starting node is given the URLs and report type
- Then a node scraps the URLS
- There are 5 conditional nodes for each of the parameter which gets report type and if report type matches then invokes the next LLM node, otherwise presents a input box in the playground
- The invoked LLm node takes in the scrapped content and uses its pre-defined prompt to generate the report and output it in the playground
- If report type is all, then all the LLM nodes will be invoked and output reports will be displayed in the playground

### Tasks
- [x] Agent takes in the required URLs and report type
- [x] Scrape the URLs
- [ ] Store the scraped information in a json file on aws
- [x] Based on the set prompt and said report type, generate the report(s)
- [ ] Load the stored information from aws if agent is invoked for the same project and skip scrapping step
- [ ] Generated report should only contain the evaluation and no mentioning of the performance checklist or scoring
- [ ] langflow agent to be invoked from the insights ui
- [ ] output of the langflow agent to be shown on the insights ui


### How to make aws info fetching component

- create a custom python component that takes in:
  - AWS secret key
  - AWS access key
  - AWS region
  - s3 key
  - file name
  - file type
- call the lambda and return the content
- create a lambda and make a post request handler that gets all the things in the body and returns the file content
- to make the custom component, we can reuse the code of API request component to deal with calling the endpoint and reuse the agent code to deal with creating input fields that can be attached with global variables for AWS access and secret key