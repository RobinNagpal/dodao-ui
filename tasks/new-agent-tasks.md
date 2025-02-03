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

### Final report
- Planning to use `chart.js` and `react-chartsjs-2` to create the Radar chart (spider graph)
- Check if `final_report` has `completed` status in the `agent_status.json` then on the View/Report detail page, fetch the content of `spider_graph.json` and use the values to create a spider graph

## Tasks - Python app

- All reports were there and Overall status was `completed` . I triggered regenerate for one of the report but Overall status still stays `completed`. it should go into `in_progress` as well and when the report gets generated only then mark it as `completed`
  
### Final report
- Get all reports:
  - create a function `get_all_reports_from_s3(projectId)` in the `report_utils.py`
  - Get the `agent_status.json` file using the projectId
  - Get all the reports' markdown links
  - create a function `fetch_markdown_from_link(markdownLink)` to extract the markdown content from each link
  - Combine all the reports into a single blob
- Get spider graph scores and upload the file to s3:
  - within the `final_report.py`, call the function `get_all_reports_from_s3(projectId)` from `report_utils.py` to get the full combined report
  - make a prompt to get the scoring based on the below points by passing the combine reports:
    1. Product Innovation
        1.  Novelty – Is the product truly innovative compared to existing solutions?
        2.  Technical Feasibility – Does the technology work as promised? Has it been tested/prototyped?
        3.  Market Differentiation – Does it have a clear competitive edge?
        4.  Scalability – Can the product scale to mass adoption?
        5.  Intellectual Property – Are patents or proprietary technologies protecting it?
    2. Market Opportunity
        1.  Total Addressable Market (TAM) Size – Is the market large enough to support high growth?
        2.  Customer Interest – Are there Letters of Intent (LOIs), pre-orders, or active customers?
        3.  Industry Growth Rate – Is the sector growing at a fast pace?
        4.  Competition & Barriers to Entry – Is it easy for new players to enter?
        5.  Regulatory Tailwinds – Are government policies and incentives favoring this industry?
    3. Team Strength
        1.  Relevant Experience – Do key team members have prior experience in this domain?
        2.  Industry Recognition – Have they worked at top companies, built successful startups, or won awards?
        3.  Diversity of Skills – Are business, finance, and tech expertise covered?
        4.  Commitment & Execution – Is the team full-time and capable of delivering results?
        5.  Board & Advisors – Are industry experts backing them?
    4. Financial Health
        1. Revenue Generation – Has the startup started generating revenue?
        2. Funding Secured – Has it raised enough funds for at least 12 months?
        3. Burn Rate & Runway – Can it survive without raising more money soon?
        4. Debt vs. Assets Ratio – Is the company heavily in debt?
        5. Profitability Pathway – Is there a clear plan to reach profitability?
     5. Business Model & Revenue Strategy
        1. Clear Monetization Plan – Is the revenue model clear and sustainable?
        2. Customer Retention & Growth – Does it have repeat customers or subscription models?
        3. Cost Structure & Margins – Are the margins healthy?
        4. Sales & Marketing Strategy – Does it have a clear go-to-market strategy?
        5. Competitive Pricing – Can it price products attractively while maintaining margins?
  - For each of the subpoints, we are going to get a binary score 0 or 1 and a comment (either stating approval or reason for disapproval)
  - So each category will get a score out of 5
  - Save the scores and comments in this format:
    ```json
    {
      "productInnovation": {
        "score": 0,
        "subScoring": [{
          "comment": "",
          "score": 0
        }]
      }
    }
    ```
  - Upload the `spider_graph.json` to the project folder in s3