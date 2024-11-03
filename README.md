
# Price2Produce
#### Video Demo:  <[URL HERE](https://youtu.be/2HR1EmzOlyo)>

Price2Produce is a web scraping application built with Flask that enables users to compare prices of grocery items across various online stores. This project uses Selenium to automate scraping and requires Firefox along with the Geckodriver.

---

## Table of Contents
- [Project Setup](#project-setup)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Usage](#usage)
- [Environment Variables](#environment-variables)

---

### Project Setup

Before starting, ensure you have the following requirements installed and configured on your system:
- **Python 3.7+**
- **pip** for package management
- **SQLite3** for local database management
- **Firefox** (Web Browser)
- **Geckodriver** (WebDriver for Firefox)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/Price2Produce.git
   cd Price2Produce
   ```

2. **Install dependencies:**
   Use pip to install required packages. Ensure you are in the project's root directory.
   ```bash
   pip install -r requirements.txt
   ```

3. **Download and Install Firefox:**
   - **macOS/Linux:** Firefox can be downloaded from [here](https://www.mozilla.org/en-US/firefox/new/). Follow the installation instructions provided on the Firefox website.
   - **Windows:** Download the installer and follow the on-screen instructions.

4. **Download and Setup Geckodriver:**

   - Download Geckodriver compatible with your OS from [Geckodriver releases](https://github.com/mozilla/geckodriver/releases).
   - Extract the downloaded file and place the Geckodriver executable in a directory accessible by your system PATH, or note the path for later use.
   
   **Tip:** On macOS/Linux, you can move Geckodriver to `/usr/local/bin` to make it globally accessible.

5. **Setting up Geckodriver path:**
   Set the `GECKODRIVER_PATH` in your code to the absolute path where you saved the Geckodriver. For example:
   ```python
   GECKODRIVER_PATH = '/path/to/your/geckodriver'
   ```

### Running the Application

To run Price2Produce, you must first ensure your environment variables are set up, followed by running the Flask application.

1. **Set Environment Variables:**

   This application requires a secret key for secure session management. To set up the environment variable for your session key, use the following command:

   ```bash
   export SECRET_KEY="your_secret_key"
   ```

   For Windows:
   ```cmd
   set SECRET_KEY="your_secret_key"
   ```

2. **Initialize Database (if needed):**
   If `p2p.db` does not exist, it will be automatically created, but ensure you have the right schema set up.

3. **Run the Application:**
   Start the Flask application:
   ```bash
   python app.py
   ```

   **Access the app** by navigating to `http://127.0.0.1:5000` in your browser.

### Usage

1. **Navigating the Web App:**
   - Go to the **Home page** where you can input grocery items.
   - Select your preferred stores and click **Search** to begin price comparison.

2. **Scraping Process:**
   When you select a store, the app uses Selenium to log in to that store and scrape relevant price data.

3. **Viewing Results:**
   - The scraped price data is displayed in the **Prices page**, sorted by store.

### Troubleshooting

- **Browser does not launch in headless mode:**
  Ensure the path to Geckodriver is correct in the code.

- **Environment variable issues:**
  Double-check your `SECRET_KEY` environment variable if facing login/session issues.

### Environment Variables

- **SECRET_KEY** - Required for Flask session management.
- **GECKODRIVER_PATH** - Specify the path to your Geckodriver executable.

---
