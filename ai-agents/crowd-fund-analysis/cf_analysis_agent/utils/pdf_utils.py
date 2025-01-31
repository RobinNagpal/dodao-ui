import webbrowser
from io import BytesIO

from bs4 import BeautifulSoup
from markdown import markdown
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListItem, ListFlowable

from cf_analysis_agent.utils.report_utils import REGION, update_status_file
from cf_analysis_agent.utils.s3_utils import upload_to_s3, BUCKET_NAME


def convert_markdown_to_pdf_and_upload(markdown_content, s3_key):
    """
    Converts Markdown content to PDF, uploads it to S3, and updates the status file.
    """
    # 1) Convert Markdown -> HTML
    html_content = markdown(markdown_content)

    # 2) Parse the HTML with BeautifulSoup
    soup = BeautifulSoup(html_content, "html.parser")

    # 3) Prepare a PDF buffer and styles
    pdf_buffer = BytesIO()
    doc = SimpleDocTemplate(pdf_buffer, pagesize=letter)
    styles = getSampleStyleSheet()

    # You can tweak or add new styles as needed:
    heading1 = ParagraphStyle(
        "Heading1",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        spaceAfter=10,
    )
    heading2 = ParagraphStyle(
        "Heading2",
        parent=styles["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=14,
        leading=18,
        spaceAfter=8,
    )
    normal_paragraph = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontSize=10,
        leading=12,
        spaceAfter=6,
    )

    # 4) Build a list of flowables (Paragraphs, Lists, etc.) from the HTML
    flowables = []

    def parse_element(element):
        """
        Recursive parser to handle nested tags (e.g., <ul> inside <div>).
        You can expand this logic to handle more tags if desired.
        """
        # If it's a navigable string (plain text between tags), skip it if just whitespace
        if element.name is None:
            text = element.strip()
            if text:
                flowables.append(Paragraph(text, normal_paragraph))
            return

        # Handle block-level tags:
        if element.name in ["h1", "h2", "h3", "h4"]:
            # Map heading tags to styles
            style = heading1 if element.name == "h1" else heading2
            flowables.append(Paragraph(element.get_text(), style))
            flowables.append(Spacer(1, 6))

        elif element.name == "p":
            flowables.append(Paragraph(element.get_text(), normal_paragraph))
            flowables.append(Spacer(1, 6))

        elif element.name in ["ul", "ol"]:
            list_items = []
            for li in element.find_all("li", recursive=False):
                # Each <li> might have nested elements
                li_content = li.get_text()
                list_items.append(ListItem(Paragraph(li_content, normal_paragraph)))
            flowables.append(ListFlowable(list_items, bulletType="bullet" if element.name == "ul" else "1"))

        else:
            # For any other tag, just parse its children
            for child in element.children:
                parse_element(child)

    # 5) Parse top-level children of the HTML (body)
    for child in soup.children:
        parse_element(child)

    # 6) Build the PDF
    doc.build(flowables)
    pdf_buffer.seek(0)

    # 7) Upload PDF to S3
    upload_to_s3(pdf_buffer.getvalue(), s3_key, content_type="application/pdf")

    # 8) Update status file, etc. (same as in your current code)
    project_id = s3_key.split("/")[0]
    report_name = s3_key.split("/")[1].replace(".pdf", "")
    pdf_link = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}"
    update_status_file(project_id, report_name, "completed", pdf_link=pdf_link)

    print(f"Uploaded PDF to s3://{BUCKET_NAME}/{s3_key}")


async def open_pdf(s3_key):
    webbrowser.open(f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com/crowd-fund-analysis/{s3_key}")
