# Background

We will have a react UI app which will show all the information of the reports.

### Reports

- When we start analysis of the project, the very first thing we need to do is `create a file ${bucket}/crowd-fund-analysis/${projectId}/agent-status.json`

The file should have information

```json
{
  "id": "projectId",
  "name": "Project Name",
  "projectInfoInput": {
    "secFilingUtl": "https://www.sec.gov/Archives/edgar/data/...",
    "crowdFundingUrl": "https://www.kickstarter.com/projects/...",
    "additionalUrl": [
      "https://www.kickstarter.com/projects/...",
      "https://www.kickstarter.com/projects/..."
    ],
    "websiteUrl": "https://www.kickstarter.com/projects/..."
  },
  "status": "in_progress",
  "reports": {
    "teamInfo": {
      "status": "completed",
      "markdownLink": "https://s3.amazonaws.com/bucket_name/project_id/team_info.md",
      "pdfLink": "https://s3.amazonaws.com/bucket_name/project_id/team_info.pdf"
    }
  },
  "finalReport": {
    "status": "completed",
    "markdownLink": "https://s3.amazonaws.com/bucket_name/project_id/final_report.md",
    "pdfLink": "https://s3.amazonaws.com/bucket_name/project_id/final_report.pdf"
  }
}
```

## Tasks - UI App

1. Hussain to create couple of dummy `agent-status.json` files which will be added in s3 bucket at path `${bucket}/crowd-fund-analysis/${projectId}/agent-status.json`

   - The dummy data can have each status as `in_progress` for now.

1. Hussain to fix the issue related to saving of the agent-status.json file in the s3 bucket.
1. Hussain to look into saving of each report one by one and can divide some of these paths with Dawood.

### Report details

- Triggering of report regeneration from the UI (per report and all reports)
- Parse md into html
- Add a new page `/crowd-funding/projects/${projectId}/reports/${report-type}` and render the parsed html
- Instead of `MD` show View
- Instead of `PDF` show Download icon
- Add some description with each report name like what is the report

### Project details

- Show name and links

### Styling

- Add some basic theme
- in academy-ui in layout we set some styles
- copy the alchemix ones
- check font type and font size how they are applied in academy-ui and apply them here

## Tasks - Python app

1. Add a route `/api/projects/${projectId}/reports/${report-type}/regenerate` to regenerate the report

- Added a route in `app.py` along with a function `extract_variables_from_s3(project_id)` which gets the required info using projectId for the project and also the report type form the route itself and than this type is added to the command `poetry run python controller.py [details]` as an arguement. Then in `controller.py` based on report type only that report is generated using an array `app_map and final_key_map` and `run_agent_and_get_final_output_async(app, input_data, final_key, s3_key)`
- Also changed the status of the agent_status file accordingly at every stage inside `initialize_status_file(project_id, project_name, input_data, report_type=None)`

2. Add a route `/api/projects/${projectId}/reports/regenerate` to regenerate all reports

- Added a route in app.py along with a function `extract_variables_from_s3(project_id)` which gets the required info using projectId for the project and than route same as submit route runs a command `poetry run python controller.py [details]`

3. Add a default Open AI model configuration in .env file
4. Dawood to review the code in details:
   1. Check the common functions are all present in separate file(s) and should have proper naming
   2. the retry logic and error handling logic is done in a common way and not repeated for every report
