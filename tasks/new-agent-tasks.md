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


## UI App
the very first thing is we display the list of projects and then for each project we show the status of the reports.



## Tasks
1) Hussain to create couple of dummy `agent-status.json` files which will be added in s3 bucket at path `${bucket}/crowd-fund-analysis/${projectId}/agent-status.json`
   * The dummy data can have each status as `in_progress` for now.
  

1) Hussain to fix the issue related to saving of the agent-status.json file in the s3 bucket.
2) Hussain to look into saving of each report one by one and can divide some of these paths with Dawood.
 
1) Dawood to work on the next app to show the list of projects, then when we click on the project, it should show the status of each of the reports.
2) UI component can straight away open the `${bucket}/crowd-fund-analysis/${projectId}/agent-status.json` file and show the status of the reports. 
