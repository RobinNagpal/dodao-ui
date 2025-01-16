from flask import Flask, render_template, request, redirect, url_for
import subprocess

app = Flask(__name__)

@app.route("/")
def index():
    """
    Renders the home page with the form.
    """
    return render_template("form.html")


@app.route("/submit", methods=["POST"])
def submit():
    """
    Handles form submission and executes `controller.py` with the provided inputs.
    """
    # Retrieve form data
    project_name = request.form.get("project_name").strip()
    crowdfunding_link = request.form.get("crowdfunding_link").strip()
    website_url = request.form.get("website_url").strip()
    latest_sec_filing_link = request.form.get("latest_sec_filing_link").strip()
    additional_links = request.form.getlist("additional_links")  # Collect all additional links as a list

    # Wrap each argument in double quotes to handle spaces or special characters
    command = [
        "poetry", "run", "python", "cf_analysis_agent/controller.py",
        project_name,
        crowdfunding_link,
        website_url,
        latest_sec_filing_link,
    ]

    # Add `--additional_links` argument if additional links exist
    if additional_links:
        links_str = ",".join(additional_links)
        command.extend(["--additional_links", links_str])  # Pass as separate arguments

    print("Executing command:", " ".join(command))

    try:
        # Run the command
        result = subprocess.run(command, capture_output=True, text=True)

        # Check the return code
        if result.returncode == 0:
            print("Command executed successfully.")
            return f"<h2>Success!</h2><pre>{result.stdout}</pre>"
        else:
            print("Command failed to execute.")
            return f"<h2>Error!</h2><pre>{result.stderr}</pre>"
    except Exception as e:
        # Handle unexpected errors
        print("Exception occurred while running the command:", str(e))
        return f"<h2>Exception Occurred</h2><pre>{str(e)}</pre>"


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
