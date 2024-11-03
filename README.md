
# Price2Produce
#### Video Demo:  <[URL HERE](https://youtu.be/2HR1EmzOlyo)>
**Price2Produce** is a web application designed to help users compare grocery prices across various stores using web scraping. The app is built with Flask and SQLite, using Selenium with Firefox to retrieve real-time product prices from different stores, making it easier to find the best deals.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Prerequisites](#prerequisites)
3. [Setup Instructions](#setup-instructions)
   - [Clone the Repository](#clone-the-repository)
   - [Set Up Python Environment](#set-up-python-environment)
   - [Install Firefox](#install-firefox)
   - [Install Geckodriver](#install-geckodriver)
   - [Configure Environment Variables](#configure-environment-variables)
   - [Set Up Database](#set-up-database)
4. [Running the Application](#running-the-application)
5. [Troubleshooting](#troubleshooting)

---

## Project Overview

Price2Produce provides users with an intuitive platform to compare prices for grocery items across multiple stores by using real-time data scraping. It leverages the Flask framework for web handling and the SQLite database for storing session and scraping data. 

---

## Prerequisites

Before setting up and running Price2Produce, make sure you have the following installed on your system:

- **Python 3.6+**: This project requires Python for managing dependencies and running the server.
- **Firefox Browser**: Needed for Selenium to simulate a browser environment.
- **Geckodriver**: Required for Selenium to control the Firefox browser.

---

## Setup Instructions

### Step 1: Clone the Repository

First, clone the project repository to your local machine.

```bash
git clone https://github.com/username/Price2Produce.git
cd Price2Produce
