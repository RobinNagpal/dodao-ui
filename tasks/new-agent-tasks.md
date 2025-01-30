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

### Report details

- Add some description with each report name like what is the report

### Project details

- Show name and links

### Styling

- Add some basic theme
- in academy-ui in layout we set some styles
- copy the alchemix ones
- check font type and font size how they are applied in academy-ui and apply them here

## Tasks - Python app

- All reports were there and Overall status was `completed` . I triggered regenerate for one of the report but Overall status still stays `completed`. it should go into `in_progress` as well and when the report gets generated only then mark it as `completed`
- Create a parent graph:
  - first level will have a node that will form the `input_data` needed by the subsequent nodes. E.g. general_info needs projectUrls
  - second level will have all the report nodes
  - there will be a conditional edge from first level node to second level nodes and it will fan-out the execution based on the invoked path. So either one of the second level nodes will be invoked or all of them.
  - second level nodes will fan-in into a third level node that will cater the report(s)