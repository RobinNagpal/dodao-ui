from flask import Flask, render_template, request, redirect, url_for
from dotenv import load_dotenv
import os
import subprocess

app = Flask(__name__)
load_dotenv()
BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
REGION=os.getenv("AWS_DEFAULT_REGION")

@app.route("/")
def index():
    """
    Renders the home page with the form.
    """
    return render_template("form.html")




@app.route("/submit", methods=["POST"])
def submit():
    """
    Handles form submission, starts processing, and redirects to the status page.
    """
    # Retrieve form data
    project_name = request.form.get("project_name").strip()
    crowdfunding_link = request.form.get("crowdfunding_link").strip()
    website_url = request.form.get("website_url").strip()
    latest_sec_filing_link = request.form.get("latest_sec_filing_link").strip()
    additional_links = request.form.getlist("additional_links")  # Collect additional links

    # Prepare the project ID
    project_id = project_name.replace(" ", "_").lower()

    # Prepare the command to start processing
    command = [
        "poetry", "run", "python", "cf_analysis_agent/controller.py",
        project_name,
        crowdfunding_link,
        website_url,
        latest_sec_filing_link,
    ]
    if additional_links:
        command.extend(["--additional_links", ",".join(additional_links)])

    # Run the command asynchronously
    subprocess.Popen(command)

    # Redirect to the status page with the project ID
    return redirect(url_for("status", project_id=project_id))


@app.route("/status/<project_id>")
def status(project_id):
    """
    Render the status monitoring page.
    """
    bucket_url = f"https://{BUCKET_NAME}.s3.{REGION}.amazonaws.com"
    print(bucket_url)
    return render_template("status.html", project_id=project_id, bucket_url=bucket_url)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
