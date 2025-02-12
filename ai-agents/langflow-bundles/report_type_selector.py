from langflow.custom import Component
from langflow.io import MessageTextInput, Output
from langflow.schema import Message
import re

class ReportSelectorComponent(Component):
    display_name = "Report Selector"
    description = "Generates specific reports and extracts URLs based on user input."
    documentation = "https://docs.langflow.org/components-custom-components"
    icon = "code"
    name = "ReportSelectorComponent"

    REPORTS = ["execution_and_speed", "market_opportunity", "financial_health", "traction", "valuation"]

    inputs = [
        MessageTextInput(
            name="input_value",
            display_name="Input Value",
            info="Enter report type enclosed in quotes, followed by a separator '|', and URLs enclosed in quotes separated by commas.",
            value='"all" | "https://example.com, https://example2.com"',
            tool_mode=True,
        ),
    ]

    outputs = [
        Output(display_name="Selected Reports", name="selected_reports", method="build_report_output"),
        Output(display_name="Extracted URLs", name="extracted_urls", method="build_url_output"),
    ]

    def build_report_output(self) -> Message:
        input_text = self.input_value.strip()
        match = re.match(r'"([^"]+)"\s*\|\s*"([^"]*)"', input_text)
        
        if not match:
            self.status = "Invalid input format"
            return Message(text="Invalid input format", status=False)
        
        report_input, _ = match.groups()
        selected_reports = []

        if report_input.lower() == "all":
            selected_reports = self.REPORTS  # Enable all reports
        elif report_input.lower() in self.REPORTS:
            selected_reports.append(report_input.lower())  # Enable only the requested report

        reports_str = ", ".join(selected_reports) if selected_reports else "No reports selected"
        
        self.status = reports_str  # Store status for debugging/logging
        return Message(text=reports_str, status=bool(selected_reports))

    def build_url_output(self) -> Message:
        input_text = self.input_value.strip()
        match = re.match(r'"([^"]+)"\s*\|\s*"([^"]*)"', input_text)
        
        if not match:
            self.status = "Invalid input format"
            return Message(text="Invalid input format", status=False)
        
        _, urls_input = match.groups()
        urls = urls_input.split(", ") if urls_input else []
        urls_str = ", ".join(urls) if urls else "No URLs provided"
        
        self.status = urls_str  # Store status for debugging/logging
        return Message(text=urls_str, status=bool(urls))
