# Background

We will have a react UI app which will show all the information of the reports.


## Tasks - UI App

### Report details

- Add some description with each report name like what is the report

### Project details

- Show name and links

## Tasks - Python app

- All reports were there and Overall status was `completed` . I triggered regenerate for one of the report but Overall status still stays `completed`. it should go into `in_progress` as well and when the report gets generated only then mark it as `completed`
  

# 4 Major Tasks

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
  
## UI/UX looks good for the project detail page
- Dont show Additional Urls accordian if there is no content for it
- SEC markdown content is not getting rendered correctly (proper table conversion)
- Remove the reports table, instead have `Show Details` after each category (comments) which directs to the report detail page
- Show 3-5 rewarding/highlighting points and risks/potential issues about the startup alongside the spider graph

## Authentication using code
- Add option to login using a predefined code
- Only authenticated users can see the regenerate and edit options