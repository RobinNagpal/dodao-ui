# 4 Major Areas of work

## Authentication using code
- Add option to login using a predefined code
- Only authenticated users can see the regenerate and edit options

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
  

