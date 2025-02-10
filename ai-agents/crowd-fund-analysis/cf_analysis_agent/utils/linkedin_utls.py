import traceback
from typing import List, Dict, Any

import requests
from linkedin_scraper import Person, actions
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from typing_extensions import TypedDict

from cf_analysis_agent.utils.env_variables import LINKEDIN_EMAIL, LINKEDIN_PASSWORD, PROXYCURL_API_KEY


class TeamMemberLinkedinUrl(TypedDict):
    id: str
    name: str
    url: str


class RawLinkedinProfile(TypedDict):
    id: str
    name: str
    profile: Dict[str, Any]



def scrape_linkedin_with_proxycurl(member: list[TeamMemberLinkedinUrl]) -> list[RawLinkedinProfile]:
    raw_profiles: List[RawLinkedinProfile] = []
    for member in member:
        # Set the authorization header using your API key
        headers = {'Authorization': f'Bearer {PROXYCURL_API_KEY}'}

        # API endpoint for retrieving a LinkedIn person profile
        api_endpoint = 'https://nubela.co/proxycurl/api/v2/linkedin'
        linkedin_url = member.get('url')

        # Set up the parameters. Note that you should include only one of:
        # 'linkedin_profile_url', 'twitter_profile_url', or 'facebook_profile_url'
        params = {
            'linkedin_profile_url': linkedin_url,
            'extra': 'include',
            'github_profile_id': 'include',
            'facebook_profile_id': 'include',
            'twitter_profile_id': 'include',
            'personal_contact_number': 'include',
            'personal_email': 'include',
            'inferred_salary': 'include',
            'skills': 'include',
            'use_cache': 'if-present',
            'fallback_to_cache': 'on-error',
        }

        # Make the GET request to the API
        response = requests.get(api_endpoint, headers=headers, params=params)

        # Check if the request was successful
        if response.status_code == 200:
            profile = response.json()
            print(f"Downloaded profile from url: {linkedin_url} : {profile}")
            #  see - https://nubela.co/proxycurl/docs#people-api-person-profile-endpoint
            raw_profiles.append({
                "id": member.get('id'),
                "name": member.get('name'),
                "profile": profile
            })

        else:
            # Print error details and raise an exception if needed
            print(f"Error fetching profile: {linkedin_url}: ", response.status_code, response.text)
            # response.raise_for_status()


    return raw_profiles


def scrape_linkedin_with_linkedin_scraper(linkedin_urls: list[TeamMemberLinkedinUrl]) -> list[RawLinkedinProfile]:
    """
    Uses linkedin_scraper to retrieve LinkedIn profile data based on the URLs

    If a team member has no LinkedIn URL (empty string), their profile will be empty.
    """

    # Setup Selenium WebDriver
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")  # Disable GPU for better compatibility
    chrome_options.add_argument("--window-size=1920,1080")  # Optional: Set window size
    chrome_options.add_argument("--disable-dev-shm-usage")  # Overcome limited resources in containerized environments
    chrome_options.add_argument("--no-sandbox")  # Bypass OS security model (use with caution)

    driver = webdriver.Chrome(options=chrome_options)
    actions.login(driver, LINKEDIN_EMAIL, LINKEDIN_PASSWORD)

    def scrape_linkedin_profile(url: str) -> Dict[str, Any]:
        if not url:
            return {}
        try:
            # Scrape the LinkedIn profile using linkedin_scraper
            # Login to LinkedIn
            person = Person(url, driver=driver, scrape=False)
            person.scrape(close_on_complete=False)

            # Collect profile details
            return {
                "name": person.name,
                "experiences": person.experiences,
                "educations": person.educations,
            }
        except Exception as e:
            print(traceback.format_exc())
            return {}

    # Iterate through the LinkedIn URLs and scrape profiles
    raw_profiles: List[RawLinkedinProfile] = []
    for member in linkedin_urls:
        profile_data = scrape_linkedin_profile(member["url"])
        raw_profiles.append({
            "id": member.get('id'),
            "name": member.get('name'),
            "profile": profile_data
        })
    # Close the driver
    driver.quit()

    return raw_profiles
