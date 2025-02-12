### Tasks
1. Create Project toml file which will allow us to run and test the tools and for basic setup
2. Add tool which returns the latest sec quarterly report

```python

def ReportType(str, Enum):
    BALANCE_SHEET = 'balance_sheet'
    INCOME_STATEMENT = 'income_statement'
    CASH_FLOW = 'cash_flow'
    MANAGEMENT_DISCUSSION = 'management_discussion'

def get_latest_sec_quarterly_report(ticker: str, report_type: ReportType) -> str:
    """
        Get the latest quarterly report for the given ticker and report type
        
        If the user wants something related to balance sheet, then the report type will be balance_sheet
        If the user wants something related to income statement, then the report type will be income_statement
        If the user wants something related to cash flow, then the report type will be cash_flow
        If the user wants something related to management discussion, then the report type will be management_discussion        
    """
    pass

```
